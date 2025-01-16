package routes

import (
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers/dashboardcontroller"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/middlewares"
)

func DashboardRouter() *api.Router {
	router := api.NewRouter()

	router.GET(
		"/",
		middlewares.ValidateToken(
			api.CustomHandlerFunc(dashboardcontroller.Dashboard),
		),
	)

	return router
}
