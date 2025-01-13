package authcontroller

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/dstotijn/go-notion"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
)

func sendRequestHelper(ctx context.Context, req *http.Request) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, config.NotionAPITimeout)
	defer cancel()

	type Response struct {
		token string
		err   error
	}

	respch := make(chan Response)

	go func() {
		client := &http.Client{}
		res, err := client.Do(req)
		if err != nil {
			respch <- Response{"", err}
		}

		defer res.Body.Close()

		body, err := io.ReadAll(res.Body)
		if err != nil {
			respch <- Response{"", err}
		}

		type NotionOauthResponse struct {
			AccessToken          string `json:"access_token"`
			BotId                string `json:"bot_id"`
			DuplicatedTemplateId string `json:"duplicated_template_id"`
			Owner                struct {
				Workspace bool `json:"workspace"`
			} `json:"owner"`
			WorkspaceIcon string `json:"workspace_icon"`
			WorkspaceId   string `json:"workspace_id"`
			WorkspaceName string `json:"workspace_name"`
		}

		var notionOauthRes NotionOauthResponse

		err = json.Unmarshal(body, &notionOauthRes)
		if err != nil {
			respch <- Response{"", err}
		}

		respch <- Response{notionOauthRes.AccessToken, nil}
	}()

	select {
	case <-ctx.Done():
		return "", api.TimeoutError()
	case resp := <-respch:
		if resp.err != nil {
			return "", resp.err
		}

		return resp.token, nil
	}
}

func getNotionToken(code string) (string, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	requestBody := struct {
		GrantType   string `json:"grant_type"`
		Code        string `json:"code"`
		RedirectUri string `json:"redirect_uri"`
	}{
		"authorization_code",
		code,
		os.Getenv("NOTION_REDIRECT_URL"),
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	jsonStr := []byte(jsonData)

	encodedCred := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf(
		"%s:%s",
		os.Getenv("NOTION_OAUTH_CLIENT_ID"),
		os.Getenv("NOTION_OAUTH_CLIENT_SECRET"),
	)))

	req, err := http.NewRequest(
		"POST",
		"https://api.notion.com/v1/oauth/token",
		bytes.NewBuffer(jsonStr),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+encodedCred)

	notionAccessToken, err := sendRequestHelper(ctx, req)
	if err != nil {
		return "", err
	}

	return notionAccessToken, nil
}

func NotionAuthCallback(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	parsedUrl, err := url.Parse(
		fmt.Sprintf(
			"http://localhost%s%s",
			os.Getenv("BACKEND_PORT"),
			r.URL.String(),
		),
	)
	if err != nil {
		return err
	}

	queryParams := parsedUrl.Query()
	code := queryParams.Get("code")

	notionAccessToken, err := getNotionToken(code)
	if err != nil {
		return err
	}

	notionClient := notion.NewClient(notionAccessToken)

	notionUser, err := notionClient.FindCurrentUser(ctx)
	if err != nil {
		return err
	}

	cookie := http.Cookie{
		Name:     "notion_access_token",
		Value:    notionAccessToken,
		Path:     "/",
		Domain:   "localhost",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)
	// NOTE: The token will be sent back to the user which will be sent along with user's JWT token to save in the db

	dashboardURL := "http://localhost" + os.Getenv(
		"FRONTEND_PORT",
	) + "/dashboard?notion-id=" + notionUser.ID

	http.Redirect(w, r, dashboardURL, http.StatusTemporaryRedirect)

	return nil
}
