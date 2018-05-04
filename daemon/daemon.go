package daemon

import (
	"log"

	"mlc/db"
	"mlc/view"
)

type Config struct {
	DbConfig   db.Config
	ViewConfig view.Config
}

func Run(daemonConfig *Config) error {
	err := db.InitDb(daemonConfig.DbConfig)
	if err != nil {
		log.Printf("Error initializing database: %v\n", err)
		return err
	}

	view.Start(daemonConfig.ViewConfig)

	return nil
}
