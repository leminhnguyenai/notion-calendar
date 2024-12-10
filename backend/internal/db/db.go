package db

import (
	"database/sql"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
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

func (sql *Sql) GetUser(refreshToken string) (*sql.Rows, error) {
	q, err := sql.Db.Prepare("SELECT * FROM users WHERE refresh_token = ?")
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
