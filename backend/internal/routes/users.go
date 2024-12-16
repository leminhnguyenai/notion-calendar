package routes

import (
	"net/http"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/usersController"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func Users() *api.Router {
	router := api.NewRouter()

	// TODO: Add a route for notion/authentication
	router.GET("/google/login", http.HandlerFunc(GoogleLogin))
	router.GET(
		"/notion/login",
		middlewares.ValidateAuth(
			http.HandlerFunc(NotionLogin),
		),
	)

	return router
}
