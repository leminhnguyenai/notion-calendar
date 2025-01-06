package connectionscontrollers

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/encryption"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/validate"
)

func PostConnection(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	jwtToken, ok := r.Context().Value("jwtToken").(*validate.JWTToken)
	if !ok || jwtToken == nil {
		http.Error(
			w,
			"Can't find user JWT token",
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

	connectionId, err := encryption.Encrypt(calendarId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	sql, err := db.InitDb()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	connService := services.NewConnService(sql)

	userId := jwtToken.Sub
	log.Println(userId)

	err = connService.CreateNewConn(ctx, models.NotionConn{
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
