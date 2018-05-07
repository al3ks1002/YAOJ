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
		name TEXT NOT NULL
	);
`

func (db *PostgreSQL) createTablesIfNonExistant() error {
	if _, err := db.dbConn.Exec(schema); err != nil {
		return err
	}
	return nil
}

func (db *PostgreSQL) GetAllContests() ([]model.Contest, error) {
	log.Println("PostgreSQL.GetAllContests() was called")
	contests := []model.Contest{}
	if err := db.dbConn.Select(&contests, "SELECT * FROM contests"); err != nil {
		log.Println(err)
		return nil, err
	}
	return contests, nil
}
