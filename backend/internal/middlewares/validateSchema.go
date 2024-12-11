package middlewares

import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	"github.com/xeipuuv/gojsonschema"
)

func InitSchemaValidation(
	schemaPath string,
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

			r.Body = io.NopCloser(bytes.NewReader(body))

			schema := gojsonschema.NewReferenceLoader("file://" + schemaPath)
			document := gojsonschema.NewBytesLoader(body)

			result, err := gojsonschema.Validate(schema, document)
			if err != nil {
				http.Error(
					w,
					"err: "+err.Error(),
					http.StatusInternalServerError,
				)
				return
			}

			if !result.Valid() {
				for _, desc := range result.Errors() {
					fmt.Printf("- %s\n", desc)
				}
				http.Error(w, "Invalid JSON", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
