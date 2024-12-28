package services

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/leminhnguyenai/notion-calendar/backend/internal/models"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (u *UserService) GetUser(
	ctx context.Context, googleRefreshToken string,
) (*models.User, error) {
	ctx, cancel := context.WithTimeout(ctx, time.Millisecond*300)
	defer cancel()

	q, err := u.db.Prepare(
		`SELECT 
           user_id,
           email,
           google_refresh_token,
           notion_access_token,
           role
		FROM users WHERE google_refresh_token = ?`,
	)
	if err != nil {
		return nil, err
	}
	defer q.Close()

	type Response struct {
		rows *sql.Rows
		err  error
	}

	resch := make(chan Response)

	go func() {
		rows, err := q.Query(
			googleRefreshToken,
		)
		if err != nil {
			resch <- Response{nil, err}
		}

		resch <- Response{rows, nil}
	}()

	for {
		select {
		case <-ctx.Done():
			return nil, fmt.Errorf("Time out exceeded")
		case res := <-resch:
			var user models.User
			user.NotionAccessToken.Valid = true

			for res.rows.Next() {
				err := res.rows.Scan(
					&user.UserId,
					&user.Email,
					&user.GoogleRefreshToken,
					&user.NotionAccessToken,
					&user.Role,
				)
				if err != nil {
					return nil, err
				}
			}

			return &user, nil
		}
	}
}

func (u *UserService) CreateNewUser(
	ctx context.Context, user models.User,
) error {
	ctx, cancel := context.WithTimeout(ctx, time.Millisecond*300)
	defer cancel()

	userInputQ, err := u.db.Prepare(
		`INSERT INTO users(user_id, email, google_refresh_token, role)
             VALUES(?, ?, ?, 'user')
             ON DUPLICATE KEY UPDATE google_refresh_token = ?`,
	)
	if err != nil {
		return err
	}

	defer userInputQ.Close()

	settinggInputQ, err := u.db.Prepare(
		"INSERT IGNORE INTO settings(user_id) VALUES(?)",
	)
	if err != nil {
		return err
	}

	defer settinggInputQ.Close()

	errChan := make(chan error)

	go func() {
		if _, err = userInputQ.Exec(
			user.UserId,
			user.Email,
			user.GoogleRefreshToken,
			user.GoogleRefreshToken,
		); err != nil {
			errChan <- err
		}

		if _, err = settinggInputQ.Exec(user.UserId); err != nil {
			errChan <- err
		}

		errChan <- nil
	}()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("Time out exceeded")
		case err := <-errChan:
			return err
		}
	}
}
