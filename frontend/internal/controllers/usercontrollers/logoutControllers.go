package usercontrollers

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

func NotionLogout(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	values, ok := r.Context().Value("values").(*models.Values)
	if !ok || values == nil {
		return api.JWTFailedToRetrieveError()
	}

	db, err := sql.Open("mysql", config.GetDbUrl())
	if err != nil {
		return err
	}

	err = services.NewUserService(db).
		RemoveUserNotionId(ctx, values.JWTToken.Sub)
	if err != nil {
		return err
	}

	newJWTTokenString, err := cryptography.CreateJWTToken(
		values.JWTToken.Sub,
		values.JWTToken.GoogleRefreshToken,
		"",
		"",
		os.Getenv("JWT_SECRET_KEY"),
	)

	api.ManageCookies(w, r, newJWTTokenString)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`
                <a
                    href="users/login/notion"
                    class="relative p-2 bg-[#F0EAD6] text-[#242424] rounded-md hover:bg-[#F0EAD6]/75 active:bg-[#F0EAD6]/50 transition-all duration-200 ease-in-out cursor-pointer select-none"
                >
                    Connect to Notion
                </a>
	`))

	return nil
}
