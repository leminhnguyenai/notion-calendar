package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services/api"
)

func LoginRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/google", http.HandlerFunc(controllers.GoogleLogin))

	return router
}
