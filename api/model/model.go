package model

type User struct {
	Id   string
	Name string
}

type Contest struct {
	Id       string
	OwnerId  string `db:"owner_id"`
	Name     string
	IsPublic bool `db:"is_public"`
}

type Problem struct {
	Id          string
	ContestId   string `db:"contest_id"`
	Name        string
	Description string
}

type File struct {
	FileName  string `db:"file_name"`
	ProblemId string `db:"problem_id"`
	FId       string `db:"f_id"`
}
