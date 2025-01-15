package services

import (
	"context"
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/models"
)

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
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
	defer cancel()

	q, err := c.db.Prepare(`
	    SELECT
	    	connection_id,
	        calendar_id,
	        user_id,
	        calendar_name,
            REPLACE(db -> '$.id', '"', "") AS db_id,
            REPLACE(db -> '$.name', '"', "") AS db_name,
            REPLACE(event_name -> '$.id','"', "") AS event_name_id,
            REPLACE(event_name -> '$.name','"', "") AS event_name_name,
            REPLACE(date -> '$.id','"', "") AS date_id,
            REPLACE(date -> '$.name','"', "") AS date_name,
            IFNULL(REPLACE(description -> '$.id','"', ""), "") AS description_id,
            IFNULL(REPLACE(description -> '$.name','"', ""), "") AS description_name,
            IFNULL(REPLACE(done_method -> '$.id','"', ""), "") AS done_method_id,
            IFNULL(REPLACE(done_method -> '$.name','"', ""), "") AS done_method_name,
            IFNULL(REPLACE(done_method_option -> '$.id','"', ""), "") AS done_method_option_id,
            IFNULL(REPLACE(done_method_option -> '$.name','"', ""), "") AS done_method_option_name,
            sync_rate,
            statistic,
            next_exec_time
        FROM connections WHERE user_id = ?;
    `)

	if err != nil {
		return nil, err
	}

	defer q.Close()

	type Response struct {
		results []models.NotionConn
		err     error
	}

	resch := make(chan Response)

	go func() {
		rows, err := q.Query(userId)
		if err != nil {
			resch <- Response{nil, err}
		}

		notionConns := []models.NotionConn{}

		for rows.Next() {
			notionConn := models.NotionConn{}

			err := rows.Scan(
				&notionConn.ConnectionId,
				&notionConn.CalendarId,
				&notionConn.UserId,
				&notionConn.CalendarName,
				&notionConn.Db.Id,
				&notionConn.Db.Name,
				&notionConn.EventName.Id,
				&notionConn.EventName.Name,
				&notionConn.Date.Id,
				&notionConn.Date.Name,
				&notionConn.Description.Id,
				&notionConn.Description.Name,
				&notionConn.DoneMethod.Id,
				&notionConn.DoneMethod.Name,
				&notionConn.DoneMethodOption.Id,
				&notionConn.DoneMethodOption.Name,
				&notionConn.SyncRate,
				&notionConn.Statistic,
				&notionConn.NextExecTime,
			)
			if err != nil {
				resch <- Response{nil, err}
			}

			notionConns = append(notionConns, notionConn)
		}

		resch <- Response{notionConns, nil}
	}()

	for {
		select {
		case <-ctx.Done():
			return nil, api.TimeoutError()
		case res := <-resch:
			return res.results, res.err
		}
	}
}

func (c *ConnService) CreateNewConn(
	ctx context.Context,
	conn models.NotionConn,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
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
        VALUES (
            ?,?,?,?,?,?,?,?,?,?,
            REPLACE( ?, '{"name":"","id":""}', NULL ),
            REPLACE( ?, '{"name":"","id":""}', NULL ),
            REPLACE( ?, '{"name":"","id":""}', NULL )
        )
    `)
	if err != nil {
		return err
	}

	defer q.Close()

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
			`{"name":"`+conn.Db.Name+`","id":"`+conn.Db.Id+`"}`,
			`{"name":"`+conn.EventName.Name+`","id":"`+conn.EventName.Id+`"}`,
			`{"name":"`+conn.Date.Name+`","id":"`+conn.Date.Id+`"}`,
			`{"name":"`+conn.Description.Name+`","id":"`+conn.Description.Id+`"}`,
			`{"name":"`+conn.DoneMethod.Name+`","id":"`+conn.DoneMethod.Id+`"}`,
			`{"name":"`+conn.DoneMethodOption.Name+`","id":"`+conn.DoneMethodOption.Id+`"}`,
		)
		errChan <- err
	}()

	for {
		select {
		case <-ctx.Done():
			return api.TimeoutError()
		case err := <-errChan:
			return err
		}
	}
}

func (c *ConnService) UpdateConn(
	ctx context.Context,
	connectionId string,
	conn models.UserInputNotionConn,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
	defer cancel()

	q, err := c.db.Prepare(`
            UPDATE connections SET
                calendar_name = ?,
                sync_rate = ?,
                statistic = ?,
                db = ?,
                event_name = ?,
                date = ?,
                description = REPLACE( ?, '{"name":"","id":""}', NULL ),
                done_method = REPLACE( ?, '{"name":"","id":""}', NULL ),
                done_method_option = REPLACE( ?, '{"name":"","id":""}', NULL )
            WHERE connection_id = ?
    `)
	if err != nil {
		return err
	}

	defer q.Close()

	errChan := make(chan error)

	go func() {
		_, err = q.Exec(
			conn.CalendarName,
			conn.SyncRate,
			conn.Statistic,
			`{"name":"`+conn.Db.Name+`","id":"`+conn.Db.Id+`"}`,
			`{"name":"`+conn.EventName.Name+`","id":"`+conn.EventName.Id+`"}`,
			`{"name":"`+conn.Date.Name+`","id":"`+conn.Date.Id+`"}`,
			`{"name":"`+conn.Description.Name+`","id":"`+conn.Description.Id+`"}`,
			`{"name":"`+conn.DoneMethod.Name+`","id":"`+conn.DoneMethod.Id+`"}`,
			`{"name":"`+conn.DoneMethodOption.Name+`","id":"`+conn.DoneMethodOption.Id+`"}`,
			connectionId,
		)

		if err != nil {
			errChan <- err
		}

		errChan <- nil
	}()

	for {
		select {
		case <-ctx.Done():
			return api.TimeoutError()
		case err := <-errChan:
			return err
		}
	}
}

func (c *ConnService) DeleteConn(
	ctx context.Context,
	connectionId string,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
	defer cancel()

	q, err := c.db.Prepare("DELETE FROM connections WHERE connection_id = ?")
	if err != nil {
		return err
	}

	defer q.Close()

	errChan := make(chan error)

	go func() {
		_, err = q.Exec(connectionId)

		if err != nil {
			errChan <- err
		}

		errChan <- nil
	}()

	for {
		select {
		case <-ctx.Done():
			return api.TimeoutError()
		case err := <-errChan:
			return err
		}
	}
}

