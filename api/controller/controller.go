package controller

import (
	"log"

	"../model"
	"../repository"
)

type Controller struct {
	Repository repository.Repository
}

func (ctrl *Controller) GetAllContests() ([]model.Contest, error) {
	log.Println("Controller.GetAllContests() was called")
	return ctrl.Repository.GetAllContests()
}
