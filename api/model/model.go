package model

type User struct {
	Id   string
	Name string
}

type Contest struct {
	Id          string
	OwnerId     string `db:"owner_id"`
	Name        string
	Description string
	IsPublic    bool `db:"is_public"`
}

type Problem struct {
	Id          string
	ContestId   string `db:"contest_id"`
	Name        string
	Description string
}
