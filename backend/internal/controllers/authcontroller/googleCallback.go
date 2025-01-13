package authcontroller

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
	"golang.org/x/oauth2"
	oauth2api "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

func authenticate(
	ctx context.Context,
	code string,
) (*oauth2.Token, *http.Client, error) {
	conf := config.Oauth2Config()

	token, err := conf.Exchange(ctx, code)
	if err != nil {
		return nil, nil, err
	}

	tokenSource := conf.TokenSource(ctx, token)

	client := oauth2.NewClient(ctx, tokenSource)

	return token, client, nil
}

func saveUserInfo(code string) (string, error) {
	ctx, cancel := context.WithTimeout(
		context.Background(),
		config.GoogleAPITimeout,
	)
	defer cancel()

	secretKey := os.Getenv("JWT_SECRET_KEY")

	token, client, err := authenticate(ctx, code)
	if err != nil {
		return "", err
	}

	oauth2Service, err := oauth2api.NewService(
		ctx,
		option.WithHTTPClient(client),
	)
	if err != nil {
		return "", err
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		return "", err
	}

	token_id := userInfo.Id

	email := userInfo.Email
	if email == "" {
		return "", err
	}

	googleRefreshToken := token.RefreshToken

	db, err := sql.Open("mysql", config.GetDbUrl())
	if err != nil {
		return "", err
	}

	defer db.Close()

	userService := services.NewUserService(db)

	user := models.User{
		UserId: token_id,
		Email:  email,
		Role:   "user",
		ReAuth: false,
	}

	err = userService.CreateNewUser(ctx, user)
	if err != nil {
		return "", err
	}

	tokenString, err := cryptography.CreateToken(
		user.UserId,
		googleRefreshToken,
		"",
		secretKey,
	)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func GoogleAuthCallback(w http.ResponseWriter, r *http.Request) error {
	parsedUrl, err := url.Parse(
		fmt.Sprintf(
			"http://localhost%s%s",
			os.Getenv("BACKEND_PORT"),
			r.URL.String(),
		),
	)
	if err != nil {
		return err
	}

	queryParams := parsedUrl.Query()
	code := queryParams.Get("code")

	token, err := saveUserInfo(code)
	if err != nil {
		return err
	}

	// WARNING: Secure need to be set to true when in production
	cookie := http.Cookie{
		Name:     "token_from_backend",
		Value:    token,
		Path:     "/",
		Domain:   "localhost",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, &cookie)

	dashboardURL := "http://localhost" + os.Getenv(
		"FRONTEND_PORT",
	) + "/dashboard"

	http.Redirect(w, r, dashboardURL, http.StatusTemporaryRedirect)

	return nil
}
