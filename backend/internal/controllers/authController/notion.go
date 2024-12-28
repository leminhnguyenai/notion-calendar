package authcontroller

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/useraction"
)

func NotionAuthCallback(w http.ResponseWriter, r *http.Request) {
	parsedUrl, err := url.Parse(
		fmt.Sprintf("http://localhost%s%s", os.Getenv("BACKEND_PORT"), r.URL.String()),
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	queryParams := parsedUrl.Query()
	code := queryParams.Get("code")

	token, err := useraction.GetNotionToken(code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	cookie := http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   120,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)
	// NOTE: The token will be sent back to the user which will be sent along with user's JWT token to save in the db

	log.Println(token)

	w.WriteHeader(http.StatusOK)
}
