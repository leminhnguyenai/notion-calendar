package authcontroller

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/dstotijn/go-notion"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/cryptography"
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

		notionOauthRes := struct {
			AccessToken          string `json:"access_token"`
			BotId                string `json:"bot_id"`
			DuplicatedTemplateId string `json:"duplicated_template_id"`
			Owner                struct {
				Workspace bool `json:"workspace"`
			} `json:"owner"`
			WorkspaceIcon string `json:"workspace_icon"`
			WorkspaceId   string `json:"workspace_id"`
			WorkspaceName string `json:"workspace_name"`
		}{}

		if err = json.Unmarshal(body, &notionOauthRes); err != nil {
			respch <- Response{"", err}
		}

		respch <- Response{notionOauthRes.AccessToken, nil}
	}()

	select {
	case <-ctx.Done():
		return "", api.TimeoutError()
	case resp := <-respch:
		return resp.token, resp.err
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

	encodedCred := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf(
		"%s:%s",
		os.Getenv("NOTION_OAUTH_CLIENT_ID"),
		os.Getenv("NOTION_OAUTH_CLIENT_SECRET"),
	)))

	req, err := http.NewRequest(
		"POST",
		"https://api.notion.com/v1/oauth/token",
		bytes.NewBuffer([]byte(jsonData)),
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

	code := r.URL.Query().Get("code")

	notionAccessToken, err := getNotionToken(code)
	if err != nil {
		return err
	}

	notionUser, err := notion.NewClient(notionAccessToken).FindCurrentUser(ctx)
	if err != nil {
		return err
	}

	encryptedNotionAcessToken, err := cryptography.Encrypt(notionAccessToken)
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "notion_access_token",
		Value:    encryptedNotionAcessToken,
		Path:     "/",
		Domain:   "localhost",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "notion_id",
		Value:    notionUser.ID,
		Path:     "/",
		Domain:   "localhost",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})
	// NOTE: The token will be sent back to the user which will be sent along with user's JWT token to save in the db

	dashboardURL := "http://localhost" + os.Getenv(
		"FRONTEND_PORT",
	) + "/dashboard"

	http.Redirect(w, r, dashboardURL, http.StatusTemporaryRedirect)

	return nil
}
