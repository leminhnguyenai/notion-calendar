package models

type User struct {
	Id           string `json:"id"`
	Email        string `json:"email"`
	RefreshToken string `json:"refreshToken"`
	Role         string `json:"role"`
}
