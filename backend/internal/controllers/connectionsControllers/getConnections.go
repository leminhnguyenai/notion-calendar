package connectionscontrollers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
)

func GetConnections(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	googleRefreshToken, ok := r.Context().Value("googleRefreshToken").(string)
	if !ok || googleRefreshToken == "" {
		http.Error(
			w,
			"Can't find user google refresh token",
			http.StatusInternalServerError,
		)
		return
	}

	sql, err := db.InitDb()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	connService := services.NewConnService(sql)

	var userId string

	err = sql.QueryRow(
		"SELECT user_id FROM users WHERE google_refresh_token = ?",
		googleRefreshToken,
	).
		Scan(&userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	notionConns, err := connService.GetConns(ctx, userId)
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
