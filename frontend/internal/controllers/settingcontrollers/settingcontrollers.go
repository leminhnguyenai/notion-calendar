package settingcontrollers

import (
	"log"
	"net/http"
	"text/template"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/frontend/templates/components/toggleswitch"
)

type AccountData struct {
	IsNotionConnected bool
	Message           string
	NotionUserName    string
	NotionUserImg     string
	UserSetting       *models.UserSetting
}

type DisplayData struct {
	Appearence toggleswitch.ToggleSwitch
}

func SettingController(w http.ResponseWriter, r *http.Request) error {
	values, ok := r.Context().Value("values").(*models.Values)
	if !ok || values == nil {
		return api.JWTFailedToRetrieveError()
	}

	data := AccountData{
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

func GetAccountSection(w http.ResponseWriter, r *http.Request) error {
	values, ok := r.Context().Value("values").(*models.Values)
	if !ok || values == nil {
		return api.JWTFailedToRetrieveError()
	}

	data := AccountData{
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

	templ, err := template.ParseFiles(
		"templates/contents/setting.html",
		"templates/components/widgets.html",
	)
	if err != nil {
		return err
	}

	templ.ExecuteTemplate(w, "account", data)

	return nil
}

func GetDisplaySection(w http.ResponseWriter, r *http.Request) error {
	values, ok := r.Context().Value("values").(*models.Values)
	if !ok || values == nil {
		return api.JWTFailedToRetrieveError()
	}

	data := DisplayData{
		Appearence: toggleswitch.NewToggleSwitch("appearence"),
	}

	data.Appearence.AddOption(
		toggleswitch.Option{
			Id:   "dark",
			Name: "Dark",
			Attributes: []string{
				`onclick="themeSwitch(-1)"`,
			},
		},
	)
	data.Appearence.AddOption(
		toggleswitch.Option{
			Id:   "light",
			Name: "Light",
			Attributes: []string{
				`onclick="themeSwitch(1)"`,
			},
		},
	)
	data.Appearence.AddOption(
		toggleswitch.Option{
			Id:   "system",
			Name: "System",
			Attributes: []string{
				`onclick="themeSwitch(0)"`,
			},
		},
	)

	api.DeleteSensitiveCookies(w, r)

	templ, err := template.ParseFiles(
		"templates/contents/setting.html",
		"templates/components/widgets.html",
		"templates/components/toggleswitch/toggleswitch.html",
	)
	if err != nil {
		return err
	}

	templ.ExecuteTemplate(w, "display", data)

	return nil
}
