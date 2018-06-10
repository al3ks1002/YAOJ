package repository

import (
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
		is_public BOOLEAN NOT NULL
	);

	CREATE TABLE IF NOT EXISTS problems (
		id SERIAL NOT NULL PRIMARY KEY,
		contest_id TEXT NOT NULL,
		name TEXT NOT NULL,
		description TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS tests (
		test_name TEXT NOT NULL,
		problem_id TEXT NOT NULL,
		f_id TEXT NOT NULL,
		PRIMARY KEY (test_name, problem_id)
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

func (db *PostgreSQL) GetPublicContests() ([]model.Contest, error) {
	contests := []model.Contest{}
	if err := db.dbConn.Select(&contests, "SELECT * FROM contests WHERE is_public = true"); err != nil {
		return nil, err
	}
	return contests, nil
}

func (db *PostgreSQL) GetUserContests(userId string) ([]model.Contest, error) {
	contests := []model.Contest{}
	if err := db.dbConn.Select(&contests, "SELECT * FROM contests WHERE owner_id = $1", userId); err != nil {
		return nil, err
	}
	return contests, nil
}

func (db *PostgreSQL) AddNewContest(contest *model.Contest) error {
	if _, err := db.dbConn.NamedExec("INSERT INTO contests (owner_id, name, is_public) VALUES (:owner_id, :name, :is_public)", contest); err != nil {
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
	if _, err := db.dbConn.NamedExec("INSERT INTO problems (contest_id, name, description) VALUES (:contest_id, :name, :description)", problem); err != nil {
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
	if _, err := db.dbConn.NamedExec("UPDATE contests SET owner_id = :owner_id, name = :name, is_public = :is_public WHERE id = :id", contest); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) UpdateProblem(problem *model.Problem) error {
	if _, err := db.dbConn.NamedExec("UPDATE problems SET name = :name, description = :description WHERE id = :id", problem); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) AddTest(problemId string, fId string, testName string) error {
	if rows, err := db.dbConn.Queryx("SELECT * FROM tests WHERE test_name = $1 AND problem_id = $2", testName, problemId); err != nil {
		return err
	} else {
		if rows.Rows.Next() {
			if _, err := db.dbConn.Exec("UPDATE tests SET f_id = $1 WHERE test_name = $2 AND problem_id = $3", fId, testName, problemId); err != nil {
				return err
			}
		} else {
			if _, err := db.dbConn.Exec("INSERT INTO tests (test_name, problem_id, f_id) VALUES ($1, $2, $3)", testName, problemId, fId); err != nil {
				return err
			}
		}
	}
	return nil
}

func (db *PostgreSQL) GetTestsForProblem(problemId string, terminationString string) ([]model.Test, error) {
	tests := []model.Test{}
	if err := db.dbConn.Select(&tests, "SELECT * FROM tests WHERE problem_id = $1 AND test_name LIKE $2", problemId, "%"+terminationString); err != nil {
		return nil, err
	}

	return tests, nil
}

func (db *PostgreSQL) GetTestWithId(fId string) (*model.Test, error) {
	test := &model.Test{}
	if err := db.dbConn.Get(test, "SELECT * FROM tests WHERE f_id = $1", fId); err != nil {
		return nil, err
	}
	return test, nil
}

func (db *PostgreSQL) DeleteTestWithId(fId string) error {
	if _, err := db.dbConn.Exec("DELETE FROM tests WHERE f_id = $1", fId); err != nil {
		return err
	}
	return nil
}
