package app

import (
	"fmt"
	"log"
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
)

func addRoutes(
	mux *http.ServeMux,
	// List of routes
) {
	// mux.handle(PATH, HANDLER)
}

func newServer(
// Routes here
) http.Handler {
	mux := http.NewServeMux()
	addRoutes(mux)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Notion-calendar is on")
	})

	var handler http.Handler = mux
	// Set up middlewares

	return handler
}

func StartServer(errChan chan error) {
	srv := newServer()
	httpServer := &http.Server{
		Addr:    config.Port,
		Handler: srv,
	}

	localErrChan := make(chan error)

	go func() {
		log.Printf("The server is on http://localhost%s\n", config.Port)
		err := httpServer.ListenAndServe()
		if err != nil {
			localErrChan <- err
		}
	}()

	select {
	case err := <-localErrChan:
		errChan <- err
	}
}
