package routes

import (
	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controller/authcontroller"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
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
