package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers/usercontrollers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/middlewares"
)

func LoginRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/google", http.HandlerFunc(usercontrollers.GoogleLogin))
	router.GET(
		"/notion",
		middlewares.ValidateToken(
			http.HandlerFunc(usercontrollers.NotionLogin),
		),
	)

	return router
}
