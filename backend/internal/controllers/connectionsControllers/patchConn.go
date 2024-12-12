package connectionscontrollers

import (
	"encoding/json"
	"io"
	"net/http"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
)

func PatchConn(w http.ResponseWriter, r *http.Request) {
	refreshToken, ok := r.Context().Value("refreshToken").(string)
	if !ok || refreshToken == "" {
		http.Error(
			w,
			"Can't find user refresh token",
			http.StatusInternalServerError,
		)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var requestBody struct {
		ConnectionId string                     `json:"connectionId"`
		Connection   models.UserInputNotionConn `json:"connection"`
	}

	err = json.Unmarshal(body, &requestBody)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if requestBody.ConnectionId == "" {
		http.Error(w, "No connection id provided", http.StatusBadRequest)
	}

	sqlDb, err := NewDb()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = sqlDb.UpdateConn(requestBody.ConnectionId, requestBody.Connection)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(map[string]interface{}{
		"message": "Connection updated successfully",
	})
}
