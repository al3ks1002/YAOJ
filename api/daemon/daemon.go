package daemon

import (
	"log"

	"../controller"
	"../judge"
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
	judge := judge.Judge{}
	ctrl := controller.Controller{repo, judge}

	ui := view.View{daemonConfig.Port, &ctrl}
	ui.Start()

	return nil
}
