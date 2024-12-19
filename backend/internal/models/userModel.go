package models

type User struct {
	Id                 string `json:"id"`
	Email              string `json:"email"`
	GoogleRefreshToken string `json:"google_refresh_token"`
	Role               string `json:"role"`
}
