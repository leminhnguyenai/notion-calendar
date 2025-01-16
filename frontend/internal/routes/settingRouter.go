package routes

import (
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers/settingcontroller"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/middlewares"
)

func SettingRouter() *api.Router {
	r := api.NewRouter()

	r.GET("/", middlewares.ValidateToken(api.CustomHandlerFunc(
		settingcontroller.SettingController,
	)))

	return r
}
