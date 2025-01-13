package routes

import (
	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/authcontroller"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
)

func AuthRouter() *api.Router {
	r := api.NewRouter()

	r.GET("/google/callback", api.CustomHandlerFunc(GoogleAuthCallback))
	r.GET("/notion/callback", api.CustomHandlerFunc(NotionAuthCallback))

	return r
}
