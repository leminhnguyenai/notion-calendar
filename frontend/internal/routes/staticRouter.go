package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
)

func serveCSS(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/style/output.css")
}

func serveFont(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/fonts/JetBrainsMono.ttf")
}

func serveHTMX(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/scripts/htmx.min.js")
}

func StaticRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/style/output.css", http.HandlerFunc(serveCSS))
	router.GET("/fonts/jet-brains-mono.ttf", http.HandlerFunc(serveFont))
	router.GET("/scripts/htmx.min.js", http.HandlerFunc(serveHTMX))

	return router
}
