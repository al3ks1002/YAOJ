package repository

import (
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"../model"
)

type PostgreSQL struct {
	ConnectString string
	dbConn        *sqlx.DB
}

func (db *PostgreSQL) Init() error {
	dbConn, err := sqlx.Connect("postgres", db.ConnectString)
	if err != nil {
		return err
	}

	if err := dbConn.Ping(); err != nil {
		return err
	}

	db.dbConn = dbConn
	if err := db.createTablesIfNonExistant(); err != nil {
		return err
	}
	log.Println("Database started")

	return nil
}

var schema = `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT NOT NULL PRIMARY KEY,
		name TEXT NOT NULL
	);
		
	CREATE TABLE IF NOT EXISTS contests (
		id SERIAL NOT NULL PRIMARY KEY,
		owner_id TEXT NOT NULL,
		name TEXT NOT NULL,
		is_public BOOLEAN NOT NULL,
		start_time TIMESTAMPTZ NOT NULL,
		end_time TIMESTAMPTZ NOT NULL
	);

	CREATE TABLE IF NOT EXISTS problems (
		id SERIAL NOT NULL PRIMARY KEY,
		contest_id TEXT NOT NULL,
		name TEXT NOT NULL,
		description TEXT NOT NULL,
		timelimit INTEGER DEFAULT 1000
	);

	CREATE TABLE IF NOT EXISTS files (
		file_name TEXT NOT NULL,
		problem_id TEXT NOT NULL,
		f_id TEXT NOT NULL,
		PRIMARY KEY (file_name, problem_id)
	);

	CREATE TABLE IF NOT EXISTS submissions (
		id SERIAL NOT NULL PRIMARY KEY,
		user_id TEXT NOT NULL,
		problem_id TEXT NOT NULL,
		f_id TEXT NOT NULL,
		status TEXT NOT NULL,
		timestamp TIMESTAMPTZ NOT NULL
	);
`

func (db *PostgreSQL) createTablesIfNonExistant() error {
	if _, err := db.dbConn.Exec(schema); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) HandleLogin(user *model.User) error {
	if _, err := db.dbConn.NamedExec("INSERT INTO users (id, name) VALUES (:id, :name) ON CONFLICT (id) DO UPDATE SET name = :name", user); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) GetUserNameFromId(userId string) (string, error) {
	var userName string
	if err := db.dbConn.Get(&userName, "SELECT name FROM users WHERE id = $1", userId); err != nil {
		return "", err
	}
	return userName, nil
}

func (db *PostgreSQL) GetPublicContests() ([]model.Contest, error) {
	contests := []model.Contest{}
	if err := db.dbConn.Select(&contests, "SELECT * FROM contests WHERE is_public = true"); err != nil {
		return nil, err
	}
	for i, contest := range contests {
		if userName, err := db.GetUserNameFromId(contest.OwnerId); err != nil {
			return nil, err
		} else {
			contests[i].UserName = userName
		}
	}
	return contests, nil
}

func (db *PostgreSQL) GetUserContests(userId string) ([]model.Contest, error) {
	contests := []model.Contest{}
	if err := db.dbConn.Select(&contests, "SELECT * FROM contests WHERE owner_id = $1", userId); err != nil {
		return nil, err
	}
	for i, contest := range contests {
		if userName, err := db.GetUserNameFromId(contest.OwnerId); err != nil {
			return nil, err
		} else {
			contests[i].UserName = userName
		}
	}
	return contests, nil
}

func (db *PostgreSQL) AddNewContest(contest *model.Contest) error {
	if _, err := db.dbConn.NamedExec("INSERT INTO contests (owner_id, name, is_public, start_time, end_time) VALUES (:owner_id, :name, :is_public, :start_time, :end_time)", contest); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) GetContestWithId(contestId string) (*model.Contest, error) {
	contest := &model.Contest{}
	if err := db.dbConn.Get(contest, "SELECT * FROM contests WHERE id = $1", contestId); err != nil {
		return nil, err
	}
	return contest, nil
}

func (db *PostgreSQL) AddNewProblem(problem *model.Problem) error {
	if _, err := db.dbConn.NamedExec("INSERT INTO problems (contest_id, name, description, timelimit) VALUES (:contest_id, :name, :description, :timelimit)", problem); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) GetProblemsFromContest(contestId string) ([]model.Problem, error) {
	problems := []model.Problem{}
	if err := db.dbConn.Select(&problems, "SELECT * FROM problems WHERE contest_id = $1", contestId); err != nil {
		return nil, err
	}
	return problems, nil
}

func (db *PostgreSQL) GetProblemWithId(problemId string) (*model.Problem, error) {
	problem := &model.Problem{}
	if err := db.dbConn.Get(problem, "SELECT * FROM problems WHERE id = $1", problemId); err != nil {
		return nil, err
	}
	return problem, nil
}

func (db *PostgreSQL) DeleteContestWithId(contestId string) error {
	if _, err := db.dbConn.Exec("DELETE FROM contests WHERE id = $1", contestId); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) DeleteProblemWithId(problemId string) error {
	if _, err := db.dbConn.Exec("DELETE FROM problems WHERE id = $1", problemId); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) UpdateContest(contest *model.Contest) error {
	if _, err := db.dbConn.NamedExec("UPDATE contests SET owner_id = :owner_id, name = :name, is_public = :is_public, start_time = :start_time, end_time = :end_time WHERE id = :id", contest); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) UpdateProblem(problem *model.Problem) error {
	if _, err := db.dbConn.NamedExec("UPDATE problems SET name = :name, description = :description, timelimit = :timelimit WHERE id = :id", problem); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) AddFile(problemId string, fId string, fileName string) error {
	if rows, err := db.dbConn.Queryx("SELECT * FROM files WHERE file_name = $1 AND problem_id = $2", fileName, problemId); err != nil {
		return err
	} else {
		if rows.Rows.Next() {
			if _, err := db.dbConn.Exec("UPDATE files SET f_id = $1 WHERE file_name = $2 AND problem_id = $3", fId, fileName, problemId); err != nil {
				return err
			}
		} else {
			if _, err := db.dbConn.Exec("INSERT INTO files (file_name, problem_id, f_id) VALUES ($1, $2, $3)", fileName, problemId, fId); err != nil {
				return err
			}
		}
	}
	return nil
}

func (db *PostgreSQL) GetFilesForProblem(problemId string, terminationString string) ([]model.File, error) {
	files := []model.File{}
	if err := db.dbConn.Select(&files, "SELECT * FROM files WHERE problem_id = $1 AND file_name LIKE $2", problemId, "%"+terminationString); err != nil {
		return nil, err
	}

	return files, nil
}

func (db *PostgreSQL) GetFileWithId(fId string) (*model.File, error) {
	file := &model.File{}
	if err := db.dbConn.Get(file, "SELECT * FROM files WHERE f_id = $1", fId); err != nil {
		return nil, err
	}
	return file, nil
}

func (db *PostgreSQL) DeleteFileWithId(fId string) error {
	if _, err := db.dbConn.Exec("DELETE FROM files WHERE f_id = $1", fId); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) AddSubmission(submission *model.Submission) (string, error) {
	query := "INSERT INTO submissions (user_id, problem_id, f_id, status, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING id"
	stmt, err := db.dbConn.Prepare(query)
	if err != nil {
		return "", err
	}
	defer stmt.Close()
	var submissionId string
	err = stmt.QueryRow(submission.UserId, submission.ProblemId, submission.FId, submission.Status, submission.Timestamp).Scan(&submissionId)
	if err != nil {
		return "", err
	}
	return submissionId, nil
}

func (db *PostgreSQL) GetSubmissionsForProblem(problemId string) ([]model.Submission, error) {
	submissions := []model.Submission{}
	if err := db.dbConn.Select(&submissions, "SELECT * FROM submissions WHERE problem_id = $1", problemId); err != nil {
		return nil, err
	}
	for i, submission := range submissions {
		if userName, err := db.GetUserNameFromId(submission.UserId); err != nil {
			return nil, err
		} else {
			submissions[i].UserName = userName
		}
	}
	return submissions, nil
}

func (db *PostgreSQL) UpdateSubmissionStatus(submissionId string, newStatus string) error {
	if _, err := db.dbConn.Exec("UPDATE submissions SET status = $1 WHERE id = $2", newStatus, submissionId); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) GetTimelimit(problemId string) (int64, error) {
	var timelimit int64
	if err := db.dbConn.Get(&timelimit, "SELECT timelimit FROM problems WHERE id = $1", problemId); err != nil {
		return 0, err
	}
	return timelimit, nil
}
