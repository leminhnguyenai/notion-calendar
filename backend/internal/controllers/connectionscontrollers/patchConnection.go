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
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
)

func PatchConnection(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}

	var requestBody struct {
		ConnectionId string                     `json:"connection_id"`
		Connection   models.UserInputNotionConn `json:"connection"`
	}

	err = json.Unmarshal(body, &requestBody)
	if err != nil {
		return err
	}
	if requestBody.ConnectionId == "" {
		return api.InvalidRequest("No connection id provided")
	}

	db, err := sql.Open("mysql", config.GetDbUrl())
	if err != nil {
		return err
	}

	connService := services.NewConnService(db)

	err = connService.UpdateConn(
		ctx,
		requestBody.ConnectionId,
		requestBody.Connection,
	)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(map[string]interface{}{
		"message": "Connection updated successfully",
	})

	return nil
}
