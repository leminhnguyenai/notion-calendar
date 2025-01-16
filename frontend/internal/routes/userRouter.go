package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers/usercontrollers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/middlewares"
)

func UserRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/login/google", http.HandlerFunc(usercontrollers.GoogleLogin))
	router.GET("/login/notion", middlewares.ValidateToken(
		http.HandlerFunc(usercontrollers.NotionLogin),
	))
	router.POST("/logout/notion", middlewares.ValidateToken(
		api.CustomHandlerFunc(usercontrollers.NotionLogout),
	))
	router.GET("/logout/google", middlewares.ValidateToken(
		http.HandlerFunc(usercontrollers.GoogleLogout),
	))

	return router
}
