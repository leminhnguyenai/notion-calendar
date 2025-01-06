package routes

import (
	"net/http"
	"path"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/connectionsControllers"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
)

func Connections() *api.Router {
	dirname, err := filehandling.GetDirname()
	if err != nil {
		panic(err)
	}

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
