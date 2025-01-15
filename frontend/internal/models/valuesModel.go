package models

import "github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"

type Values struct {
	JWTToken *cryptography.JWTToken
	Message  string
}
