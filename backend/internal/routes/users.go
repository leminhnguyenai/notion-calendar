package routes

import (
	"net/http"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/usersController"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func Users() *api.Router {
	router := api.NewRouter()

	router.POST("/login", http.HandlerFunc(Login))

	return router
}
