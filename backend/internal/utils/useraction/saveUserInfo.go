package useraction

import (
	"context"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/auth"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/validate"
	oauth2api "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

func SaveUserInfo(code string) (string, error) {
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
		UserId:             token_id,
		Email:              email,
		GoogleRefreshToken: googleRefreshToken,
		Role:               "user",
		ReAuth:             false,
	}

	err = userService.CreateNewUser(ctx, user)
	if err != nil {
		return "", err
	}

	tokenString, err := validate.CreateToken(
		user.UserId,
		user.GoogleRefreshToken,
		secretKey,
	)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
