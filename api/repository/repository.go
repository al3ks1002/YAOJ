package repository

import (
	"../model"
)

type Repository interface {
	Init() error
	HandleLogin(*model.User) error
	GetUserNameFromId(string) (string, error)
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
	AddSubmission(*model.Submission) (string, error)
	GetSubmissionsForProblem(string) ([]model.Submission, error)
	UpdateSubmissionStatus(string, string) error
	GetTimelimit(string) (int64, error)
	AddNewResult(string, string, string, int64) error
	GetSubmissionWithId(string) (*model.Submission, error)
	GetResultsForSubmission(string) ([]model.Result, error)
	UpdateSubmissionScore(string, float64) error
}
