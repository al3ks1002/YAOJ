package db

import (
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Config struct {
	ConnectString string
}

func InitDb(cfg Config) (*sqlx.DB, error) {
	dbConn, err := sqlx.Connect("postgres", cfg.ConnectString)
	if err != nil {
		return nil, err
	}

	if err := dbConn.Ping(); err != nil {
		return nil, err
	}

	return dbConn, nil
}
