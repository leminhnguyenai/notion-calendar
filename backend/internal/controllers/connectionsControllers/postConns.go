package connectionscontrollers

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/encryption"
)

func PostConns(w http.ResponseWriter, r *http.Request) {
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
		Connection models.UserInputNotionConn `json:"connection"`
	}

	err = json.Unmarshal(body, &requestBody)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO: Change this later when adding Google Calendar API operations
	calendarId := "Skibidi"

	connectionId, err := encryption.GenerateHash(
		calendarId + time.Now().String(),
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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

	err = sqlDb.CreateNewConn(models.NotionConnection{
		UserInputNotionConn: requestBody.Connection,
		ConnectionId:        connectionId,
		CalendarId:          calendarId,
		UserId:              userId,
		NextExecTime:        time.Now(),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Connection added successfully"))
}
