package userscontroller

import (
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func Login(r *http.Request) (int, map[string]interface{}) {
	if err := filehandling.LoadEnv(); err != nil {
		return http.StatusInternalServerError, map[string]interface{}{
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

	consentScreenUrl := conf.AuthCodeURL(
		"state-token",
		oauth2.AccessTypeOffline,
		oauth2.ApprovalForce,
	)

	return http.StatusOK, map[string]interface{}{
		"url": consentScreenUrl,
	}
}
