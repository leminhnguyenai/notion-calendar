package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/middlewares"
)

func LoginRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/google", http.HandlerFunc(controllers.GoogleLogin))
	router.GET(
		"/notion",
		middlewares.ValidateToken(http.HandlerFunc(controllers.NotionLogin)),
	)

	return router
}
