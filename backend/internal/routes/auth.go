package routes

import (
	authcontroller "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/authController"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func Auth() *api.Router {
	router := api.NewRouter()

	router.GET("/google/callback", authcontroller.GoogleAuthCallback)

	return router
}
