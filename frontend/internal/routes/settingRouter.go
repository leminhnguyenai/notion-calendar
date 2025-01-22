package routes

import (
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/controllers/settingcontrollers"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/middlewares"
)

func SettingRouter() *api.Router {
	r := api.NewRouter()

	r.Use(middlewares.ValidateToken)

	r.GET("/", api.CustomHandlerFunc(settingcontrollers.SettingController))
	r.GET("/account",
		api.CustomHandlerFunc(settingcontrollers.GetAccountSection),
	)
	r.GET("/display",
		api.CustomHandlerFunc(settingcontrollers.GetDisplaySection),
	)

	return r
}
