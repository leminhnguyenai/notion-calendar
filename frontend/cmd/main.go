package main

import (
	"log"
	"net/http"
	"os"
	"path"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/routes"
	"github.com/lpernett/godotenv"
)

func main() {
	absPath, err := os.Executable()
	if err != nil {
		log.Fatal(err)
	}

	if err = godotenv.Load(path.Join(absPath, "../../../.env")); err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	api.AddRouter(mux, "/", routes.LandingPageRouter())
	api.AddRouter(mux, "/static", routes.StaticRouter())
	api.AddRouter(mux, "/login", routes.LoginRouter())
	api.AddRouter(mux, "/dashboard", routes.DashboardRouter())

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
