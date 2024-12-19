package connectionscontrollers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/encryption"
)

func PostConnection(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	googleRefreshToken, ok := r.Context().Value("googleRefreshToken").(string)
	if !ok || googleRefreshToken == "" {
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
		"SELECT user_id FROM users WHERE google_refresh_token = ?",
		googleRefreshToken,
	).
		Scan(&userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	err = sqlDb.CreateNewConn(ctx, models.NotionConn{
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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(map[string]interface{}{
		"message": "Connection added successfully",
	})
}
