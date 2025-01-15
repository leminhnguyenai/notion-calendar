package api

import (
	"net/http"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
)

// Delete all cookies sent from backend and refresh the cookie that contain JWT token
func ManageCookies(
	w http.ResponseWriter,
	r *http.Request,
	tokenString string,
) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   config.CookieMaxAge,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	cookiesToDelete := []string{"notion_access_token", "notion_id"}

	for _, cookieName := range cookiesToDelete {
		_, err := r.Cookie(cookieName)
		if err != nil {
			continue
		}

		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "",
			Path:     "/",
			Domain:   "localhost",
			MaxAge:   -1,
			HttpOnly: true,
			Secure:   false,
			SameSite: http.SameSiteLaxMode,
		})
	}
}
