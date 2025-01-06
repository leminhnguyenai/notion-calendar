package useraction

import (
	"context"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/auth"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/encryption"
	oauth2api "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

func SaveUserInfo(code string) (string, error) {
	ctx := context.Background()

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
	encryptedId, err := encryption.Encrypt(token_id)
	if err != nil {
		return "", err
	}

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
		UserId:             encryptedId,
		Email:              email,
		GoogleRefreshToken: googleRefreshToken,
		Role:               "user",
		ReAuth:             false,
	}

	err = userService.CreateNewUser(ctx, user)
	if err != nil {
		return "", err
	}

	return googleRefreshToken, nil
}
