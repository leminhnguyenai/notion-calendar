package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services/api"
)

func serveJS(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/dashboard.js")
}

func DashboardRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/", http.HandlerFunc(controllers.Dashboard))
	router.GET("/script", http.HandlerFunc(serveJS))

	return router
}
