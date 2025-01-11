package routes

import (
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
)

func LandingPageRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/", api.CustomHandlerFunc(controllers.LandingPage))

	return router
}
