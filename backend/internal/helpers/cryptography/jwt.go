package cryptography

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTToken struct {
	Iss                string
	Sub                string
	Jti                string
	Iat                int64
	Exp                int64
	GoogleRefreshToken string
	NotionAccessToken  string
}

func CreateToken(
	sub, googleRefreshToken, notionAccessToken, secretKey string,
) (string, error) {
	jti, err := Encrypt(time.Now().String())
	if err != nil {
		return "", err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss":                  "notioncalendar",
		"sub":                  sub,
		"jti":                  jti,
		"iat":                  time.Now().Unix(),
		"exp":                  time.Now().Add(time.Minute * 15).Unix(),
		"google_refresh_token": googleRefreshToken,
		"notion_access_token":  notionAccessToken,
	})

	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ParseJWTToken(claims jwt.MapClaims) (*JWTToken, error) {
	iss, ok := claims["iss"].(string)
	if !ok || iss == "" {
		return nil, fmt.Errorf("Error parsing iss")
	}

	sub, ok := claims["sub"].(string)
	if !ok || sub == "" {
		return nil, fmt.Errorf("Error parsing sub")
	}

	jti, ok := claims["jti"].(string)
	if !ok || jti == "" {
		return nil, fmt.Errorf("Error parsing jti")
	}

	iat := int64(claims["iat"].(float64))

	exp := int64(claims["exp"].(float64))

	google_refresh_token, ok := claims["google_refresh_token"].(string)
	if !ok || google_refresh_token == "" {
		return nil, fmt.Errorf("Error parsing refresh token")
	}

	notion_access_token, ok := claims["notion_access_token"].(string)
	if !ok {
		return nil, fmt.Errorf("Error parsing notion access token")
	}

	return &JWTToken{iss, sub, jti, iat, exp, google_refresh_token, notion_access_token}, nil
}

func VerifyToken(tokenString string, secretKey string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(
		tokenString,
		func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		},
	)

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, err
	}
}

