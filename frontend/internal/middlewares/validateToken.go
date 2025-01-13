package middlewares

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services"
)

func deleteCookie(w http.ResponseWriter, cookieName string) {
	deletedCookie := &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, deletedCookie)
}

func saveCookie(w http.ResponseWriter, name string, maxAge int, value string) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, cookie)
}

// TODO: Add mechanism for checking and blacklisting expired JWT token
func saveJWTToken(
	w http.ResponseWriter,
	r *http.Request,
	backendCookie *http.Cookie,
) error {
	tokenString := backendCookie.Value

	deleteCookie(w, "token_from_backend")
	saveCookie(w, "token", 120, tokenString)

	http.Redirect(w, r, "/dashboard", http.StatusTemporaryRedirect)

	return nil
}

func updateJWTToken(
	w http.ResponseWriter,
	r *http.Request,
	notionTokenCookie *http.Cookie,
	claims jwt.MapClaims,
) error {
	ctx, cancel := context.WithTimeout(context.Background(), config.DbTimeout)
	defer cancel()

	notionId := r.URL.Query().Get("notion-id")

	notionAccessToken := notionTokenCookie.Value

	jwtToken, err := cryptography.ParseJWTToken(claims)
	if err != nil {
		return err
	}

	db, err := sql.Open("mysql", config.GetDbUrl())
	if err != nil {
		return err
	}

	err = services.NewUserService(db).
		SaveUserNotionId(ctx, jwtToken.Sub, notionId)
	if err != nil {
		return err
	}

	updatedJWTTokenString, err := cryptography.CreateJWTToken(
		jwtToken.Sub,
		jwtToken.GoogleRefreshToken,
		notionAccessToken,
		os.Getenv("JWT_SECRET_KEY"),
	)
	if err != nil {
		return err
	}

	deleteCookie(w, "notion_access_token")
	saveCookie(w, "token", 120, updatedJWTTokenString)

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

			cookie, err := r.Cookie("token")
			if err != nil {
				return api.JWTFailedToRetrieveError()
			}

			tokenString := cookie.Value

			claims, err := cryptography.VerifyJWTToken(
				tokenString,
				os.Getenv("JWT_SECRET_KEY"),
			)
			if err != nil {
				return err
			}

			notionTokenCookie, err := r.Cookie("notion_access_token")
			if !errors.Is(err, http.ErrNoCookie) {
				err = updateJWTToken(w, r, notionTokenCookie, claims)
				if err != nil {
					return err
				}

				return nil
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
