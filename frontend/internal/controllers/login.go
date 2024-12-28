package controllers

import "net/http"

func GoogleLoginController(w http.ResponseWriter, r *http.Request) {
	http.Redirect(
		w,
		r,
		"http://localhost:6060/users/google/login",
		http.StatusTemporaryRedirect,
	)
}
