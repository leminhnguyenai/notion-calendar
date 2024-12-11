package authcontroller

import (
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/useraction"
)

func GoogleAuthCallback(w http.ResponseWriter, r *http.Request) {
	if err := filehandling.LoadEnv(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	parsedUrl, err := url.Parse(
		fmt.Sprintf("http://localhost%s%s", os.Getenv("PORT"), r.URL.String()),
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	queryParams := parsedUrl.Query()
	code := queryParams.Get("code")

	err = useraction.SaveUserInfo(code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
