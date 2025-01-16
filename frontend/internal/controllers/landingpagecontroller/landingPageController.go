package landingpagecontroller

import (
	"html/template"
	"net/http"
)

func LandingPage(w http.ResponseWriter, r *http.Request) error {
	cookie, err := r.Cookie("token")
	if cookie != nil {
		http.Redirect(w, r, "/dashboard", http.StatusFound)
	}

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
