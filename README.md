# Multi-Source Disaster Intelligence & Response Support System (Backend)

An autonomous, real-time disaster intelligence and emergency dispatch backend built with **FastAPI**, **WebSockets**, and an **AI/NLP Crisis Pipeline**.

---

## ⚡ Quick Start

### 1. Run the Backend Server
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. View Interactive API Documentation
Open your browser and navigate to:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 3. Run Automated Test Suite
```powershell
python -m pytest tests/test_backend.py -v
```

---

## 🧩 Core Endpoints Summary

- `GET /api/incidents`: Query filtered multi-source incidents with spatial radius filtering.
- `POST /api/sos`: Submit Citizen SOS with automated P1 priority assignment and geocoding.
- `GET /api/units`: List NDRF, SDRF, Medical, and Engineering response battalions.
- `GET /api/dispatch/nearest`: Calculate proximity and rank nearest available response teams.
- `POST /api/dispatch`: Issue dispatch order to a response unit.
- `POST /api/incidents/{id}/resolve`: Resolve incident and release assigned unit.
- `POST /api/nlp/classify`: Standalone crisis text classification and NER extraction.
- `GET /api/analytics/sitrep`: Quantitative Situation Report briefings and casualty metrics.
- `WS /ws/live-stream`: Bi-directional real-time crisis event stream.
