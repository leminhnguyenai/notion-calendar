package authcontroller

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/auth"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/validate"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
	oauth2api "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

func saveUserInfo(code string) (string, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	secretKey := os.Getenv("JWT_SECRET_KEY")

	token, client, err := auth.Authenticate(ctx, code)
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

	sql, err := db.InitDb()
	if err != nil {
		return "", err
	}

	defer sql.Close()

	userService := services.NewUserService(sql)

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

	tokenString, err := validate.CreateToken(
		user.UserId,
		googleRefreshToken,
		secretKey,
	)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func GoogleAuthCallback(w http.ResponseWriter, r *http.Request) {
	parsedUrl, err := url.Parse(
		fmt.Sprintf(
			"http://localhost%s%s",
			os.Getenv("BACKEND_PORT"),
			r.URL.String(),
		),
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	queryParams := parsedUrl.Query()
	code := queryParams.Get("code")

	token, err := saveUserInfo(code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

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

	dashboardURL := "http://localhost" + os.Getenv(
		"FRONTEND_PORT",
	) + "/dashboard"

	http.Redirect(w, r, dashboardURL, http.StatusTemporaryRedirect)
}
