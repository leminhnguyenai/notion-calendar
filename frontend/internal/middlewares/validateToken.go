package middlewares

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
)

// TODO: Add mechanism for checking and blacklisting expired JWT token
func saveJWTToken(
	w http.ResponseWriter,
	r *http.Request,
	backendCookie *http.Cookie,
) error {
	tokenString := backendCookie.Value

	newCookie := &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   120,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	deletedCookie := &http.Cookie{
		Name:     "token_from_backend",
		Value:    "",
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, deletedCookie)
	http.SetCookie(w, newCookie)

	http.Redirect(w, r, "/dashboard", http.StatusTemporaryRedirect)

	return nil
}

func updateJWTToken(
	w http.ResponseWriter,
	r *http.Request,
	notionTokenCookie *http.Cookie,
) error {
	parsedUrl, err := url.Parse(
		fmt.Sprintf(
			"http://localhost%s%s",
			os.Getenv("FRONTEND_PORT"),
			r.URL.String(),
		),
	)
	if err != nil {
		return err
	}

	queryParams := parsedUrl.Query()
	notionId := queryParams.Get("notion-id")

	notionAccessToken := notionTokenCookie.Value

	log.Printf("notion id: %s\n", notionId)
	log.Printf("notion access token: %s\n", notionAccessToken)

	deletedCookie := &http.Cookie{
		Name:     "notion_access_token",
		Value:    "",
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, deletedCookie)

	http.Redirect(w, r, "/dashboard", http.StatusFound)

	return nil
}

func ValidateToken(next http.Handler) http.Handler {
	return api.CustomHandlerFunc(
		func(w http.ResponseWriter, r *http.Request) error {
			backendCookie, err := r.Cookie("token_from_backend")
			if !errors.Is(err, http.ErrNoCookie) {
				err = saveJWTToken(w, r, backendCookie)
				if err != nil {
					return err
				}

				return nil
			}

			notionTokenCookie, err := r.Cookie("notion_access_token")
			if !errors.Is(err, http.ErrNoCookie) {
				err = updateJWTToken(w, r, notionTokenCookie)
				if err != nil {
					return err
				}

				return nil
			}

			cookie, err := r.Cookie("token")
			if err != nil {
				return api.JWTFailedToRetrieveError()
			}

			tokenString := cookie.Value

			_, err = cryptography.VerifyToken(
				tokenString,
				os.Getenv("JWT_SECRET_KEY"),
			)
			if err != nil {
				return err
			}

			ctx := context.WithValue(
				r.Context(),
				"token_string",
				tokenString,
			)

			defer next.ServeHTTP(w, r.WithContext(ctx))

			return nil
		},
	)
}
