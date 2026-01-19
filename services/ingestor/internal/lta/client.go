package lta

import (
	"encoding/json"
	"fmt"
	"net/http"
)

const baseURL = "http://datamall2.mytransport.sg/ltaodataservice"

type LTAClient struct {
	APIKey     string
	HTTPClient *http.Client
}

type TrafficIncident struct {
	Type     string  `json:"Type"`
	Latitude  float64 `json:"Latitude"`
	Longitude float64 `json:"Longitude"`
	Message   string  `json:"Message"`
}

type IncidentResponse struct {
	Value []TrafficIncident `json:"value"`
}

func NewClient(apiKey string) *LTAClient {
	return &LTAClient{
		APIKey:     apiKey,
		HTTPClient: &http.Client{},
	}
}

// FetchTrafficIncidents hits the LTA endpoint for real-time traffic data
func (c *LTAClient) FetchTrafficIncidents() ([]TrafficIncident, error) {
	// MOCK MODE: Returns realistic simulated data for testing and demo purposes
	if c.APIKey == "" || c.APIKey == "mock" {
		return []TrafficIncident{
			{
				Type:      "Accident",
				Latitude:  1.3521,
				Longitude: 103.8198,
				Message:   "(19/1) 10:30 Accident on PIE (towards Changi Airport) after Adam Rd Exit. Avoid lane 1.",
			},
			{
				Type:      "Vehicle Breakdown",
				Latitude:  1.290270,
				Longitude: 103.851959,
				Message:   "(19/1) 10:45 Vehicle breakdown on ECP (towards City) at Benjamin Sheares Bridge. Expect delays.",
			},
			{
				Type:      "Roadworks",
				Latitude:  1.3200,
				Longitude: 103.8910,
				Message:   "(19/1) 11:00 Roadworks on KPE (towards TPE) after Defu Lane Exit. 2 lanes closed.",
			},
		}, nil
	}

	req, err := http.NewRequest("GET", baseURL+"/TrafficIncidents", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("AccountKey", c.APIKey)
	req.Header.Set("accept", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("LTA API error: %d", resp.StatusCode)
	}

	var result IncidentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result.Value, nil
}