package middlewares

import (
	"context"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
)

// TODO: Add mechanism for checking and blacklisting expired JWT token
func saveTokenFromBackend(
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

func ValidateToken(next http.Handler) http.Handler {
	return api.CustomHandlerFunc(
		func(w http.ResponseWriter, r *http.Request) error {
			backendCookie, _ := r.Cookie("token_from_backend")
			if backendCookie != nil {
				err := saveTokenFromBackend(w, r, backendCookie)
				if err != nil {
					return err
				}

				return nil
			}

			secretKey := os.Getenv("JWT_SECRET_KEY")

			cookie, err := r.Cookie("token")
			if err != nil {
				return api.JWTFailedToRetrieveError()
			}

			tokenString := cookie.Value

			_, err = cryptography.VerifyToken(tokenString, secretKey)
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
