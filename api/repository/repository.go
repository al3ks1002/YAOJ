package repository

import (
	"../model"
)

type Repository interface {
	Init() error
	GetAllContests() ([]model.Contest, error)
}
