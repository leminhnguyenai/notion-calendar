package main

import (
	"log"

	"github.com/leminhnguyenai/notion-calendar/backend/internal/app"
)

func run() error {
	serverErrChan := make(chan error)

	go app.StartServer(serverErrChan)

	select {
	case err := <-serverErrChan:
		return err
	}
}

func main() {
	err := run()
	if err != nil {
		log.Println(err)
	}
}
