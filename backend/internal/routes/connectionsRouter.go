package routes

import (
	"os"
	"path"
	"path/filepath"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controller/connectionscontrollers"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
)

func ConnectionsRouter() *api.Router {
	absPath, err := os.Executable()
	if err != nil {
		panic(err)
	}

	dirname := filepath.Dir(absPath)

	r := api.NewRouter()

	validateUserInputConn := middlewares.InitSchemaValidation(
		path.Join(dirname, ".././internal/schemas/userInputNotionConn.json"),
	)

	validateDeleteConn := middlewares.InitSchemaValidation(
		path.Join(dirname, ".././internal/schemas/deleteNotionConn.json"),
	)

	r.Use(middlewares.ValidateToken)

	r.GET("/", api.CustomHandlerFunc(GetConnections))
	r.POST("/", validateUserInputConn(api.CustomHandlerFunc(PostConnection)))
	r.PATCH("/", validateUserInputConn(api.CustomHandlerFunc(PatchConnection)))
	r.DELETE("/", validateDeleteConn(api.CustomHandlerFunc(DeleteConnection)))

	return r
}
