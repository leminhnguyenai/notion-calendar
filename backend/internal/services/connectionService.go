package services

import (
	"context"
	"database/sql"
	"encoding/json"

	_ "github.com/go-sql-driver/mysql"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
)

func checkOptionalField(
	o models.Option,
) (sql.NullString, error) {
	var str sql.NullString

	if o.Name == "" && o.Id == "" {
		str.Valid = false
		return str, nil
	}
	str.Valid = true
	jsonData, err := json.Marshal(
		o,
	)
	if err != nil {
		return str, err
	}

	str.String = string(
		jsonData,
	)
	return str, nil
}

type ConnService struct {
	db *sql.DB
}

func NewConnService(db *sql.DB) *ConnService {
	return &ConnService{db: db}
}

func (c *ConnService) GetConns(
	ctx context.Context,
	userId string,
) ([]models.NotionConn, error) {
	ctx, cancel := context.WithTimeout(ctx, config.DbWaitTime)
	defer cancel()

	q, err := c.db.Prepare(`
	    SELECT
	        connection_id,
	        calendar_id,
	        calendar_name,
	        user_id,
	        db,
	        event_name,
	        date,
	        description,
	        done_method,
            done_method_option,
            sync_rate,
            statistic,
            next_exec_time
        FROM connections WHERE user_id = ?`)
	if err != nil {
		return nil, err
	}

	defer q.Close()

	type Response struct {
		result []models.NotionConn
		err    error
	}

	resch := make(chan Response)

	go func() {

		rows, err := q.Query(
			userId,
		)
		if err != nil {
			resch <- Response{nil, err}
		}

		notionConns := []models.NotionConn{}

		for rows.Next() {
			var notionConn models.NotionConn
			var db []byte
			var eventName []byte
			var date []byte
			var description []byte
			var doneMethod []byte
			var doneMethodOption []byte

			err := rows.Scan(
				&notionConn.ConnectionId,
				&notionConn.CalendarId,
				&notionConn.CalendarName,
				&notionConn.UserId,
				&db,
				&eventName,
				&date,
				&description,
				&doneMethod,
				&doneMethodOption,
				&notionConn.SyncRate,
				&notionConn.Statistic,
				&notionConn.NextExecTime,
			)
			if err != nil {
				resch <- Response{nil, err}
			}

			err = json.Unmarshal(db, &notionConn.Db)
			err = json.Unmarshal(db, &notionConn.EventName)
			err = json.Unmarshal(db, &notionConn.Date)
			err = json.Unmarshal(db, &notionConn.Description)
			err = json.Unmarshal(db, &notionConn.DoneMethod)
			err = json.Unmarshal(db, &notionConn.DoneMethodOption)
			if err != nil {
				resch <- Response{nil, err}
			}

			notionConns = append(
				notionConns,
				notionConn,
			)
		}

		resch <- Response{notionConns, nil}
	}()

	for {
		select {
		case <-ctx.Done():
			return nil, api.TimeoutError()
		case res := <-resch:
			if res.err != nil {
				return nil, res.err
			}
			return res.result, nil
		}
	}
}

func (c *ConnService) CreateNewConn(
	ctx context.Context,
	conn models.NotionConn,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbWaitTime)
	defer cancel()

	q, err := c.db.Prepare(`
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
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
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

	errChan := make(chan error)

	go func() {
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
		errChan <- err
	}()

	for {
		select {
		case <-ctx.Done():
			return api.TimeoutError()
		case err := <-errChan:
			if err != nil {
				return err
			}

			return nil
		}
	}
}

func (c *ConnService) UpdateConn(
	ctx context.Context,
	connectionId string,
	conn models.UserInputNotionConn,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbWaitTime)
	defer cancel()

	q, err := c.db.Prepare(`
            UPDATE connections SET
                calendar_name = ?,
                sync_rate = ?,
                statistic = ?,
                db = ?,
                event_name = ?,
                date = ?,
                description = ?,
                done_method = ?,
                done_method_option = ?
            WHERE connection_id = ?`)
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

	errChan := make(chan error)

	go func() {
		_, err = q.Exec(
			conn.CalendarName,
			conn.SyncRate,
			conn.Statistic,
			db,
			eventName,
			date,
			description,
			doneMethod,
			doneMethodOption,
			connectionId,
		)

		errChan <- err
	}()

	for {
		select {
		case <-ctx.Done():
			return api.TimeoutError()
		case err := <-errChan:
			if err != nil {
				return err
			}

			return nil
		}
	}
}

func (c *ConnService) DeleteConn(
	ctx context.Context,
	connectionId string,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbWaitTime)
	defer cancel()

	q, err := c.db.Prepare(
		"DELETE FROM connections WHERE connection_id = ?",
	)
	if err != nil {
		return err
	}

	defer q.Close()

	errChan := make(chan error)

	go func() {
		_, err = q.Exec(
			connectionId,
		)

		errChan <- err
	}()

	for {
		select {
		case <-ctx.Done():
			return api.TimeoutError()
		case err := <-errChan:
			if err != nil {
				return err
			}

			return nil
		}
	}
}
