package middlewares

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	customerrors "github.com/leminhnguyenai/notion-calendar/backend/internal/utils/customErrors"
)

func ValidateAuth(r *http.Request) (int, map[string]interface{}) {
	authHeader := r.Header.Get("Authorization")

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return http.StatusUnauthorized, map[string]interface{}{
			"error": "Unauthorized",
		}
	}

	refreshToken := authHeader[len("Bearer "):]

	sqlDb, err := NewDb()
	if err != nil {
		return customerrors.ServerError(err)
	}

	rows, err := sqlDb.GetUser(refreshToken)
	if err != nil {
		return customerrors.ServerError(err)
	}

	rowsCount := 0
	for rows.Next() {
		rowsCount++
	}

	if rowsCount != 1 {
		return customerrors.ServerError(
			fmt.Errorf("Can't find user credentials"),
		)
	}

	ctx := context.WithValue(r.Context(), "refreshToken", refreshToken)

	return http.StatusOK, map[string]interface{}{
		"request": r.WithContext(ctx),
	}
}
