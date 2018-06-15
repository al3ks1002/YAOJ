package model

import "time"

type User struct {
	Id   string
	Name string
}

type Contest struct {
	Id       string
	OwnerId  string `db:"owner_id"`
	Name     string
	IsPublic bool `db:"is_public"`
	UserName string
}

type Problem struct {
	Id          string
	ContestId   string `db:"contest_id"`
	Name        string
	Description string
	Timelimit   int64 `json:"Timelimit,string"`
}

type File struct {
	FileName  string `db:"file_name"`
	ProblemId string `db:"problem_id"`
	FId       string `db:"f_id"`
}

type Submission struct {
	Id        string
	UserId    string `db:"user_id"`
	ProblemId string `db:"problem_id"`
	FId       string `db:"f_id"`
	Status    string
	Timestamp time.Time
	UserName  string
}
