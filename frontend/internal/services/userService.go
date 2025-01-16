package services

import (
	"context"
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/config"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/helpers/api"
	"github.com/leminhnguyenai/notion-calendar/frontend/internal/models"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (u *UserService) GetUser(
	ctx context.Context, userId string,
) (*models.User, error) {
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
	defer cancel()

	q, err := u.db.Prepare(
		`SELECT user_id, email, notion_id, role, re_auth FROM users WHERE user_id = ?`,
	)
	if err != nil {
		return nil, err
	}

	defer q.Close()

	errChan := make(chan error)

	var user *models.User

	go func() {
		rows, err := q.Query(userId)
		if err != nil {
			errChan <- err
		}

		for rows.Next() {
			user = &models.User{}
			user.NotionId.Valid = true

			if err := rows.Scan(
				&user.UserId,
				&user.Email,
				&user.NotionId,
				&user.Role,
				&user.ReAuth,
			); err != nil {
				errChan <- err
			}

			errChan <- nil
		}

		errChan <- nil
	}()

	for {
		select {
		case <-ctx.Done():
			return nil, api.TimeoutError()
		case err := <-errChan:
			if err != nil {
				return nil, err
			}

			return user, nil
		}
	}
}

func (u *UserService) CreateNewUser(
	ctx context.Context, user models.User,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
	defer cancel()

	userInputQ, err := u.db.Prepare(
		`INSERT IGNORE INTO users(user_id, email, role, re_auth) VALUES(?, ?, ?, ?)`,
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
			return api.TimeoutError()
		case err := <-errChan:
			return err
		}
	}
}

func (u *UserService) SetReauth(
	ctx context.Context,
	userId string,
	reauth bool,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
	defer cancel()

	q, err := u.db.Prepare(`UPDATE users SET reauth = ? WHERE user_id = ?`)
	if err != nil {
		return err
	}

	defer q.Close()

	errChan := make(chan error)

	go func() {
		if _, err = q.Exec(reauth, userId); err != nil {
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

func (u *UserService) SaveUserNotionId(
	ctx context.Context,
	userId string,
	notionId string,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
	defer cancel()

	q, err := u.db.Prepare(`UPDATE users SET notion_id = ? WHERE user_id = ?`)
	if err != nil {
		return err
	}

	defer q.Close()

	errChan := make(chan error)

	go func() {
		if _, err := q.Exec(notionId, userId); err != nil {
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

func (u *UserService) RemoveUserNotionId(
	ctx context.Context,
	userId string,
) error {
	ctx, cancel := context.WithTimeout(ctx, config.DbTimeout)
	defer cancel()

	q, err := u.db.Prepare(
		`UPDATE users SET notion_id = NULL WHERE user_id = ?`,
	)
	if err != nil {
		return err
	}

	defer q.Close()

	errChan := make(chan error)

	go func() {
		if _, err := q.Exec(userId); err != nil {
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
