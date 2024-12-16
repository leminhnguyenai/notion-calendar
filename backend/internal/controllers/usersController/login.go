package userscontroller

import (
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func GoogleLogin(w http.ResponseWriter, r *http.Request) {
	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes:       config.Scopes,
		Endpoint:     google.Endpoint,
	}

	googleConsentUrl := conf.AuthCodeURL(
		"state-token",
		oauth2.AccessTypeOffline,
		oauth2.ApprovalForce,
	)

	http.Redirect(w, r, googleConsentUrl, http.StatusTemporaryRedirect)
}

func NotionLogin(w http.ResponseWriter, r *http.Request) {
	notionConsentUrl := os.Getenv("NOTION_CONSENT_URL")

	http.Redirect(w, r, notionConsentUrl, http.StatusTemporaryRedirect)
}
