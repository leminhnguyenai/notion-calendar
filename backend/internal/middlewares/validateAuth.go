package middlewares

import (
	"context"
	"net/http"
	"strings"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
)

func ValidateAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		googleRefreshToken := authHeader[len("Bearer "):]

		ctx := context.WithValue(
			r.Context(),
			"googleRefreshToken",
			googleRefreshToken,
		)

		sql, err := db.InitDb()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer sql.Close()

		userService := services.NewUserService(sql)

		_, err = userService.GetUser(ctx, googleRefreshToken)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
