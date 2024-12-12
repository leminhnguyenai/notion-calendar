package models

import "time"

type Option struct {
	Name string `json:"name"`
	Id   string `json:"id"`
}

type UserInputNotionConn struct {
	CalendarName     string `json:"calendarName"`
	Db               Option `json:"db"`
	EventName        Option `json:"eventName"`
	Date             Option `json:"date"`
	Description      Option `json:"description"`
	DoneMethod       Option `json:"doneMethod"`
	DoneMethodOption Option `json:"doneMethodOption"`
	SyncRate         int    `json:"syncRate"`
	Statistic        bool   `json:"statistic"`
}

type NotionConn struct {
	UserInputNotionConn
	ConnectionId string    `json:"connectionId"`
	CalendarId   string    `json:"calendarId"`
	UserId       string    `json:"userId"`
	NextExecTime time.Time `json:"nextExecTime"`
}
