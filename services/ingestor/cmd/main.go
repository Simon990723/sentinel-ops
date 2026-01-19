// CITE: This logic for FastAPI/Postgres integration was drafted with assistance 
// from Gemini (AI) to align with professional microservice patterns. 
// The business logic for SG transit impact is my original work.

package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"sentinel-ops/internal/db"
	"sentinel-ops/internal/lta"
)

func main() {
	apiKey := os.Getenv("LTA_API_KEY")
	dbURL := os.Getenv("DB_URL") // Provided by docker-compose

	// Initialize DB
	repo, err := db.NewRepository(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to Supabase: %v", err)
	}
	defer repo.Conn.Close()

	client := lta.NewClient(apiKey)

	log.Println("SentinelOps Ingestor started...")

	// Run once immediately on startup for testing
	processIncidents(client, repo)

	// Then Fetch and Save loop
	ticker := time.NewTicker(2 * time.Minute)
	for range ticker.C {
		go processIncidents(client, repo)
	}
}

func processIncidents(client *lta.LTAClient, repo *db.Repository) {
	log.Println("Fetching and storing latest incidents...")
	incidents, err := client.FetchTrafficIncidents()
	if err != nil {
		log.Printf("Fetch error: %v", err)
		return
	}

	newIDs, err := repo.SaveIncidents(incidents)
	if err != nil {
		log.Printf("Save error: %v", err)
		return
	}

	log.Printf("Processed %d incidents. New: %d", len(incidents), len(newIDs))

	// Trigger AI Analysis for new incidents
	for _, id := range newIDs {
		go triggerAnalyst(id)
	}
}

// triggerAnalyst notifies the Python service to perform AI reasoning on a new incident
func triggerAnalyst(incidentID int) {
	// In a local dev environment, 'analyst' is likely on localhost:8001
	// Use ANALYST_URL env var if available, else default
	baseURL := os.Getenv("ANALYST_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8001"
	}
	
	url := fmt.Sprintf("%s/analyze/%d", baseURL, incidentID)

	resp, err := http.Post(url, "application/json", nil)
	if err != nil {
		log.Printf("Failed to notify Analyst service: %v", err)
		return
	}
	defer resp.Body.Close()

	log.Printf("Successfully triggered AI analysis for Incident #%d", incidentID)
}
