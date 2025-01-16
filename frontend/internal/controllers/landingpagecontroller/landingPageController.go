package landingpagecontroller

import (
	"html/template"
	"net/http"
)

func LandingPage(w http.ResponseWriter, r *http.Request) error {
	templ, err := template.ParseFiles(
		"templates/landingPage.html",
		"templates/components/widgets.html",
	)
	if err != nil {
		return err
	}

	data := struct{}{}

	templ.Execute(w, data)

	return nil
}
