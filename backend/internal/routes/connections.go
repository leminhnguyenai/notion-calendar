package routes

import (
	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/connectionsControllers"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

// TODO: Add GET connections route (Without Google API interaction)
// TODO: Add POST connections route (Without Google API interaction)
// TODO: Add PATCH connections route (Without Google API interaction)
// TODO: Add DELETE connections route (Without Google API interaction)

// FIX: Figure out why the why can't use "/" for POST
func Connections() *api.Router {
	router := api.NewRouter()

	router.Use(middlewares.Validate)

	// router.GET("/", GetConns)
	router.POST("", PostConns)

	return router
}
