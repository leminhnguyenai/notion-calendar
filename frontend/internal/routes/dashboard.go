package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services/api"
)

func DashboardRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/", http.HandlerFunc(controllers.DashboardController))

	return router
}
