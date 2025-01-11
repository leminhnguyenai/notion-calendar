package app

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/routes"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Request: %s %s", r.Method, r.URL.Path)

		next.ServeHTTP(w, r)
	})
}

func createServer() http.Handler {
	mux := http.NewServeMux()

	api.AddRouter(mux, "/auth", routes.AuthRouter())
	api.AddRouter(mux, "/users", routes.UsersRouter())
	api.AddRouter(mux, "/connections", routes.ConnectionsRouter())

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Notion-calendar is on")
	})

	return loggingMiddleware(mux)
}

func StartServer(errChan chan error) {
	srv := createServer()

	port := os.Getenv("BACKEND_PORT")
	httpServer := &http.Server{
		Addr:    port,
		Handler: srv,
	}

	log.Printf("The server is on http://localhost%s\n", port)
	if err := httpServer.ListenAndServe(); err != nil {
		errChan <- err
	}
}
