package connectionscontrollers

import (
	"encoding/json"
	"io"
	"net/http"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
)

func DeleteConnection(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var requestBody struct {
		ConnectionId string `json:"connectionId"`
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

	err = sqlDb.DeleteConn(requestBody.ConnectionId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(map[string]interface{}{
		"message": "Connection deleted successfully",
	})
}
