package routes

import (
	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/authcontroller"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func AuthRouter() *api.Router {
	r := api.NewRouter()

	r.GET("/google/callback", api.CustomHandlerFunc(GoogleAuthCallback))
	r.GET(
		"/notion/callback",
		middlewares.ValidateToken(api.CustomHandlerFunc(NotionAuthCallback)),
	)

	return r
}
