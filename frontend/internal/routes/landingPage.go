package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services/api"
)

func LandingPageRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/", http.HandlerFunc(controllers.LandingPage))

	return router
}
