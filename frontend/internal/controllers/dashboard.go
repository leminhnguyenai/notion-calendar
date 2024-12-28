package controllers

import (
	"html/template"
	"log"
	"net/http"
)

func Dashboard(w http.ResponseWriter, r *http.Request) {
	templ, err := template.ParseFiles("templates/dashboard.html")
	if err != nil {
		log.Fatal(err)
	}

	cookie, err := r.Cookie("token")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	token := cookie.Value

	data := struct {
		Token string
	}{
		Token: token,
	}

	templ.Execute(w, data)
}
