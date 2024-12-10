package connectionscontrollers

import (
	"io"
	"log"
	"net/http"
	"path"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/schema"
)

// TODO: Validate the json schema
func PostConns(r *http.Request) (int, map[string]interface{}) {
	refreshToken, ok := r.Context().Value("refreshToken").(string)
	if !ok || refreshToken == "" {
		return http.StatusUnauthorized, map[string]interface{}{
			"error": "Failed retrieving user's refresh token",
		}
	}

	dirname, err := filehandling.GetDirname()
	if err != nil {
		return http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		}
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		}
	}

	// var requestBody struct {
	// 	Connection models.UserInputNotionConn `json:"connection"`
	// }

	err = schema.ValidateJSON(
		path.Join(dirname, ".././internal/schemas/userInputNotionConn.json"),
		body,
	)
	if err != nil {
		return http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		}
	}
	// FIX: Figure out why the shcema doesn't match with the request

	log.Println("The request is valid")

	return http.StatusOK, map[string]interface{}{
		"message": "The request is valid",
	}
}
