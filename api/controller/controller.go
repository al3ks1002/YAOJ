package controller

import (
	"../model"
	"../repository"
)

type Controller struct {
	Repository repository.Repository
}

func (ctrl *Controller) GetPublicContests() ([]model.Contest, error) {
	return ctrl.Repository.GetPublicContests()
}

func (ctrl *Controller) GetUserContests(userId string) ([]model.Contest, error) {
	return ctrl.Repository.GetUserContests(userId)
}

func (ctrl *Controller) HandleLogin(user *model.User) error {
	return ctrl.Repository.HandleLogin(user)
}

func (ctrl *Controller) AddNewContest(contest *model.Contest) error {
	return ctrl.Repository.AddNewContest(contest)
}

func (ctrl *Controller) GetContestWithId(contestId string) (*model.Contest, error) {
	return ctrl.Repository.GetContestWithId(contestId)
}

func (ctrl *Controller) GetProblemsFromContest(contestId string) ([]model.Problem, error) {
	return ctrl.Repository.GetProblemsFromContest(contestId)
}

func (ctrl *Controller) AddNewProblem(problem *model.Problem) error {
	return ctrl.Repository.AddNewProblem(problem)
}

func (ctrl *Controller) GetProblemWithId(problemId string) (*model.Problem, error) {
	return ctrl.Repository.GetProblemWithId(problemId)
}

func (ctrl *Controller) DeleteContestWithId(contestId string) error {
	return ctrl.Repository.DeleteContestWithId(contestId)
}

func (ctrl *Controller) IsPublic(contestId string) bool {
	if contest, err := ctrl.GetContestWithId(contestId); err != nil {
		return false
	} else {
		return contest.IsPublic
	}
}

func (ctrl *Controller) IsMyContest(userId string, contestId string) bool {
	if contest, err := ctrl.GetContestWithId(contestId); err != nil {
		return false
	} else {
		return contest.OwnerId == userId
	}
}
