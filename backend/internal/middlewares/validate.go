package middlewares

import (
	"context"
	"log"
	"net/http"
	"strings"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
)

func Validate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		refreshToken := authHeader[len("Bearer "):]

		db, err := InitDb()
		if err != nil {
			http.Error(
				w,
				"Error retreiving authentication from Database",
				http.StatusInternalServerError,
			)
			return
		}
		defer db.Close()

		q, err := db.Prepare("SELECT * FROM users WHERE refresh_token = ?")
		if err != nil {
			http.Error(
				w,
				"Server error",
				http.StatusInternalServerError,
			)
			log.Println(err)
			return
		}
		defer q.Close()

		rows, err := q.Query(refreshToken)
		if err != nil {
			http.Error(
				w,
				"Server error",
				http.StatusInternalServerError,
			)
			log.Println(err)
			return
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

		ctx := context.WithValue(r.Context(), "refreshToken", refreshToken)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
