package routes

import (
	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/authcontroller"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func Auth() *api.Router {
	r := api.NewRouter()

	r.GET("/google/callback", api.CustomHandlerFunc(GoogleAuthCallback))

	return r
}
