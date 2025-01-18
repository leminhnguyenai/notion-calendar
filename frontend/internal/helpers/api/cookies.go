package api

import (
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
)

func SaveTokenCookie(
	w http.ResponseWriter,
	jwtToken *cryptography.JWTToken,
) error {
	tokenString, err := cryptography.CreateJWTToken(
		jwtToken.Sub,
		jwtToken.GoogleRefreshToken,
		jwtToken.NotionAccessToken,
		jwtToken.NotionId,
		jwtToken.NotionUserName,
		jwtToken.NotionUserImg,
		os.Getenv("JWT_SECRET_KEY"),
	)

	if err != nil {
		return err
	}

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

	return nil
}

// Delete all cookies sent from backend and refresh the cookie that contain JWT token
func DeleteSensitiveCookies(
	w http.ResponseWriter,
	r *http.Request,
) {
	cookiesToDelete := []string{
		"notion_access_token",
		"notion_id",
		"notion_user_name",
		"notion_user_img",
	}

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
