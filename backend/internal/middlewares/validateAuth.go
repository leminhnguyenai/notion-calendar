package middlewares

import (
	"context"
	"net/http"
	"strings"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
)

func ValidateAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		googleRefreshToken := authHeader[len("Bearer "):]

		sqlDb, err := NewDb()
		if err != nil {
			http.Error(
				w,
				"Error retreiving authentication from Database",
				http.StatusInternalServerError,
			)
			return
		}

		rows, err := sqlDb.GetUser(googleRefreshToken)
		if err != nil {
			http.Error(
				w,
				"Database error",
				http.StatusInternalServerError,
			)
		}

		rowsCount := 0
		for rows.Next() {
			rowsCount++
		}

		if rowsCount != 1 {
			http.Error(
				w,
				"Error validating token",
				http.StatusUnauthorized,
			)
			return
		}

		ctx := context.WithValue(
			r.Context(),
			"googleRefreshToken",
			googleRefreshToken,
		)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
