package models

import "database/sql"

type User struct {
	UserId   string         `json:"user_id"`
	Email    string         `json:"email"`
	TokenId  string         `json:"token_id"`
	NotionId sql.NullString `json:"notion_id"`
	Role     string         `json:"role"`
	ReAuth   bool           `json:"re_auth"`
}
