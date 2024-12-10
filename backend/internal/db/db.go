package db

import (
	"database/sql"
	"encoding/json"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/utils/filehandling"
)

type Sql struct {
	Db *sql.DB
}

func NewDb() (Sql, error) {
	if err := filehandling.LoadEnv(); err != nil {
		return Sql{}, err
	}

	user := os.Getenv("DB_USERNAME")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	connection := user + ":" + password + "@/" + dbname

	db, err := sql.Open("mysql", connection)
	if err != nil {
		return Sql{}, err
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	return Sql{Db: db}, nil
}

// CRUD operations for users

func (sqlDb *Sql) GetUser(refreshToken string) (*sql.Rows, error) {
	q, err := sqlDb.Db.Prepare("SELECT * FROM users WHERE refresh_token = ?")
	if err != nil {
		return nil, err
	}
	defer q.Close()

	rows, err := q.Query(refreshToken)
	if err != nil {
		return nil, err
	}

	return rows, nil
}

func (sql *Sql) CreateNewUser(
	userId string,
	email string,
	refreshToken string,
) error {
	userInputQ, err := sql.Db.Prepare(
		`INSERT INTO users(user_id, email, refresh_token, role) 
             VALUES(?, ?, ?, 'user') 
             ON DUPLICATE KEY UPDATE refresh_token = ?`,
	)
	if err != nil {
		return err
	}

	defer userInputQ.Close()

	settinggInputQ, err := sql.Db.Prepare(
		"INSERT IGNORE INTO settings(user_id) VALUES(?)",
	)
	if err != nil {
		return err
	}

	defer settinggInputQ.Close()

	if _, err = userInputQ.Exec(userId, email, refreshToken, refreshToken); err != nil {
		return err
	}

	if _, err = settinggInputQ.Exec(userId); err != nil {
		return err
	}

	return nil
}

// CRUD operations for connections
func checkOptionalField(o models.Option) (sql.NullString, error) {
	var str sql.NullString

	if o.Name == "" && o.Id == "" {
		str.Valid = false
		return str, nil
	}
	str.Valid = true
	jsonData, err := json.Marshal(o)
	if err != nil {
		return str, err
	}

	str.String = string(jsonData)
	return str, nil
}

func (sqlDb *Sql) CreateNewConn(conn models.NotionConnection) error {
	q, err := sqlDb.Db.Prepare(`
    INSERT INTO connections (
        connection_id,
        calendar_id,
        user_id,
        calendar_name,
        sync_rate,
        statistic,
        next_exec_time,
        db,
        event_name,
        date,
        description,
        done_method,
        done_method_option
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `)
	if err != nil {
		return err
	}

	defer q.Close()

	db, err := json.Marshal(conn.Db)
	if err != nil {
		return err
	}
	eventName, err := json.Marshal(conn.EventName)
	if err != nil {
		return err
	}
	date, err := json.Marshal(conn.Date)
	if err != nil {
		return err
	}

	description, err := checkOptionalField(conn.Description)
	if err != nil {
		return err
	}
	doneMethod, err := checkOptionalField(conn.DoneMethod)
	if err != nil {
		return err
	}
	doneMethodOption, err := checkOptionalField(conn.DoneMethodOption)
	if err != nil {
		return err
	}

	_, err = q.Exec(
		conn.ConnectionId,
		conn.CalendarId,
		conn.UserId,
		conn.CalendarName,
		conn.SyncRate,
		conn.Statistic,
		conn.NextExecTime,
		db,
		eventName,
		date,
		description,
		doneMethod,
		doneMethodOption,
	)
	if err != nil {
		return err
	}

	return nil
}
