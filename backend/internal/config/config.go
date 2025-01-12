package config

import (
	"os"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const DbTimeout = time.Millisecond * 500

const GoogleAPITimeout = time.Second * 10000

const NotionAPITimeout = time.Second * 10000

func Oauth2Config() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/calendar",
			"https://www.googleapis.com/auth/calendar.readonly",
			"https://www.googleapis.com/auth/calendar.events",
			"https://www.googleapis.com/auth/calendar.events.readonly",
		},
		Endpoint: google.Endpoint,
	}
}

func GetDbUrl() string {
	return os.Getenv(
		"DB_USERNAME",
	) + ":" + os.Getenv(
		"DB_PASSWORD",
	) + "@/" + os.Getenv(
		"DB_NAME",
	) + "?parseTime=true"
}
