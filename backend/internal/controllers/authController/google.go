package authcontroller

import (
	"net/http"
)

// TODO: Add callback func for authentication
// TODO: Add middlewares to authenticate
func GoogleAuthCallback(r *http.Request) (int, map[string]interface{}) {
	return 200, map[string]interface{}{
		"hello": "world",
	}
}
