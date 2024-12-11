package connectionscontrollers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path"
	"time"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	customerrors "github.com/leminhnguyenai/notion-calendar/backend/internal/utils/customErrors"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/encryption"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/schema"
)

func PostConns(r *http.Request) (int, map[string]interface{}) {
	refreshToken, ok := r.Context().Value("refreshToken").(string)
	if !ok || refreshToken == "" {
		return customerrors.ServerError(
			fmt.Errorf("Failed retrieving user's refresh token"),
		)
	}

	dirname, err := filehandling.GetDirname()
	if err != nil {
		return customerrors.ServerError(err)
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return customerrors.ServerError(err)
	}

	err = schema.ValidateJSON(
		path.Join(dirname, ".././internal/schemas/userInputNotionConn.json"),
		body,
	)
	if err != nil {
		return customerrors.ServerError(err)
	}

	var requestBody struct {
		Connection models.UserInputNotionConn `json:"connection"`
	}

	err = json.Unmarshal(body, &requestBody)
	if err != nil {
		return customerrors.ServerError(err)
	}

	// TODO: Change this later when adding Google Calendar API operations
	calendarId := "Skibidi"

	connectionId, err := encryption.GenerateHash(
		calendarId + time.Now().String(),
	)
	if err != nil {
		return customerrors.ServerError(err)
	}

	sqlDb, err := NewDb()
	if err != nil {
		return customerrors.ServerError(err)
	}

	var userId string

	err = sqlDb.Db.QueryRow(
		"SELECT user_id FROM users WHERE refresh_token = ?", refreshToken).
		Scan(&userId)
	if err != nil {
		return customerrors.ServerError(err)
	}

	err = sqlDb.CreateNewConn(models.NotionConnection{
		UserInputNotionConn: requestBody.Connection,
		ConnectionId:        connectionId,
		CalendarId:          calendarId,
		UserId:              userId,
		NextExecTime:        time.Now(),
	})
	if err != nil {
		return customerrors.ServerError(err)
	}

	return http.StatusOK, map[string]interface{}{}
}
