package controllers

import (
	"html/template"
	"log"
	"net/http"
)

type Data struct {
	Token string
}

func Dashboard(w http.ResponseWriter, r *http.Request) {
	templ, err := template.ParseFiles("templates/dashboard.html")
	if err != nil {
		log.Fatal(err)
	}

	data := Data{}

	cookie, err := r.Cookie("token")
	if err != nil {
		data.Token = ""
		templ.Execute(w, data)
		return
	}

	token := cookie.Value

	data.Token = token

	http.SetCookie(w, cookie)

	templ.Execute(w, data)
}
