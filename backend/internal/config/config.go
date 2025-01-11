package config

import "time"

var Scopes = []string{
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/calendar",
	"https://www.googleapis.com/auth/calendar.readonly",
	"https://www.googleapis.com/auth/calendar.events",
	"https://www.googleapis.com/auth/calendar.events.readonly",
}

const DbWaitTime = time.Millisecond * 500

const GoogleAPIWaitTime = time.Second * 10000

const NotionAPIWaitTime = time.Second * 10000
