package filehandling

import (
	"os"
	"path/filepath"
)

func GetDirname() (string, error) {
	absPath, err := os.Executable()
	if err != nil {
		return "", err
	}

	return filepath.Dir(absPath), nil
}
