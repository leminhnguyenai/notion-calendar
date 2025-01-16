package authcontroller

import (
	"context"
	"database/sql"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
	"golang.org/x/oauth2"
	oauth2api "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

func saveUserInfo(code string) (string, error) {
	ctx, cancel := context.WithTimeout(
		context.Background(),
		config.GoogleAPITimeout,
	)
	defer cancel()

	conf := config.Oauth2Config()

	token, err := conf.Exchange(ctx, code)
	if err != nil {
		return "", err
	}

	tokenSource := conf.TokenSource(ctx, token)

	oauth2Service, err := oauth2api.NewService(
		ctx,
		option.WithHTTPClient(oauth2.NewClient(ctx, tokenSource)),
	)
	if err != nil {
		return "", err
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		return "", err
	}

	email := userInfo.Email
	if email == "" {
		return "", err
	}

	db, err := sql.Open("mysql", config.GetDbUrl())
	if err != nil {
		return "", err
	}

	defer db.Close()

	user := models.User{
		UserId: userInfo.Id,
		Email:  email,
		Role:   "user",
		ReAuth: false,
	}

	if err = services.NewUserService(db).CreateNewUser(ctx, user); err != nil {
		return "", err
	}

	tokenString, err := cryptography.CreateJWTToken(
		user.UserId,
		token.RefreshToken,
		"",
		"",
		"",
		"",
		os.Getenv("JWT_SECRET_KEY"),
	)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func GoogleAuthCallback(w http.ResponseWriter, r *http.Request) error {
	code := r.URL.Query().Get("code")

	token, err := saveUserInfo(code)
	if err != nil {
		return err
	}

	// WARNING: Secure need to be set to true when in production
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		Domain:   "localhost",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	dashboardURL := "http://localhost" + os.Getenv(
		"FRONTEND_PORT",
	) + "/dashboard"

	http.Redirect(w, r, dashboardURL, http.StatusFound)

	return nil
}
