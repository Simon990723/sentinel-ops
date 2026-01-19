# Video Demo Script: SentinelOps
**Target Duration:** 3 Minutes  
**Speaker:** Simon (Full-stack Developer)  
**Tone:** Professional, Technical, "Big Tech" SRE Style

---

## 0:00 - 0:30 | Introduction & Problem Statement
**(Visual: Camera on Speaker / Split screen with Singapore Traffic Map)**

"Hi, I'm Simon. Managing urban transit in a high-density city like Singapore requires more than just looking at cameras—it requires *intelligence*.

Today I'm presenting **SentinelOps**, a distributed observability system designed to monitor, analyze, and visualize real-time transit incidents using LTA DataMall APIs and Generative AI.

While most dashboards just show you *where* an accident happened, SentinelOps tells you *how bad it is* and *what to do about it*."

---

## 0:30 - 1:15 | Architecture Walkthrough
**(Visual: Mermaid Architecture Diagram zooming in on components)**

"I built this using a microservices architecture to ensure scalability and separation of concerns:

1.  **The Ingestor (Go):** On the left, we have our high-performance Ingestor written in **Go**. I chose Go for its concurrency—specifically Goroutines—which allows us to poll LTA's APIs efficiently. It creates a robust pipeline that feeds raw data into our database.
    *   *Note:* It features a 'Mock Mode' so development continues even if the LTA API is down.

2.  **The Analyst (Python):** This is the brain. Written in **Python**, it listens for new incidents and employs **GPT-4o** to function as an AI Site Reliability Engineer. It reads the raw text—like 'Vehicle breakdown at PIE'—and assigns an **Impact Score (1-10)** and a strategic summary.

3.  **The Persistence Layer:** Everything is stored in **Supabase (PostgreSQL)**, designed with `pgvector` support for future semantic search capabilities."

---

## 1:15 - 2:15 | Live Demo
**(Visual: Split screen. Left: Terminal running services. Right: Web Dashboard)**

"Let's see it in action.

**Step 1:** I'll start the Ingestor. You can see the logs here—it's detecting that I'm in 'Dev Mode' and is generating a mock incident: *'Accident on PIE towards Changi Airport'*.

**Step 2:** The Go service extracts this and immediately triggers the Python Analyst.
*(Point to Python Logs)*
Here, the AI Agent picks it up. It sees the keywords 'Accident' and 'PIE' (a major expressway) and calculates an Impact Score.
*Result:* It returns a **Score of 8/10** and advises 'Expect delays of 20 mins'.

**Step 3:** Finally, on our **Next.js Dashboard**, the incident appears instantly on the map, color-coded Red for high severity. This end-to-end flow happens in milliseconds."

---

## 2:15 - 2:45 | Code Highlight
**(Visual: VS Code showing `client.go` and `main.py`)**

"I want to highlight two engineering decisions:
1.  **Resilience:** In the Go code, you'll see strict error handling and interface decoupling. We don't just crash if the API fails; we degrade gracefully.
2.  **Strict Typing:** Across the stack—from Go structs to Pydantic models in Python—we enforce strict data schemas. This prevents the 'garbage in, garbage out' problem common in data pipelines."

---

## 2:45 - 3:00 | Conclusion
**(Visual: Back to Speaker / Dashboard wide shot)**

"SentinelOps represents a modern approach to Ops tooling—combining the speed of Go, the intelligence of Python, and the interactivity of React.

It’s not just a dashboard; it’s an automated analyst for Singapore's transport grid. Thank you."
