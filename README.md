# ResQ-IQ: Gujarat Multi-Source Disaster Intelligence & Emergency Command System

An autonomous, full-stack disaster response and situational awareness platform customized for **Gujarat Cities, Districts, Coastal Ports, and River Basins** with **FastAPI**, **Real-Time WebSockets**, **GIS Leaflet Situation Map**, **AI/NLP Intelligence Pipeline**, **Safe Evacuation Routing**, and **Multi-Channel Alert Broadcasting**.

---

## ⚡ Quick Start & Live Access

### 1. Start the Unified Server
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Open Platform in Browser
- 🗺️ **Gujarat GIS Command Center Dashboard**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- 📖 **Interactive Swagger UI (REST API Playground)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- 📑 **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- 📡 **Live WebSocket Feed**: `ws://127.0.0.1:8000/ws/live-stream`

### 3. Run Automated Pytest Suite
```powershell
python -m pytest tests/test_backend.py -v
```

---

## 🏗️ Merged Full-Stack Architecture

```
vanguard26s/sahay-
├── backend/
│   ├── __init__.py
│   ├── config.py             # Gujarat Cities, Districts, Response Units, and Disaster Grids
│   ├── models.py             # Schemas for Incidents, Citizen SOS, Units, Dispatches, SitRep
│   ├── nlp_engine.py         # AI/NLP Classifier, Gujarati Vernacular Translation, NER Geocoding
│   ├── ingestion_service.py  # USGS Real-time Seismics, Multi-Source Gujarat Crisis Simulator
│   ├── dispatch_service.py   # Fleet Allocation, Proximity Distance & ETA Engine
│   ├── routing_service.py    # AI Safe Evacuation Routing & Hazard Avoidance Corridor Engine
│   ├── broadcast_service.py  # Mass SMS & WhatsApp Emergency Alert Notification Simulator
│   ├── database.py           # SQLite + SQLAlchemy Persistent Storage (disaster_iq.db)
│   ├── sitrep_service.py     # Automated Situation Report (SitRep) Generator
│   └── main.py               # FastAPI REST Endpoints, Static Frontend Mount, and WebSockets
├── frontend/
│   ├── index.html            # 3-Pane Command Dashboard & Leaflet GIS Situation Map
│   ├── style.css             # Glassmorphic Dark UI & Pulse Beacon Animations
│   └── app.js                # Map Controller, WebSocket Streamer, Safe Routing & SOS Modal
├── tests/
│   └── test_backend.py       # 13 Passing Pytest Unit & Integration Tests
├── .gitignore
├── push_to_github.py
└── README.md
```

---

## 📍 Gujarat Strategic Disaster Coverage

- **Central Gujarat**: Vadodara (Vishwamitri River, Karelibaug, Sayajigunj), Ahmedabad (Sabarmati River), Gandhinagar (GIFT City), Anand, Kheda, Panchmahal.
- **South Gujarat**: Surat (Tapi River, Singanpore Causeway, Adajan, Rander, Hazira Port), Bharuch (Narmada River Golden Bridge, Dahej SEZ), Navsari, Valsad, Vapi.
- **Kutch & Saurashtra**: Bhuj, Gandhidham, Kandla Port, Mandvi Beach, Mundra Port, Rajkot, Morbi, Jamnagar, Dwarka, Okha Port, Bhavnagar.
- **Response Units**: NDRF 6th Battalion (Jarod Base, Vadodara), Gujarat SDRF 1st Bn (Gandhinagar), SDRF Coastal & Rapid Water Rescue (Surat), Coast Guard & Marine SDRF (Okha).

---

## 📡 Core API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| **`/`** | `GET` | **Gujarat Command Dashboard & GIS Map** |
| **`/docs`** | `GET` | **Interactive Swagger UI Playground** |
| `/api/health` | `GET` | System health check and pipeline status |
| `/api/incidents` | `GET` | Multi-source disaster incidents with spatial radius filtering |
| `/api/sos` | `POST` | Citizen Emergency SOS webhook with instant P1 priority injection |
| `/api/units` | `GET` | List NDRF, SDRF, Medical, and Marine response battalions |
| `/api/dispatch/nearest` | `GET` | Calculate proximity and rank nearest available response units |
| `/api/dispatch` | `POST` | Issue formal dispatch order to a response unit |
| `/api/routing/safe-path` | `POST` | Calculate hazard-avoidance safe evacuation route |
| `/api/alerts/broadcast` | `POST` | Transmit mass SMS & WhatsApp emergency warning broadcast |
| `/api/analytics/sitrep` | `GET` | Quantitative Situation Report summary and casualty metrics |
| `/ws/live-stream` | `WS` | Real-time bi-directional incident stream |
