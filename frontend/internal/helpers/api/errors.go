package api

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
)

type APIError struct {
	StatusCode int `json:"status_code"`
	Msg        any `json:"msg"`
}

func (err APIError) Error() string {
	return fmt.Sprintf("statusCode: %d - msg: %s", err.StatusCode, err.Msg)
}

func NewAPIError(statusCode int, err error) *APIError {
	return &APIError{
		StatusCode: statusCode,
		Msg:        err.Error(),
	}
}

func SendError(w http.ResponseWriter, r *http.Request, err error) {
	w.Header().Set("Content-Type", "application/json")

	var data any

	if apiErr, ok := err.(*APIError); ok {
		w.WriteHeader(apiErr.StatusCode)
		data = apiErr
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		data = map[string]any{
			"status_code": http.StatusInternalServerError,
			"msg":         "Internal server error",
		}
	}

	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(data)

	slog.Error("HTTP API error", "err", err.Error(), "path", r.URL.Path)
}

func JSONSchemaInvalidation(errors []string) *APIError {
	return &APIError{
		StatusCode: http.StatusUnauthorized,
		Msg:        errors,
	}
}

func InvalidRequest(errStr string) *APIError {
	return NewAPIError(http.StatusBadRequest, fmt.Errorf(errStr))
}

func JWTUnauthorizedError() *APIError {
	return NewAPIError(
		http.StatusUnauthorized,
		fmt.Errorf("Failed to authorize JWT token"),
	)
}

func JWTFailedToRetrieveError() *APIError {
	return NewAPIError(
		http.StatusInternalServerError,
		fmt.Errorf("Failed to retrieve JWT token"),
	)
}

func TimeoutError() *APIError {
	return NewAPIError(
		http.StatusGatewayTimeout,
		fmt.Errorf("Timeout exceeded"),
	)
}

func NoUserFoundDbError() *APIError {
	return NewAPIError(
		http.StatusBadRequest,
		fmt.Errorf("Can't find the user according to the credentials"),
	)
}

func NotionIdMismatchError() *APIError {
	return NewAPIError(
		http.StatusBadRequest,
		fmt.Errorf("The notion account doesn't match "),
	)
}
