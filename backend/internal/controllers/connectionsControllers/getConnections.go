package connectionsControllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func GetConnections(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	jwtToken, ok := r.Context().Value("jwtToken").(*cryptography.JWTToken)
	if !ok || jwtToken == nil {
		return api.JWTFailedToRetrieveError()
	}

	sql, err := db.InitDb()
	if err != nil {
		return err
	}

	connService := services.NewConnService(sql)

	userId := jwtToken.Sub

	notionConns, err := connService.GetConns(ctx, userId)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(notionConns)

	return nil
}
