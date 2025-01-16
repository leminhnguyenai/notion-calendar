package middlewares

import (
	"context"
	"database/sql"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services"
)

func ValidateToken(next http.Handler) http.Handler {
	return api.CustomHandlerFunc(
		func(w http.ResponseWriter, r *http.Request) error {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			values := &models.Values{}

			jwtTokenStringCookie, err := r.Cookie("token")
			if err != nil {
				http.Redirect(w, r, "/", http.StatusFound)

				return nil
			}

			claims, err := cryptography.VerifyJWTToken(
				jwtTokenStringCookie.Value,
				os.Getenv("JWT_SECRET_KEY"),
			)
			if err != nil {
				return err
			}

			values.JWTToken, err = cryptography.ParseJWTToken(claims)
			if err != nil {
				return err
			}

			// These 2 cookies should be sent together
			// If only either of them is delivered then it is invalid and will be ignored
			notionTokenCookie, err := r.Cookie("notion_access_token")
			notionIdCookie, err := r.Cookie("notion_id")
			notionUserNameCookie, err := r.Cookie("notion_user_name")
			notionUserImgCookie, err := r.Cookie("notion_user_img")

			if notionIdCookie != nil && notionTokenCookie != nil &&
				notionUserNameCookie != nil &&
				notionUserImgCookie != nil {
				db, err := sql.Open("mysql", config.GetDbUrl())
				if err != nil {
					return err
				}

				userService := services.NewUserService(db)

				user, err := userService.GetUser(
					ctx,
					values.JWTToken.Sub,
				)

				if user.NotionId.Valid &&
					user.NotionId.String != notionIdCookie.Value {
					values.Message = "Notion account doesn't match the registered one, remove the existing one to add another"
				} else {
					decryptedNotionAccessToken, err := cryptography.Decrypt(
						notionTokenCookie.Value,
					)
					if err != nil {
						return err
					}

					if !user.NotionId.Valid {
						if err = userService.SaveUserNotionId(
							ctx, user.UserId, notionIdCookie.Value,
						); err != nil {
							return err
						}
					}

					values.JWTToken.NotionAccessToken = decryptedNotionAccessToken
					values.JWTToken.NotionId = notionIdCookie.Value
					values.JWTToken.NotionUserName = notionUserNameCookie.Value
					values.JWTToken.NotionUserImg = notionUserImgCookie.Value
				}
			}

			defer next.ServeHTTP(w, r.WithContext(context.WithValue(
				r.Context(),
				"values",
				values,
			)))

			return nil
		},
	)
}
