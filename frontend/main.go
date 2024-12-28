package main

import (
	"log"
	"net/http"
	"os"
	"path"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers"
	"github.com/lpernett/godotenv"
)

func main() {
	absPath, err := os.Executable()
	if err != nil {
		log.Fatal(err)
	}

	err = godotenv.Load(path.Join(absPath, "../../.env"))
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	mux.HandleFunc(
		"/static/output.css",
		func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "static/output.css")
		},
	)

	mux.HandleFunc("/", controllers.LandingPage)
	mux.HandleFunc("/dashboard", controllers.Dashboard)
	mux.HandleFunc("/login", controllers.GoogleLogin)

	port := os.Getenv("FRONTEND_PORT")

	httpServer := &http.Server{
		Addr:    port,
		Handler: mux,
	}

	log.Printf("The server is on http://localhost%s\n", port)
	if err = httpServer.ListenAndServe(); err != nil {
		panic(err)
	}
}
