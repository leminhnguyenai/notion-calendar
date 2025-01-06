package models

import "database/sql"

type User struct {
	UserId             string         `json:"user_id"`
	Email              string         `json:"email"`
	TokenId            string         `json:"token_id"`
	GoogleRefreshToken string         `json:"google_refresh_token"`
	NotionAccessToken  sql.NullString `json:"notion_access_token"`
	Role               string         `json:"role"`
	ReAuth             bool           `json:"re_auth"`
}
