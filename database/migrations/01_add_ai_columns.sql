-- Migration to add AI analysis columns to existing traffic_incidents table
ALTER TABLE traffic_incidents 
ADD COLUMN IF NOT EXISTS impact_score INT,
ADD COLUMN IF NOT EXISTS ai_analysis TEXT;
