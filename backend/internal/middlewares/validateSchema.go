package middlewares

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/schema"
)

func InitSchemaValidation(
	schemaPath string,
	requestBody interface{},
) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(
					w,
					"err: "+err.Error(),
					http.StatusInternalServerError,
				)
				return
			}

			err = schema.ValidateJSON(schemaPath, body)
			if err != nil {
				http.Error(
					w,
					"err: "+err.Error(),
					http.StatusUnauthorized,
				)
				return
			}

			err = json.Unmarshal(body, &requestBody)
			if err != nil {
				http.Error(
					w,
					"err: "+err.Error(),
					http.StatusInternalServerError,
				)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
