package dashboardcontroller

import (
	"context"
	"database/sql"
	"html/template"
	"log"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
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

	db, err := sql.Open("mysql", config.GetDbUrl())

	templ, err := template.ParseFiles(
		"templates/dashboard.html",
		"templates/components/widgets.html",
		"static/scripts/htmx.min.js",
		"static/style/output.css",
	)
	if err != nil {
		return err
	}

	data := Data{IsNotionConnected: false}

	values, ok := r.Context().Value("values").(*models.Values)
	if !ok || values == nil {
		return api.JWTFailedToRetrieveError()
	}

	data.IsNotionConnected = values.JWTToken.NotionAccessToken != ""

	if values.Message != "" {
		log.Println(values.Message)
	}

	data.NotionConns, err = services.NewConnService(db).
		GetConns(ctx, values.JWTToken.Sub)

	tokenString, err := cryptography.CreateJWTToken(
		values.JWTToken.Sub,
		values.JWTToken.GoogleRefreshToken,
		values.JWTToken.NotionAccessToken,
		values.JWTToken.NotionId,
		values.JWTToken.NotionUserName,
		values.JWTToken.NotionUserImg,
		os.Getenv("JWT_SECRET_KEY"),
	)
	if err != nil {
		return err
	}

	api.ManageCookies(w, r, tokenString)

	templ.ExecuteTemplate(w, "index", data)

	return nil
}
