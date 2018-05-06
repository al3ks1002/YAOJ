package main

import (
	"flag"
	"log"

	"./daemon"
)

func processFlags() *daemon.Config {
	daemonConfig := &daemon.Config{}

	flag.StringVar(&daemonConfig.ViewConfig.Port, "port", "8080", "Port")
	flag.StringVar(&daemonConfig.DbConfig.ConnectString, "db-connect", "user=alex dbname=mlc sslmode=disable", "DB Connect String")

	flag.Parse()
	return daemonConfig
}

func main() {
	daemonConfig := processFlags()

	if err := daemon.Run(daemonConfig); err != nil {
		log.Printf("Error in main(): %v", err)
	}
}
