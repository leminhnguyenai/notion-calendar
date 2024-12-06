package app

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/routes"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
	"github.com/lpernett/godotenv"
)

func createServer() http.Handler {
	mux := http.NewServeMux()

	api.AddRouter(mux, "/auth", routes.Auth())
	api.AddRouter(mux, "/users", routes.Users())

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Notion-calendar is on")
	})

	return mux
}

func StartServer(errChan chan error) {
	if err := godotenv.Load("/Users/leminhnguyenmba/Documents/Projects/notion-calendar/backend/.env"); err != nil {
		errChan <- err
	}
	srv := createServer()

	port := os.Getenv("PORT")
	httpServer := &http.Server{
		Addr:    port,
		Handler: srv,
	}

	log.Printf("The server is on http://localhost%s\n", port)
	err := httpServer.ListenAndServe()
	if err != nil {
		errChan <- err
	}
}
