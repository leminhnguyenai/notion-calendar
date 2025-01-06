package routes

import (
	"net/http"
	"os"
	"path"
	"path/filepath"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/connectionsControllers"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
)

func Connections() *api.Router {
	absPath, err := os.Executable()
	if err != nil {
		panic(err)
	}

	dirname := filepath.Dir(absPath)

	router := api.NewRouter()

	validateUserInputConn := middlewares.InitSchemaValidation(
		path.Join(dirname, ".././internal/schemas/userInputNotionConn.json"),
	)

	validateDeleteConn := middlewares.InitSchemaValidation(
		path.Join(dirname, ".././internal/schemas/deleteNotionConn.json"),
	)

	router.Use(middlewares.ValidateToken)

	router.GET("/", http.HandlerFunc(GetConnections))
	router.POST("/", validateUserInputConn(http.HandlerFunc(PostConnection)))
	router.PATCH("/", validateUserInputConn(http.HandlerFunc(PatchConnection)))
	router.DELETE("/", validateDeleteConn(http.HandlerFunc(DeleteConnection)))

	return router
}
