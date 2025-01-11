package routes

import (
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers/landingpagecontroller"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
)

func LandingPageRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/", api.CustomHandlerFunc(landingpagecontroller.LandingPage))

	return router
}
