package usercontrollers

import (
	"context"
	"database/sql"
	"net/http"
	"os"

	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/cryptography"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/services"
)

func NotionLogout(w http.ResponseWriter, r *http.Request) error {
	jwtToken, ok := r.Context().Value("token").(*cryptography.JWTToken)
	if !ok || jwtToken == nil {
		return api.JWTFailedToRetrieveError()
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	db, err := sql.Open("mysql", config.GetDbUrl())
	if err != nil {
		return err
	}

	err = services.NewUserService(db).RemoveUserNotionId(ctx, jwtToken.Sub)
	if err != nil {
		return err
	}

	newJWTTokenString, err := cryptography.CreateJWTToken(
		jwtToken.Sub,
		jwtToken.GoogleRefreshToken,
		"",
		os.Getenv("JWT_SECRET_KEY"),
	)

	newCookie := &http.Cookie{
		Name:     "token",
		Value:    newJWTTokenString,
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   120,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, newCookie)

	// http.Redirect(w, r, "/dashboard", http.StatusFound)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`
                <a
                    href="users/login/notion"
                    class="relative p-2 bg-[#F0EAD6] text-[#242424] rounded-md hover:bg-[#F0EAD6]/75 active:bg-[#F0EAD6]/50 transition-all duration-200 ease-in-out"
                >
                    Connect to Notion
                </a>
	`))

	return nil
}
