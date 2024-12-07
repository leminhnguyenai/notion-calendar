package useraction

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	. "github.com/leminhnguyenai/notion-calendar/backend/internal/db"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/encryption"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	oauth2api "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

func SaveUserInfo(code string) error {
	ctx := context.Background()

	if err := filehandling.LoadEnv(); err != nil {
		return err
	}

	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes:       config.Scopes,
		Endpoint:     google.Endpoint,
	}

	token, err := conf.Exchange(ctx, code)
	if err != nil {
		return err
	}

	refreshToken := token.RefreshToken

	tokenSource := conf.TokenSource(ctx, token)

	client := oauth2.NewClient(ctx, tokenSource)

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
