package db

import (
	"database/sql"
	"sentinel-ops/internal/lta"
	_ "github.com/lib/pq" // PostgreSQL driver
)

type Repository struct {
	Conn *sql.DB
}

func NewRepository(dbURL string) (*Repository, error) {
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, err
	}
	
	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &Repository{Conn: db}, nil
}

// SaveIncidents uses a professional UPSERT pattern to avoid duplicates
// Returns the IDs of the newly inserted incidents (ignoring duplicates)
func (r *Repository) SaveIncidents(incidents []lta.TrafficIncident) ([]int, error) {
	query := `
		INSERT INTO traffic_incidents (type, latitude, longitude, message)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT ON CONSTRAINT unique_incident DO NOTHING
		RETURNING id;
	`

	var newIDs []int

	for _, inc := range incidents {
		// We use QueryRow because we expect at most one ID (or none if conflict)
		var id int
		err := r.Conn.QueryRow(query, inc.Type, inc.Latitude, inc.Longitude, inc.Message).Scan(&id)
		
		if err != nil {
			if err == sql.ErrNoRows {
				// Duplicate found, skip
				continue
			}
			return nil, err
		}
		newIDs = append(newIDs, id)
	}
	return newIDs, nil
}