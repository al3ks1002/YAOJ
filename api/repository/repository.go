package repository

import (
	"../model"
)

type Repository interface {
	Init() error
	GetPublicContests() ([]model.Contest, error)
	HandleLogin(*model.User) error
}
