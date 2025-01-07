package middlewares

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/validate"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

// TODO: Add mechanism for checking and blacklisting expired JWT token
func ValidateToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secretKey := os.Getenv("JWT_SECRET_KEY")

		authHeader := r.Header.Get("Authorization")

		if !strings.HasPrefix(authHeader, "Bearer ") {
			api.SendError(w, r, api.JWTUnauthorizedError())
			return
		}

		tokenString := authHeader[len("Bearer "):]

		claims, err := validate.VerifyToken(tokenString, secretKey)
		if err != nil {
			api.SendError(w, r, err)
			return
		}

		jwtToken, err := validate.ParseJWTToken(claims)
		if err != nil {
			api.SendError(w, r, err)
			return
		}

		ctx := context.WithValue(
			r.Context(),
			"jwtToken",
			jwtToken,
		)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
