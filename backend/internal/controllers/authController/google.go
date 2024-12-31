package authcontroller

import (
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/useraction"
)

func GoogleAuthCallback(w http.ResponseWriter, r *http.Request) {
	parsedUrl, err := url.Parse(
		fmt.Sprintf("http://localhost%s%s", os.Getenv("BACKEND_PORT"), r.URL.String()),
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	queryParams := parsedUrl.Query()
	code := queryParams.Get("code")

	token, err := useraction.SaveUserInfo(code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO: Implement JWT
	// WARNING: Secure need to be set to true when in production
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

	dashboardURL := "http://localhost" + os.Getenv("FRONTEND_PORT") + "/dashboard"

	http.Redirect(w, r, dashboardURL, http.StatusTemporaryRedirect)
}
