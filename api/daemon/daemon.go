package daemon

import (
	"log"

	"../controller"
	"../repository"
	"../view"
)

type Config struct {
	Port          string
	ConnectString string
}

func Run(daemonConfig *Config) error {
	postgreSQLRepo := repository.PostgreSQL{ConnectString: daemonConfig.ConnectString}

	if err := postgreSQLRepo.Init(); err != nil {
		log.Printf("Error initializing repository: %v\n", err)
		return err
	}

	var repo repository.Repository = &postgreSQLRepo
	ctrl := controller.Controller{repo}

	ui := view.View{daemonConfig.Port, &ctrl}
	ui.Start()

	return nil
}
