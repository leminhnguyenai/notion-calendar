package settingcontroller

import (
	"net/http"
	"text/template"
)

func SettingController(w http.ResponseWriter, h *http.Request) error {
	templ, err := template.ParseFiles(
		"templates/setting.html",
		"templates/components/widgets.html",
	)
	if err != nil {
		return err
	}

	templ.ExecuteTemplate(w, "index", struct{}{})

	return err
}
