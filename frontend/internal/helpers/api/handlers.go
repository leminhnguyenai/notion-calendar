package api

import (
	"net/http"
)

type CustomHandlerFunc func(w http.ResponseWriter, r *http.Request) error

func (c CustomHandlerFunc) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := c(w, r)
	if err != nil {
		SendError(w, r, err)
	}
}
