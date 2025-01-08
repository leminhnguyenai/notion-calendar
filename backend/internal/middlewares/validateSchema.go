package middlewares

import (
	"bytes"
	"io"
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
	"github.com/xeipuuv/gojsonschema"
)

func InitSchemaValidation(
	schemaPath string,
) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return api.CustomHandlerFunc(func(w http.ResponseWriter, r *http.Request) error {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				return err
			}

			r.Body = io.NopCloser(bytes.NewReader(body))

			schema := gojsonschema.NewReferenceLoader("file://" + schemaPath)
			document := gojsonschema.NewBytesLoader(body)

			result, err := gojsonschema.Validate(schema, document)
			if err != nil {
				return err
			}

			if !result.Valid() {
				errors := []string{}
				for _, desc := range result.Errors() {
					errors = append(errors, desc.String())
				}
				return api.JSONSchemaInvalidation(errors)
			}

			defer next.ServeHTTP(w, r)

			return nil
		})
	}
}
