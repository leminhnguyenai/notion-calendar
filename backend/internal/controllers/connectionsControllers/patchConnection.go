package connectionscontrollers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/apierror"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
)

func PatchConnection(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		apierror.SendError(w, r, err)
		return
	}

	var requestBody struct {
		ConnectionId string                     `json:"connection_id"`
		Connection   models.UserInputNotionConn `json:"connection"`
	}

	err = json.Unmarshal(body, &requestBody)
	if err != nil {
		apierror.SendError(w, r, err)
		return
	}
	if requestBody.ConnectionId == "" {
		apiErr := apierror.InvalidRequest("No connection id provided")
		apierror.SendError(w, r, apiErr)
		return
	}

	sql, err := db.InitDb()
	if err != nil {
		apierror.SendError(w, r, err)
		return
	}

	connService := services.NewConnService(sql)

	err = connService.UpdateConn(
		ctx,
		requestBody.ConnectionId,
		requestBody.Connection,
	)
	if err != nil {
		apierror.SendError(w, r, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(map[string]interface{}{
		"message": "Connection updated successfully",
	})
}
