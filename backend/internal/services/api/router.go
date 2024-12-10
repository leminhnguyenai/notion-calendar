package api

import (
	"encoding/json"
	"net/http"
	"path"
)

type Route struct {
	Method  string
	Pattern string
	Handler Handler
}

type Middleware struct {
	Handler  func(next http.Handler) http.Handler
	Position int
}

type Router struct {
	routes      []Route
	middlewares []Middleware
}

func NewRouter() *Router {
	return &Router{}
}

type Handler func(r *http.Request) (statusCode int, data map[string]interface{})

func (h Handler) serve() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		statusCode, data := h(r)

		w.WriteHeader(statusCode)
		w.Header().Set("Content-Type", "application/json")
		encoder := json.NewEncoder(w)
		encoder.SetEscapeHTML(false)
		encoder.Encode(data)
	})
}
func (r *Router) addHandler(method, pattern string, handler Handler) {
	r.routes = append(r.routes, Route{
		Method:  method,
		Pattern: pattern,
		Handler: handler,
	})
}

func (r *Router) GET(pattern string, handler Handler) {
	r.addHandler("GET", pattern, handler)
}

func (r *Router) POST(pattern string, handler Handler) {
	r.addHandler("POST", pattern, handler)
}

func (r *Router) PATCH(pattern string, handler Handler) {
	r.addHandler("PATCH", pattern, handler)
}

func (r *Router) DELETE(pattern string, handler Handler) {
	r.addHandler("DELETE", pattern, handler)
}

func (r *Router) Use(handler func(next http.Handler) http.Handler) {
	middleware := Middleware{
		Handler:  handler,
		Position: len(r.routes),
	}
	r.middlewares = append(r.middlewares, middleware)
}

func (r *Router) chainMiddlewares(position int) http.Handler {
	handler := r.routes[position].Handler.serve()
	for _, middleware := range r.middlewares {
		if position >= middleware.Position {
			handler = middleware.Handler(handler)
		}
	}

	return handler
}

func (r *Router) AddSubRouter(subPattern string, sr *Router) {
	for _, route := range sr.routes {
		route.Pattern = subPattern + route.Pattern
		r.routes = append(r.routes, route)
	}
}

func AddRouter(mux *http.ServeMux, basePattern string, r *Router) {
	for i, route := range r.routes {
		pattern := route.Method + " " + path.Join(basePattern, route.Pattern)
		handler := r.chainMiddlewares(i)

		mux.Handle(pattern, handler)
	}
}
