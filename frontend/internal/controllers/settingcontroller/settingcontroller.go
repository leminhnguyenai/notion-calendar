package settingcontroller

import (
	"log"
	"net/http"
	"text/template"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/models"
)

type Data struct {
	IsNotionConnected bool
	Message           string
	NotionUserName    string
	NotionUserImg     string
}

func SettingController(w http.ResponseWriter, r *http.Request) error {
	values, ok := r.Context().Value("values").(*models.Values)
	if !ok || values == nil {
		return api.JWTFailedToRetrieveError()
	}

	data := Data{
		IsNotionConnected: values.JWTToken.NotionAccessToken != "",
		Message:           values.Message,
		NotionUserName:    values.JWTToken.NotionUserName,
		NotionUserImg:     values.JWTToken.NotionUserImg,
	}

	if err := api.SaveTokenCookie(w, values.JWTToken); err != nil {
		return err
	}

	if values.Message != "" {
		log.Println(values.Message)
	}

	api.DeleteSensitiveCookies(w, r)

	if r.Header.Get("HX-Request") == "true" {
		templ, err := template.ParseFiles(
			"templates/contents/setting.html",
			"templates/components/widgets.html",
		)
		if err != nil {
			return err
		}

		templ.ExecuteTemplate(w, "content", data)

		return nil
	}

	templ, err := template.ParseFiles(
		"templates/base.html",
		"templates/contents/setting.html",
		"templates/components/widgets.html",
	)
	if err != nil {
		return err
	}

	templ.ExecuteTemplate(w, "index", data)

	return nil
}
