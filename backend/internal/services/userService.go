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

// TODO: Change this later to use user's id instead of the token
func (u *UserService) GetUser(
	ctx context.Context, userId string,
) (*models.User, error) {
	ctx, cancel := context.WithTimeout(ctx, time.Millisecond*300)
	defer cancel()

	q, err := u.db.Prepare(
		`SELECT 
           user_id,
           email,
           google_refresh_token,
           notion_access_token,
           role,
           re_auth 
		FROM users WHERE user_id = ?`,
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
			userId,
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
					&user.ReAuth,
				)
				if err != nil {
					return nil, err
				}
				return &user, nil
			}

			// NOTE: If no row is scanned, then return no user as nil
			return nil, nil
		}
	}
}

func (u *UserService) CreateNewUser(
	ctx context.Context, user models.User,
) error {
	ctx, cancel := context.WithTimeout(ctx, time.Millisecond*300)
	defer cancel()

	// TODO: Add a check before this to check whether the use exists already or not
	userInputQ, err := u.db.Prepare(
		`INSERT IGNORE INTO users(user_id, email, google_refresh_token, role, re_auth)
             VALUES(?, ?, ?, ?, ?)`)
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
			user.Role,
			user.ReAuth,
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

func (u *UserService) SetReAuth(
	ctx context.Context,
	userId string,
	reauth bool,
) error {
	ctx, cancel := context.WithTimeout(ctx, time.Millisecond*300)
	defer cancel()

	q, err := u.db.Prepare(`
	    UPDATE users SET (
	        reauth = ?
	    )
	    WHERE user_id = ?
	`)
	if err != nil {
		return err
	}

	defer q.Close()

	errChan := make(chan error)

	go func() {
		_, err = q.Exec(reauth, userId)
		if err != nil {
			errChan <- err
		}

		errChan <- nil
	}()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("Time limit exceed")
		case err := <-errChan:
			return err
		}
	}
}
