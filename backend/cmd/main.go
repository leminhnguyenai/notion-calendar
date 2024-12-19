package main

import (
	"github.com/leminhnguyenai/notion-calendar/backend/internal/app"
)

func run() {
	serverErrChan := make(chan error)

	go app.StartServer(serverErrChan)

	select {
	case err := <-serverErrChan:
		panic(err)
	}
}

func main() {
	run()
}
