package dashboardcontroller

import (
	"context"
	"database/sql"
	"html/template"
	"log"
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services"
)

type Data struct {
	IsNotionConnected bool
	Message           string
	NotionConns       []models.NotionConn
}

func Dashboard(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	values, ok := r.Context().Value("values").(*models.Values)
	if !ok || values == nil {
		return api.JWTFailedToRetrieveError()
	}

	data := Data{
		IsNotionConnected: values.JWTToken.NotionAccessToken != "",
		Message:           values.Message,
	}

	if values.Message != "" {
		log.Println(values.Message)
	}

	db, err := sql.Open("mysql", config.GetDbUrl())

	data.NotionConns, err = services.NewConnService(db).
		GetConns(ctx, values.JWTToken.Sub)
	if err != nil {
		return err
	}

	if err = api.SaveTokenCookie(w, values.JWTToken); err != nil {
		return err
	}

	api.DeleteSensitiveCookies(w, r)

	if r.Header.Get("HX-Request") == "true" {
		templ, err := template.ParseFiles(
			"templates/contents/dashboard.html",
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
		"templates/contents/dashboard.html",
		"templates/components/widgets.html",
	)
	if err != nil {
		return err
	}

	templ.ExecuteTemplate(w, "index", data)

	return nil
}
