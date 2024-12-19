package models

import "time"

type Option struct {
	Name string `json:"name"`
	Id   string `json:"id"`
}

type UserInputNotionConn struct {
	CalendarName     string `json:"calendar_name"`
	Db               Option `json:"db"`
	EventName        Option `json:"event_name"`
	Date             Option `json:"date"`
	Description      Option `json:"description"`
	DoneMethod       Option `json:"done_method"`
	DoneMethodOption Option `json:"done_method_option"`
	SyncRate         int    `json:"sync_rate"`
	Statistic        bool   `json:"statistic"`
}

type NotionConn struct {
	UserInputNotionConn
	ConnectionId string    `json:"connectionId"`
	CalendarId   string    `json:"calendarId"`
	UserId       string    `json:"userId"`
	NextExecTime time.Time `json:"nextExecTime"`
}
