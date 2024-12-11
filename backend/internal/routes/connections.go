package routes

import (
	"net/http"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/connectionsControllers"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

// TODO: Add GET connections route (Without Google API interaction)
// TODO: Add PATCH connections route (Without Google API interaction)
// TODO: Add DELETE connections route (Without Google API interaction)

func Connections() *api.Router {
	router := api.NewRouter()

	router.Use(middlewares.ValidateAuth)

	// router.GET("/", GetConns)
	router.POST("/", http.HandlerFunc(PostConns))

	return router
}
