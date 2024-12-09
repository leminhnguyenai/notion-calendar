package routes

import (
	"log"
	"net/http"

	userscontroller "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/usersController"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Request: %s %s", r.Method, r.URL.Path)

		next.ServeHTTP(w, r)
	})
}

func Users() *api.Router {
	router := api.NewRouter()

	router.Use(loggingMiddleware)

	router.POST("/login", userscontroller.Login)

	return router
}
