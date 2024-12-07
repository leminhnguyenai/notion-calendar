package filehandling

import (
	"os"
	"path"
	"path/filepath"

	"github.com/lpernett/godotenv"
)

func LoadEnv() error {
	absPath, err := os.Executable()
	if err != nil {
		return err
	}

	dirname := filepath.Dir(absPath)

	if err := godotenv.Load(path.Join(dirname, "../.env")); err != nil {
		return err
	}

	return nil
}
