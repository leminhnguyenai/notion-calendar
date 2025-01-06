package main

import (
	"log"
	"os"
	"path"
	"path/filepath"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/app"
	"github.com/lpernett/godotenv"
)

func loadEnv() error {
	absPath, err := os.Executable()
	if err != nil {
		return err
	}

	dirname := filepath.Dir(absPath)

	if err := godotenv.Load(path.Join(dirname, "../../.env")); err != nil {
		return err
	}

	return nil
}

func run() {
	if err := loadEnv(); err != nil {
		log.Fatal(err)
	}

	serverErrChan := make(chan error)

	go app.StartServer(serverErrChan)

	select {
	case err := <-serverErrChan:
		log.Fatal(err)
	}
}

func main() {
	run()
}
