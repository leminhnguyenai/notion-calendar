package connectionscontrollers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/apierror"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/validate"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
)

func GetConnections(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	jwtToken, ok := r.Context().Value("jwtToken").(*validate.JWTToken)
	if !ok || jwtToken == nil {
		apierror.SendError(w, r, fmt.Errorf("Can't find user JWT token"))
		return
	}

	sql, err := db.InitDb()
	if err != nil {
		apierror.SendError(w, r, err)
		return
	}

	connService := services.NewConnService(sql)

	userId := jwtToken.Sub

	notionConns, err := connService.GetConns(ctx, userId)
	if err != nil {
		apierror.SendError(w, r, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(notionConns)
}
