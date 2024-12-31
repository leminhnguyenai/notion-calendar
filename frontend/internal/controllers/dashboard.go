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
		log.Println(err.Error())
		data.Token = ""
		templ.Execute(w, data)
		return
	}

	token := cookie.Value

	newCookie := &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   120,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	data.Token = token

	http.SetCookie(w, newCookie)

	templ.Execute(w, data)
}
