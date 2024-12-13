package connectionscontrollers

import (
	"encoding/json"
	"net/http"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
)

func GetConnections(w http.ResponseWriter, r *http.Request) {
	refreshToken, ok := r.Context().Value("refreshToken").(string)
	if !ok || refreshToken == "" {
		http.Error(
			w,
			"Can't find user refresh token",
			http.StatusInternalServerError,
		)
		return
	}

	sqlDb, err := NewDb()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var userId string

	err = sqlDb.Db.QueryRow(
		"SELECT user_id FROM users WHERE refresh_token = ?", refreshToken).
		Scan(&userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	notionConns, err := sqlDb.GetConns(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(notionConns)
}
