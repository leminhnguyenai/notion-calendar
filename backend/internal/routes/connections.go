package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func main(r *http.Request) (int, map[string]interface{}) {
	refreshToken, ok := r.Context().Value("refreshToken").(string)
	if !ok || refreshToken == "" {
		return http.StatusUnauthorized, map[string]interface{}{
			"Status": "Unauthorized",
		}
	}

	return http.StatusOK, map[string]interface{}{
		"message":      "Route connections is on",
		"refreshToken": refreshToken,
	}
}

func Connections() *api.Router {
	router := api.NewRouter()

	router.Use(middlewares.Validate)

	router.GET("/", main)

	return router
}
