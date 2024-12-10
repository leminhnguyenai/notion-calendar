package filehandling

import (
	"path"

	"github.com/lpernett/godotenv"
)

func LoadEnv() error {
	dirname, err := GetDirname()
	if err != nil {
		return err
	}

	if err := godotenv.Load(path.Join(dirname, "../.env")); err != nil {
		return err
	}

	return nil
}
