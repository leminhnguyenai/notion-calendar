package routes

import (
	"net/http"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/authcontroller"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func Auth() *api.Router {
	router := api.NewRouter()

	router.GET("/google/callback", http.HandlerFunc(GoogleAuthCallback))

	return router
}
