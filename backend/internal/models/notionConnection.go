package models

type option struct {
	Name string `json:"name"`
	Id   string `json:"id"`
}

type UserInputNotionConn struct {
	CalendarName     string `json:"calendarName"`
	Db               option `json:"db"`
	EventName        option `json:"eventName"`
	Date             option `json:"date"`
	Description      option `json:"description"`
	DoneMethod       option `json:"doneMethod"`
	DoneMethodOption option `json:"doneMethodOption"`
	SyncRate         int    `json:"syncRate"`
	Statistic        bool   `json:"statistic"`
}

type NotionConnection struct {
	UserInputNotionConn
	CalendarId   string `json:"calendarId"`
	UserId       string `json:"userId"`
	NextExecTime string `json:"nextExecTime"`
}
