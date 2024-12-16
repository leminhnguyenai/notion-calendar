package auth

import (
	"context"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func Authenticate(
	ctx context.Context,
	code string,
) (*oauth2.Token, *http.Client, error) {
	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes:       config.Scopes,
		Endpoint:     google.Endpoint,
	}

	token, err := conf.Exchange(ctx, code)
	if err != nil {
		return nil, nil, err
	}

	tokenSource := conf.TokenSource(ctx, token)

	client := oauth2.NewClient(ctx, tokenSource)

	return token, client, nil
}
