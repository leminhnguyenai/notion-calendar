package connectionscontrollers

import "net/http"

func GetConns(r *http.Request) (int, map[string]interface{}) {
	return http.StatusOK, map[string]interface{}{}
}
