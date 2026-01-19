# SentinelOps: Intelligent Urban Transit Monitoring System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-MVP-green.svg)
![Stack](https://img.shields.io/badge/stack-Go%20%7C%20Python%20%7C%20Next.js-blueviolet)

## 1. Overview

**SentinelOps** is a distributed, real-time observability platform designed to monitor Singapore's public transit infrastructure. By ingesting live traffic data from the **LTA DataMall API**, the system leverages an **AI Agent (GPT-4o)** to perform instant impact analysis, categorizing incidents by severity (1-10) and summarizing operational risks.

Built with "Big Tech" engineering standards (Microservices, Event-Driven, Cloud-Native), this project demonstrates a production-grade architecture suitable for high-scale urban monitoring.

### Key Features
*   **Real-Time Ingestion (Go):** High-concurrency polling of LTA APIs using Goroutines. Includes a **Mock Mode** for offline development.
*   **AI Analyst (Python/FastAPI):** Autonomous agent that processes raw incident text into structured intelligence (Impact Score + Executive Summary).
*   **Geospatial Database (PostgreSQL/Supabase):** Centralized state management with `pgvector` readiness for future semantic search.
*   **Live Dashboard (Next.js 15):** React Server Components (RSC) and Leaflet maps for high-performance visualization.

---

## 2. System Architecture

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
