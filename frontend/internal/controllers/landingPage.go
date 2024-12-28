package controllers

import (
	"html/template"
	"log"
	"net/http"
)

func LandingPage(w http.ResponseWriter, r *http.Request) {
	templ, err := template.ParseFiles("templates/landingPage.html")
	if err != nil {
		log.Fatal(err)
	}

	data := struct{}{}

	templ.Execute(w, data)
}
