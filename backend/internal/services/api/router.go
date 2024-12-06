package api

import (
	"encoding/json"
	"net/http"
)

type Route struct {
	Method  string
	Pattern string
	Handler Handler
}

type Router struct {
	routes []Route
}

func NewRouter() *Router {
	return &Router{}
}

type Handler func(r *http.Request) (statusCode int, data map[string]interface{})

func (h Handler) serve(w http.ResponseWriter, r *http.Request) {
	statusCode, data := h(r)

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func (r *Router) addRoute(method, pattern string, handler Handler) {
	r.routes = append(r.routes, Route{
		Method:  method,
		Pattern: pattern,
		Handler: handler,
	})
}

func (r *Router) GET(pattern string, handler Handler) {
	r.addRoute("GET", pattern, handler)
}

func (r *Router) POST(pattern string, handler Handler) {
	r.addRoute("POST", pattern, handler)
}

func (r *Router) PATCH(pattern string, handler Handler) {
	r.addRoute("PATCH", pattern, handler)
}

func (r *Router) DELETE(pattern string, handler Handler) {
	r.addRoute("DELETE", pattern, handler)
}

func (r *Router) AddSubRouter(subPattern string, sr *Router) {
	for _, route := range sr.routes {
		route.Pattern = subPattern + route.Pattern
		r.routes = append(r.routes, route)
	}
}

func AddRouter(mux *http.ServeMux, basePattern string, r *Router) {
	for _, route := range r.routes {
		pattern := route.Method + " " + basePattern + route.Pattern
		mux.HandleFunc(pattern, route.Handler.serve)
	}
}
