package routes

import (
	"net/http"
	"path"

	. "github.com/leminhnguyenai/notion-calendar/backend/internal/controllers/connectionsControllers"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/middlewares"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/services/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
)

// TODO: Add GET connections route (Without Google API interaction)
// TODO: Add PATCH connections route (Without Google API interaction)
// TODO: Add DELETE connections route (Without Google API interaction)

func Connections() *api.Router {
	dirname, err := filehandling.GetDirname()
	if err != nil {
		panic(err)
	}

	router := api.NewRouter()

	validateUserInputConn := middlewares.InitSchemaValidation(
		path.Join(dirname, ".././internal/schemas/userInputNotionConn.json"),
	)

	router.Use(middlewares.ValidateAuth)

	// router.GET("/", GetConns)
	router.POST("/", validateUserInputConn(http.HandlerFunc(PostConns)))

	return router
}
