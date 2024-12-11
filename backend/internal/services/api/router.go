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
	Handler  Handler
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

// TODO: Turn Handler into a middlware when needed
// FIX: Turn the Handler into normal http.Handler
func (h Handler) serve(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		statusCode, data := h(r)

		if next != nil {
			if statusCode != http.StatusOK {
				goto RESPONSE
			}

			newRequest, ok := data["request"].(*http.Request)
			if !ok || newRequest == nil {
				statusCode = http.StatusInternalServerError
				data = map[string]interface{}{
					"error": "Server error",
				}
				goto RESPONSE
			}

			next.ServeHTTP(w, newRequest)
			return
		}

	RESPONSE:
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

func (r *Router) Use(handler Handler) {
	middleware := Middleware{
		Handler:  handler,
		Position: len(r.routes),
	}
	r.middlewares = append(r.middlewares, middleware)
}

func (r *Router) chainMiddlewares(position int) http.Handler {
	handler := r.routes[position].Handler.serve(nil)
	for _, middleware := range r.middlewares {
		if position >= middleware.Position {
			handler = middleware.Handler.serve(handler)
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
