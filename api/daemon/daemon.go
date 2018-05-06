package daemon

import (
	"fmt"
	"log"

	"../db"
	"../view"
)

type Config struct {
	DbConfig   db.Config
	ViewConfig view.Config
}

func Run(daemonConfig *Config) error {
	dbConn, err := db.InitDb(daemonConfig.DbConfig)
	if err != nil {
		log.Printf("Error initializing database: %v\n", err)
		return err
	}

	fmt.Println(dbConn)
	view.Start(daemonConfig.ViewConfig)

	return nil
}
