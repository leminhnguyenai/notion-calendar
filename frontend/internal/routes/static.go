package routes

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services/api"
)

func serveCSS(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/output.css")
}

func serveFont(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/font/JetBrainsMono.ttf")
}

func StaticRouter() *api.Router {
	router := api.NewRouter()

	router.GET("/output.css", http.HandlerFunc(serveCSS))
	router.GET("/jet-brains-mono.tff", http.HandlerFunc(serveFont))

	return router
}
