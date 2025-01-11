package controllers

import (
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"golang.org/x/oauth2"
)

func GoogleLogin(w http.ResponseWriter, r *http.Request) {
	conf := config.Oauth2Config()

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
