package connectionscontrollers

import (
	"context"
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
)

func PostConnection(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	jwtToken, ok := r.Context().Value("jwtToken").(*cryptography.JWTToken)
	if !ok || jwtToken == nil {
		return api.JWTFailedToRetrieveError()
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}

	var requestBody struct {
		Connection models.UserInputNotionConn `json:"connection"`
	}

	err = json.Unmarshal(body, &requestBody)
	if err != nil {
		return err
	}

	// TODO: Change this later when adding Google Calendar API operations
	calendarId := "Skibidi"

	connectionId, err := cryptography.Encrypt(calendarId)
	if err != nil {
		return err
	}

	db, err := sql.Open("mysql", config.GetDbUrl())
	if err != nil {
		return err
	}

	connService := services.NewConnService(db)

	userId := jwtToken.Sub

	err = connService.CreateNewConn(ctx, models.NotionConn{
		UserInputNotionConn: requestBody.Connection,
		ConnectionId:        connectionId,
		CalendarId:          calendarId,
		UserId:              userId,
		NextExecTime:        time.Now(),
	})
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(map[string]interface{}{
		"message": "Connection added successfully",
	})

	return nil
}
