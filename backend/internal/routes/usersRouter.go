package routes

import (
	"net/http"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controller/userscontroller"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
)

func UsersRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/google/login", http.HandlerFunc(GoogleLogin))
	router.GET(
		"/notion/login",
		middlewares.ValidateToken(http.HandlerFunc(NotionLogin)),
	)

	return router
}
