package authcontroller

import (
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/useraction"
)

// TODO: Add callback func for authentication
// TODO: Add middlewares to authenticate

// FIX: Get error printed out correctly
func GoogleAuthCallback(r *http.Request) (int, map[string]interface{}) {
	if err := filehandling.LoadEnv(); err != nil {
		return http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		}
	}

	parsedUrl, err := url.Parse(
		fmt.Sprintf("http://localhost%s%s", os.Getenv("PORT"), r.URL.String()),
	)
	if err != nil {
		return http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		}
	}

	queryParams := parsedUrl.Query()
	code := queryParams.Get("code")

	err = useraction.SaveUserInfo(code)
	if err != nil {
		return http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		}
	}

	return http.StatusOK, map[string]interface{}{}
}
