package useraction

import (
	"context"
	"fmt"
	"time"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/auth"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/encryption"
	oauth2api "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

func SaveUserInfo(code string) error {
	ctx := context.Background()

	token, client, err := auth.Authenticate(ctx, code)
	if err != nil {
		return err
	}

	oauth2Service, err := oauth2api.NewService(
		ctx,
		option.WithHTTPClient(client),
	)
	if err != nil {
		return err
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		return err
	}

	email := userInfo.Email
	if email == "" {
		return err
	}

	googleRefreshToken := token.RefreshToken

	userId, err := encryption.GenerateHash(
		fmt.Sprintf("%s_%s", time.Now().String(), googleRefreshToken),
	)
	if err != nil {
		return err
	}

	sqlDb, err := NewDb()
	if err != nil {
		return err
	}

	defer sqlDb.Db.Close()

	err = sqlDb.CreateNewUser(userId, email, googleRefreshToken)
	if err != nil {
		return err
	}

	return nil
}
