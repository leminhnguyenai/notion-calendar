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

	refreshToken := token.RefreshToken

	userId, err := encryption.GenerateHash(
		fmt.Sprintf("%s_%s", time.Now().String(), refreshToken),
	)
	if err != nil {
		return err
	}

	db, err := InitDb()
	if err != nil {
		return err
	}

	defer db.Close()

	userInputQ, err := db.Prepare(
		`INSERT INTO users(user_id, email, refresh_token, role) 
             VALUES(?, ?, ?, 'user') 
             ON DUPLICATE KEY UPDATE refresh_token = ?`,
	)
	if err != nil {
		return err
	}

	defer userInputQ.Close()

	settinggInputQ, err := db.Prepare(
		"INSERT IGNORE INTO settings(user_id) VALUES(?)",
	)
	if err != nil {
		return err
	}

	defer settinggInputQ.Close()

	if _, err = userInputQ.Exec(userId, email, refreshToken, refreshToken); err != nil {
		return err
	}

	if _, err = settinggInputQ.Exec(userId); err != nil {
		return err
	}

	return nil
}
