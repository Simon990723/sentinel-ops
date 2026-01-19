-- Enable the vector extension for future AI features
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the table for traffic incidents using professional naming conventions
CREATE TABLE IF NOT EXISTS traffic_incidents (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    message TEXT,
    -- AI Analysis Columns
    impact_score INT,       -- 1-10 score
    ai_analysis TEXT,       -- Summary/Reasoning
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Unique constraint to prevent duplicate entries from the same incident
    CONSTRAINT unique_incident UNIQUE (type, latitude, longitude, message)
);

-- Index for faster spatial queries
CREATE INDEX IF NOT EXISTS idx_incident_location ON traffic_incidents (latitude, longitude);
