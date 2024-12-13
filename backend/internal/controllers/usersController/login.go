package userscontroller

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func Login(w http.ResponseWriter, r *http.Request) {
	if err := filehandling.LoadEnv(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(map[string]interface{}{
		"url": consentScreenUrl,
	})
}
