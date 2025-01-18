package usercontrollers

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"text/template"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services"
)

func GoogleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	http.Redirect(w, r, "/", http.StatusFound)
}

func NotionLogout(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if r.Header.Get("HX-Request") == "true" {
		log.Println("This is an HTMX request")
	}

	values, ok := r.Context().Value("values").(*models.Values)
	if !ok || values == nil {
		return api.JWTFailedToRetrieveError()
	}

	db, err := sql.Open("mysql", config.GetDbUrl())
	if err != nil {
		return err
	}

	if err = services.NewUserService(db).
		RemoveUserNotionId(ctx, values.JWTToken.Sub); err != nil {
		return err
	}

	if err = api.SaveTokenCookie(w, &cryptography.JWTToken{
		Iss:                values.JWTToken.Iss,
		Sub:                values.JWTToken.Sub,
		Jti:                values.JWTToken.Jti,
		Iat:                values.JWTToken.Iat,
		Exp:                values.JWTToken.Exp,
		GoogleRefreshToken: values.JWTToken.GoogleRefreshToken,
	}); err != nil {
		return err
	}

	api.DeleteSensitiveCookies(w, r)

	templ, err := template.ParseFiles("templates/components/widgets.html")
	if err != nil {
		return err
	}

	templ.ExecuteTemplate(w, "add-notion-account-button", struct{}{})

	return nil
}
