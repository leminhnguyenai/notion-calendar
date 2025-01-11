package middlewares

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

// TODO: Add mechanism for checking and blacklisting expired JWT token
func ValidateToken(next http.Handler) http.Handler {
	return api.CustomHandlerFunc(func(w http.ResponseWriter, r *http.Request) error {
		secretKey := os.Getenv("JWT_SECRET_KEY")

		authHeader := r.Header.Get("Authorization")

		if !strings.HasPrefix(authHeader, "Bearer ") {
			return api.JWTUnauthorizedError()
		}

		tokenString := authHeader[len("Bearer "):]

		claims, err := cryptography.VerifyToken(tokenString, secretKey)
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
	})
}
