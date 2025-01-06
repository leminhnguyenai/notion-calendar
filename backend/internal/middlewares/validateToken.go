package middlewares

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/validate"
)

// TODO: Add mechanism for checking and blacklisting expired JWT token
func ValidateToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secretKey := os.Getenv("JWT_SECRET_KEY")

		authHeader := r.Header.Get("Authorization")

		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		tokenString := authHeader[len("Bearer "):]

		claims, err := validate.VerifyToken(tokenString, secretKey)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		jwtToken, err := validate.ParseJWTToken(claims)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
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
