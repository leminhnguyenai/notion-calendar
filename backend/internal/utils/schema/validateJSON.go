package schema

import (
	"fmt"

	"github.com/xeipuuv/gojsonschema"
)

func ValidateJSON(schemaPath string, jsonData []byte) error {
	schema := gojsonschema.NewReferenceLoader("file://" + schemaPath)
	document := gojsonschema.NewBytesLoader(jsonData)

	result, err := gojsonschema.Validate(schema, document)
	if err != nil {
		return err
	}

	if !result.Valid() {
		for _, desc := range result.Errors() {
			fmt.Printf("- %s\n", desc)
		}
		return fmt.Errorf("Invalid JSON")
	}

	return nil
}
