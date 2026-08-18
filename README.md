# ResQ-IQ: Gujarat Multi-Source Disaster Intelligence & Response Support Backend

An autonomous, real-time disaster intelligence and emergency response backend customized for **Gujarat Cities, Districts, Coastal Ports, and River Basins** built with **FastAPI**, **WebSockets**, **AI/NLP Pipeline**, **Safe Evacuation Routing**, and **Multi-Channel Alert Broadcasting**.

---

## ⚡ Quick Start

### 1. Run the Backend Server
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. View Interactive API Documentation
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Root API Index**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

### 3. Run Automated Pytest Suite
```powershell
python -m pytest tests/test_backend.py -v
```

---

## 🧩 Architecture & Modules

```
backend/
├── __init__.py
├── config.py             # Gujarat Cities, Districts, Response Units, and Disaster Grids
├── models.py             # Schemas for Incidents, Citizen SOS, Units, Dispatches, SitRep
├── nlp_engine.py         # AI/NLP Classifier, Gujarati Vernacular Translation, NER Geocoding
├── ingestion_service.py  # USGS Real-time Seismics, Multi-Source Gujarat Crisis Simulator
├── dispatch_service.py   # Fleet Allocation, Proximity Distance & ETA Engine
├── routing_service.py    # AI Safe Evacuation Routing & Hazard Avoidance Corridor Engine
├── broadcast_service.py  # Mass SMS & WhatsApp Emergency Alert Notification Simulator
├── database.py           # SQLite + SQLAlchemy Persistent Storage (disaster_iq.db)
├── sitrep_service.py     # Automated Situation Report (SitRep) Generator
└── main.py               # FastAPI REST Endpoints, OpenAPI Docs, and WebSockets
```

---

## 📡 Core API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| **`/docs`** | `GET` | **Interactive Swagger UI Playground** |
| `/api/health` | `GET` | System health check and pipeline status |
| `/api/incidents` | `GET` | Filtered multi-source disaster incidents with spatial radius filtering |
| `/api/incidents/{id}` | `GET` | Detailed incident record with NLP entities and verification score |
| `/api/incidents/{id}/status` | `PATCH` | Transition incident lifecycle status (`REPORTED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `RESOLVED`) |
| `/api/sos` | `POST` | Citizen Emergency SOS webhook with instant P1 priority injection |
| `/api/units` | `GET` | List NDRF, SDRF, Medical, and Marine response battalions |
| `/api/dispatch/nearest` | `GET` | Calculate proximity and rank nearest available response units |
| `/api/dispatch` | `POST` | Issue formal dispatch order to a response unit |
| `/api/incidents/{id}/resolve` | `POST` | Resolve incident and release assigned response unit |
| `/api/routing/safe-path` | `POST` | Calculate hazard-avoidance safe evacuation route |
| `/api/alerts/broadcast` | `POST` | Transmit mass SMS & WhatsApp emergency warning broadcast |
| `/api/alerts/broadcasts` | `GET` | Retrieve broadcast alert history |
| `/api/responders/checkin` | `POST` | Field responder live GPS location & status check-in |
| `/api/nlp/classify` | `POST` | Standalone AI/NLP analysis for Gujarati / English text |
| `/api/analytics/sitrep` | `GET` | Quantitative Situation Report summary and casualty metrics |
| `/ws/live-stream` | `WS` | Real-time bi-directional incident stream |
