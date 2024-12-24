package models

import "database/sql"

type User struct {
	UserId             string         `json:"user_id"`
	Email              string         `json:"email"`
	GoogleRefreshToken string         `json:"google_refresh_token"`
	NotionAccessToken  sql.NullString `json:"notion_access_token"`
	Role               string         `json:"role"`
}
