package dashboardcontroller

import (
	"html/template"
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
)

type Data struct {
	IsNotionConnected bool
}

func Dashboard(w http.ResponseWriter, r *http.Request) error {
	templ, err := template.ParseGlob("templates/dashboard.html")
	if err != nil {
		return err
	}

	data := Data{IsNotionConnected: false}

	jwtToken, ok := r.Context().Value("token").(*cryptography.JWTToken)
	if !ok || jwtToken == nil {
		return api.JWTFailedToRetrieveError()
	}

	if jwtToken.NotionAccessToken != "" {
		data.IsNotionConnected = true
	}

	templ.ExecuteTemplate(w, "index", data)

	return nil
}
