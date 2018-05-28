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
}
