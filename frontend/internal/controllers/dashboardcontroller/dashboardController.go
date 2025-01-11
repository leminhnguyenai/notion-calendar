package dashboardcontroller

import (
	"html/template"
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
)

type Data struct {
	Token string
}

func Dashboard(w http.ResponseWriter, r *http.Request) error {
	templ, err := template.ParseFiles("templates/dashboard.html")
	if err != nil {
		return err
	}

	data := Data{}

	tokenString, ok := r.Context().Value("token_string").(string)
	if !ok || tokenString == "" {
		return api.JWTFailedToRetrieveError()
	}

	data.Token = tokenString

	templ.Execute(w, data)

	return nil
}
