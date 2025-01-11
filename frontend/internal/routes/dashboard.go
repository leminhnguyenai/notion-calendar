package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/middlewares"
)

func serveJS(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/scripts/dashboard.js")
}

func DashboardRouter() *api.Router {
	router := api.NewRouter()

	router.GET(
		"/",
		middlewares.ValidateToken(api.CustomHandlerFunc(controllers.Dashboard)),
	)
	router.GET("/script", http.HandlerFunc(serveJS))

	return router
}
