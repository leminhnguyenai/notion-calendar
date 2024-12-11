package customerrors

import "net/http"

func ServerError(err error) (int, map[string]interface{}) {
	return http.StatusInternalServerError, map[string]interface{}{
		"error": err.Error(),
	}
}
