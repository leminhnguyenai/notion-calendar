package middlewares

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/cryptography"
)

// TODO: Add mechanism for checking and blacklisting expired JWT token
func ValidateToken(next http.Handler) http.Handler {
	return api.CustomHandlerFunc(
		func(w http.ResponseWriter, r *http.Request) error {
			if !strings.HasPrefix(r.Header.Get("Authorization"), "Bearer ") {
				return api.JWTUnauthorizedError()
			}

			tokenString := r.Header.Get("Authorization")[len("Bearer "):]

			claims, err := cryptography.VerifyJWTToken(
				tokenString,
				os.Getenv("JWT_SECRET_KEY"),
			)
			if err != nil {
				return err
			}

			jwtToken, err := cryptography.ParseJWTToken(claims)
			if err != nil {
				return err
			}

			ctx := context.WithValue(
				r.Context(),
				"jwtToken",
				jwtToken,
			)

			defer next.ServeHTTP(w, r.WithContext(ctx))

			return nil
		},
	)
}
