# CITE: This logic for FastAPI/Postgres integration was drafted with assistance 
# from Gemini (AI) to align with professional microservice patterns. 
# The business logic for SG transit impact is my original work.

import os
import psycopg2
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SentinelOps Analyst")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Your Style: Use snake_case for DB fields and camelCase for logic where appropriate
class ImpactAssessment(BaseModel):
    incidentId: int
    impactScore: int
    analysis: str

def get_db_connection():
    # Adding sslmode='require' is mandatory for Supabase cloud connections
    return psycopg2.connect(
        os.getenv("DB_URL"),
        sslmode='require'
    )

@app.post("/analyze/{incident_id}")
async def analyze_incident(incident_id: int):
    """
    AI Agent logic: Fetches incident, analyzes impact, and updates DB.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    
    # 1. Fetch raw incident data
    cur.execute("SELECT message FROM traffic_incidents WHERE id = %s", (incident_id,))
    message = cur.fetchone()[0]
    
    # 2. AI Analysis (Prompt Engineering for Big Tech standard)
    # Asking for JSON format for robust parsing
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a Singapore traffic SRE. Analyze the incident and return a JSON object with two fields: 'impact_score' (integer 1-10) and 'summary' (concise text)."},
            {"role": "user", "content": f"Analyze this LTA incident: {message}"}
        ],
        response_format={"type": "json_object"}
    )
    
    content = response.choices[0].message.content
    import json
    data = json.loads(content)
    
    impact_score = data.get("impact_score", 0)
    ai_summary = data.get("summary", "Analysis failed.")
    
    # 3. Save analysis back to DB (Updating new columns)
    cur.execute(
        "UPDATE traffic_incidents SET impact_score = %s, ai_analysis = %s WHERE id = %s",
        (impact_score, ai_summary, incident_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {"status": "success", "analysis": analysis_text}

# Start the server: uvicorn main:app --host 0.0.0.0 --port 8001