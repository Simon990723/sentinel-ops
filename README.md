# SentinelOps: Intelligent Urban Transit Monitoring System

[![Video Demo](https://img.shields.io/badge/YouTube-Video%20Demo-red?logo=youtube)](https://youtu.be/NWZn2zGjyx0)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-MVP-green.svg)

## 1. Overview

**SentinelOps** is a distributed, real-time observability platform designed to monitor Singapore's public transit infrastructure. By ingesting live traffic data from the **LTA DataMall API**, the system leverages an **AI Agent (GPT-4o)** to perform instant impact analysis, categorizing incidents by severity (1-10) and summarizing operational risks.

Built with "Big Tech" engineering standards (Microservices, Event-Driven, Cloud-Native), this project demonstrates a production-grade architecture suitable for high-scale urban monitoring.

### Key Features
*   **Real-Time Ingestion (Go):** High-concurrency polling of LTA APIs using Goroutines. Includes a **Mock Mode** for offline development.
*   **AI Analyst (Python/FastAPI):** Autonomous agent that processes raw incident text into structured intelligence (Impact Score + Executive Summary).
*   **Geospatial Database (PostgreSQL/Supabase):** Centralized state management with `pgvector` readiness for future semantic search.
*   **Live Dashboard (Next.js 15):** React Server Components (RSC) and Leaflet maps for high-performance visualization.

---

## 2. Project Structure & File Descriptions

To provide a comprehensive overview for the SentinelOps architecture, here is a breakdown of the key files and their specific roles:

### Backend: Ingestor Service (Go)
*   **`services/ingestor/cmd/main.go`**: The entry point for the Go service. It initializes the environment, database connections, and orchestrates the lifecycle of the ingestion workers and concurrent pollers.
*   **`services/ingestor/internal/lta/client.go`**: Contains the logic for interacting with the LTA DataMall API. It handles HTTP request formation, API key injection, and response parsing. This file also houses the **Mock Mode engine**, which generates synthetic transit data when API keys are absent.
*   **`services/ingestor/internal/db/repository.go`**: Implements the PostgreSQL persistence logic, utilizing a professional UPSERT pattern to ensure data idempotency and integrity.

### Backend: AI Analyst Service (Python)
*   **`services/analyst/main.py`**: The "brain" of the analyst. This FastAPI application defines the webhooks triggered by the Go service and utilizes the OpenAI SDK to send raw incident text to **GPT-4o**. It handles prompt engineering to extract severity scores (1-10) and executive summaries.

### Data & Infrastructure
*   **`database/schema.sql`**: The blueprint for the PostgreSQL database. It defines the tables for incidents and AI summaries, enforcing data integrity through unique constraints.
*   **`docker-compose.yml`**: Orchestrates the local development environment, spinning up the PostgreSQL instance, Go Ingestor, and Python Analyst as isolated containers.

### Frontend: Web Dashboard (Next.js 15)
*   **`web/src/app/page.tsx`**: The main landing page. It utilizes React Server Components to fetch the real-time state of the transit network directly from the database, optimizing load performance.
*   **`web/src/components/IncidentMap.tsx`**: Manages the geospatial visualization. It renders an interactive Google Maps-style interface with custom markers for active incidents, color-coded by AI-calculated severity.
*   **`web/src/lib/db.ts`**: The data access layer for the frontend, featuring a singleton connection pool and a **frontend resilience fallback** that serves mock data if the primary database is unreachable.

---

## 3. System Architecture

The system follows a strict microservices pattern with clear separation of concerns:

```mermaid
graph TD
    LTA[LTA DataMall API] -->|JSON| Ingestor[Go Service]
    Ingestor -->|UPSERT| DB[(Supabase PostgreSQL)]
    Ingestor -.->|HTTP Trigger| Analyst[Python AI Agent]
    Analyst -->|Read Raw| DB
    Analyst -->|OpenAI GPT-4o| LLM[LLM Provider]
    LLM -->|Analysis| Analyst
    Analyst -->|Write Score/Summary| DB
    DB -->|Read State| Web[Next.js Dashboard]
    User((Operator)) -->|View| Web
```

---

## 3. Technology Stack

### Backend Services
*   **Ingestor Service:** Written in **Go (Golang)** for its raw performance and concurrency primitives. It handles the "extract" and "load" phases of ETL.
*   **Analyst Service:** Written in **Python** with **FastAPI**. It serves as the logic layer, utilizing the rich ecosystem of AI libraries (OpenAI SDK).

### Data & Infrastructure
*   **Database:** **PostgreSQL** (hosted on Supabase). Uses strict constraints (`UNIQUE`, `Foreign Keys`) to ensure data integrity.
*   **Deployment:** Docker Compose for local orchestration; designed for Kubernetes deployment.

### Frontend
*   **Web Dashboard:** **Next.js 15 (App Router)**. Leveraging Server-Side Rendering (SSR) for SEO and fast initial loads.

---

## 4. Getting Started

### Prerequisites
*   Docker & Docker Compose
*   Go 1.21+
*   Python 3.11+
*   Node.js 20+
*   LTA DataMall API Key (Optional: System runs in Mock Mode without it)
*   OpenAI API Key

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/simon/sentinel-ops.git
    cd sentinel-ops
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory (see `.env.example`).
    ```ini
    DB_URL=postgresql://user:pass@host:5432/postgres
    OPENAI_API_KEY=sk-...
    LTA_API_KEY=... (Or leave empty for Mock Mode)
    ```

3.  **Run with Docker (Recommended)**
    ```bash
    docker-compose up --build
    ```

4.  **Local Development (Manual)**
    *   **DB:** Ensure Postgres is running.
    *   **Ingestor:** `cd services/ingestor && go run cmd/main.go`
    *   **Analyst:** `cd services/analyst && uvicorn main:app --reload --port 8001`
    *   **Web:** `cd web && npm run dev`

---

## 5. Engineering Standards & Decisions

### Why Go for Ingestion?
Singapore's traffic data updates frequently. Go's `goroutines` allow us to spawn lightweight threads for polling multiple endpoints (Bus, Traffic, Train) simultaneously without the overhead of Python's GIL.

### Simulation & Resilience Architecture (Mock Mode)
To ensure high availability and enable offline development, the system implements a **Circuit Breaker** pattern. 
*   **Detection:** If the Ingestor detects missing API keys or connectivity issues, it automatically degrades to **Simulation Mode**.
*   **Generation:** Synthetic incidents are generated with realistic geospatial data and timestamps.
*   **Validation:** This allows the entire pipeline (AI analysis -> DB Storage -> Frontend Visualization) to be stress-tested deterministically, a critical requirement for SRE (Site Reliability Engineering) workflows.

### Why Python for Analysis?
Python remains the lingua franca of AI. Using FastAPI allows us to integrate seamlessly with OpenAI's SDK and `pandas` for future data science tasks.

### Mock Mode & Resilience
The Ingestor service detects missing API keys and automatically switches to **Mock Mode**, generating realistic synthetic data. This ensures developers can work on the UI/AI logic without needing production credentials or internet access.

---

## 6. Future Roadmap
*   **Vector Search:** Implement RAG (Retrieval-Augmented Generation) to find historical incidents similar to current ones.
*   **Telegram Alerts:** Push high-impact (>8/10) incidents to operational teams via bot.
*   **Predictive Modeling:** Use historical data to predict traffic jam duration.

---

**Author:** Simon  
**License:** MIT
