package db

import (
	"database/sql"
	"os"
)

func InitDb() (*sql.DB, error) {
	user := os.Getenv(
		"DB_USERNAME",
	)
	password := os.Getenv(
		"DB_PASSWORD",
	)
	dbname := os.Getenv(
		"DB_NAME",
	)
	connection := user + ":" + password + "@/" + dbname + "?parseTime=true"

	db, err := sql.Open(
		"mysql",
		connection,
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
