package models

type User struct {
	Id                 string `json:"id"`
	Email              string `json:"email"`
	GoogleRefreshToken string `json:"googleRefreshToken"`
	Role               string `json:"role"`
}
