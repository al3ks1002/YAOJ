package repository

import (
	"../model"
)

type Repository interface {
	Init() error
	HandleLogin(*model.User) error
	GetPublicContests() ([]model.Contest, error)
	GetUserContests(userId string) ([]model.Contest, error)
	AddNewContest(*model.Contest) error
	GetContestWithId(string) (*model.Contest, error)
	GetProblemsFromContest(string) ([]model.Problem, error)
	AddNewProblem(*model.Problem) error
	GetProblemWithId(string) (*model.Problem, error)
	DeleteContestWithId(string) error
	DeleteProblemWithId(string) error
	UpdateContest(*model.Contest) error
	UpdateProblem(*model.Problem) error
	AddFile(string, string, string) error
	GetFilesForProblem(string, string) ([]model.File, error)
	GetFileWithId(string) (*model.File, error)
	DeleteFileWithId(string) error
}
