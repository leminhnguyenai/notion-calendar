package userscontroller

import (
	"net/http"
	"os"

	"github.com/kardianos/osext"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/lpernett/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func Login(r *http.Request) (int, map[string]interface{}) {
	_, err := osext.ExecutableFolder()
	if err != nil {
		return 404, map[string]interface{}{
			"error": err,
		}
	}

	if err := godotenv.Load("/Users/leminhnguyenmba/Documents/Projects/notion-calendar/backend/.env"); err != nil {
		return 404, map[string]interface{}{
			"error": err,
		}
	}

	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes:       config.Scopes,
		Endpoint:     google.Endpoint,
	}

	consentScreenUrl := conf.AuthCodeURL("state")
	return http.StatusOK, map[string]interface{}{
		"url": consentScreenUrl,
	}
}
