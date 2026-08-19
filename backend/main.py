"""
FastAPI Main Application and WebSocket Streaming Server for Disaster Intelligence System.
Full End-to-End Platform with Integrated GIS Map UI, Safe Routing, and Mass Alert Broadcasts.
"""
import os
import json
import asyncio
import logging
from typing import List, Optional, Set, Dict, Any
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, BackgroundTasks, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend.config import APP_NAME, APP_VERSION, SIMULATION_SCENARIOS, DISASTER_TYPES, URGENCY_LEVELS, SOURCE_TYPES
from backend.models import (
    DisasterIncident,
    CitizenSOSReport,
    ResponseUnit,
    DispatchOrder,
    DispatchRequest,
    StatusUpdateRequest,
    SitRepSummary,
    SimulationControlRequest,
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse,
    UserProfile,
    NewsArticleItem,
    SocialMediaFeedItem,
    IntelHarvestRequest,
    DirectSMSAlertRequest,
    DirectSMSAlertRecord,
    EmergencyFacility,
    RemedyGuide
)
from backend.nlp_engine import nlp_engine
from backend.ingestion_service import ingestion_service
from backend.dispatch_service import dispatch_service, haversine_distance_km
from backend.sitrep_service import sitrep_service
from backend.routing_service import routing_service
from backend.broadcast_service import broadcast_service, BroadcastRequest, BroadcastRecord, TelecomGatewayConfig
from backend.auth_service import auth_service
from backend.news_social_harvester import news_social_harvester
from backend.emergency_directory_service import emergency_directory_service
from backend.database import SessionLocal, DBIncident, DBResponseUnit, DBDispatchOrder, DBAlertBroadcast

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("DisasterIQ-Backend")

# Active WebSocket clients tracker
active_websockets: Set[WebSocket] = set()


def persist_incident_to_db(incident: DisasterIncident):
    """Save or update incident in persistent SQLite database."""
    try:
        db = SessionLocal()
        existing = db.query(DBIncident).filter(DBIncident.id == incident.id).first()
        if existing:
            existing.status = incident.status
            existing.assigned_unit_id = incident.assigned_unit_id
            existing.assigned_unit_name = incident.assigned_unit_name
            existing.updated_at = incident.updated_at
        else:
            db_item = DBIncident(
                id=incident.id,
                source=incident.source,
                source_url=incident.source_url,
                author=incident.author,
                raw_text=incident.raw_text,
                translated_text=incident.translated_text,
                detected_language=incident.detected_language,
                disaster_type=incident.disaster_type,
                urgency_level=incident.urgency_level,
                urgency_score=incident.urgency_score,
                location_name=incident.location_name,
                latitude=incident.latitude,
                longitude=incident.longitude,
                confidence_score=incident.confidence_score,
                verification_status=incident.verification_status,
                verification_score=incident.verification_score,
                verification_sources=json.dumps(incident.verification_sources),
                needs_identified=json.dumps(incident.needs_identified),
                victim_count_estimated=incident.victim_count_estimated,
                status=incident.status,
                assigned_unit_id=incident.assigned_unit_id,
                assigned_unit_name=incident.assigned_unit_name,
                created_at=incident.created_at,
                updated_at=incident.updated_at,
                is_sos=incident.is_sos
            )
            db.add(db_item)
        db.commit()
        db.close()
    except Exception as e:
        logger.warning(f"Database persist error: {e}")


async def broadcast_to_websockets(message_dict: dict):
    """Broadcast JSON message to all active WebSocket clients."""
    if not active_websockets:
        return
    disconnected = set()
    for ws in list(active_websockets):
        try:
            await ws.send_json(message_dict)
        except Exception:
            disconnected.add(ws)
    for ws in disconnected:
        active_websockets.discard(ws)


async def on_new_incident_ingested(incident: DisasterIncident):
    """Callback triggered whenever an incident is ingested (simulation, live API, or Citizen SOS)."""
    persist_incident_to_db(incident)
    await broadcast_to_websockets({
        "event": "NEW_INCIDENT",
        "data": incident.model_dump()
    })


# Continuous background crisis stream worker
simulation_task: Optional[asyncio.Task] = None


async def background_crisis_stream_worker():
    """Continuously generates realistic ground reports and syncs sensors."""
    logger.info("Background Disaster Stream Worker started.")
    counter = 0
    while True:
        try:
            if ingestion_service.is_streaming:
                synthetic_inc = ingestion_service.generate_synthetic_incident()
                await ingestion_service.emit_incident(synthetic_inc)

                counter += 1
                if counter % 15 == 0:
                    await ingestion_service.fetch_live_usgs_earthquakes()

            delay = max(1.5, ingestion_service.stream_delay_seconds)
            await asyncio.sleep(delay)
        except asyncio.CancelledError:
            logger.info("Disaster stream worker cancelled.")
            break
        except Exception as e:
            logger.error(f"Error in disaster stream worker: {e}")
            await asyncio.sleep(4.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed initial DB
    for inc in ingestion_service.get_all_incidents():
        persist_incident_to_db(inc)

    ingestion_service.register_event_callback(on_new_incident_ingested)
    global simulation_task
    simulation_task = asyncio.create_task(background_crisis_stream_worker())
    logger.info("ResQ-IQ Disaster Intelligence Backend & UI is LIVE.")
    yield
    if simulation_task:
        simulation_task.cancel()


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="""
# Multi-Source Disaster Intelligence & Emergency Response Support System (ResQ-IQ)

### Core Capabilities:
* **Interactive Command Dashboard**: Full-featured GIS situation map with Dark Matter tiles, live pulsing SOS beacons, heatmaps, and dispatch modals.
* **Multi-Source Ingestion**: Live USGS Seismic Feeds, GDACS RSS, Crowdsourced Citizen SOS, Synthetic Crisis Stream.
* **AI / NLP Intelligence Pipeline**: Disaster Type Classification, Urgency Tier Scoring (P1 Critical to P4 Low), Indic Vernacular Translation, Entity & Landmark Geocoding.
* **Geospatial Dispatch Engine**: Haversine Proximity Ranking, Capability-based Unit Matching (Boats, Ambulances, Drones), Incident Lifecycle State Machine.
* **Safe Evacuation Routing**: Hazard avoidance algorithm calculating safe travel paths around floods & landslides.
* **Emergency Alert Broadcasting**: Multi-channel broadcast simulator for SMS, WhatsApp, and CAP emergency warnings.
* **Real-time Streaming**: Bi-directional WebSockets (`/ws/live-stream`).
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for open accessibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Frontend & Health Endpoints ---

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")

@app.get("/", response_class=HTMLResponse, tags=["Frontend Command Center"])
async def serve_index():
    """Serve the SAHAY Gujarat Command Center Web Application."""
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file, media_type="text/html")
    return HTMLResponse("<h1>SAHAY Command Center Loading...</h1>")


@app.get("/style.css", tags=["Frontend Static Assets"])
async def serve_style():
    """Serve the Command Center stylesheet."""
    style_file = os.path.join(FRONTEND_DIR, "style.css")
    if os.path.exists(style_file):
        return FileResponse(style_file, media_type="text/css")
    raise HTTPException(status_code=404, detail="style.css not found")


@app.get("/app.js", tags=["Frontend Static Assets"])
async def serve_app_js():
    """Serve the Command Center JavaScript application."""
    js_file = os.path.join(FRONTEND_DIR, "app.js")
    if os.path.exists(js_file):
        return FileResponse(js_file, media_type="application/javascript")
    raise HTTPException(status_code=404, detail="app.js not found")


@app.get("/api", tags=["System Information"])
async def api_info():
    """Root platform information, OpenAPI Swagger docs, and API routes."""
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "status": "OPERATIONAL",
        "region": "Gujarat, India",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_schema": "/openapi.json"
        },
        "endpoints": {
            "health": "/api/health",
            "incidents": "/api/incidents",
            "citizen_sos": "/api/sos",
            "response_units": "/api/units",
            "dispatch": "/api/dispatch",
            "safe_routing": "/api/routing/safe-path",
            "emergency_broadcasts": "/api/alerts/broadcast",
            "sitrep": "/api/analytics/sitrep",
            "nlp_analysis": "/api/nlp/classify",
            "websocket_stream": "/ws/live-stream"
        }
    }


@app.get("/api/health", tags=["System Information"])
async def health_check():
    """System health check, pipeline metrics, and database stats."""
    return {
        "status": "OPERATIONAL",
        "app": APP_NAME,
        "version": APP_VERSION,
        "active_incidents": len(ingestion_service.incidents),
        "active_units": len(dispatch_service.units),
        "ws_connections": len(active_websockets),
        "active_scenario": ingestion_service.active_scenario_key,
        "stream_active": ingestion_service.is_streaming
    }


# --- Authentication & Role-Based Access Control Endpoints ---

@app.post("/api/auth/register", response_model=AuthResponse, tags=["Authentication & Access Control"])
async def register(req: UserRegisterRequest):
    """Register a new Citizen or Authority account."""
    try:
        return auth_service.register_user(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login", response_model=AuthResponse, tags=["Authentication & Access Control"])
async def login(req: UserLoginRequest):
    """Authenticate user credentials and issue a session token."""
    try:
        return auth_service.login_user(req)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.get("/api/auth/me", response_model=UserProfile, tags=["Authentication & Access Control"])
async def get_current_user(token: Optional[str] = Query(None)):
    """Retrieve profile of authenticated user from token."""
    if not token:
        return auth_service.users["commander@gsdma.gujarat.gov.in"]["profile"]
    user = auth_service.get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")
    return user


@app.post("/api/auth/logout", tags=["Authentication & Access Control"])
async def logout(token: Optional[str] = Query(None)):
    """Log out active user session."""
    if token:
        auth_service.logout_token(token)
    return {"status": "SUCCESS", "message": "Signed out successfully."}


# --- Agency Data Ingestion & OSINT News Endpoints ---

@app.get("/api/ingestion/news", response_model=List[NewsArticleItem], tags=["Agency Data Ingestion & News"])
async def get_disaster_news(limit: int = Query(50, ge=1, le=200)):
    """Retrieve verified breaking disaster news bulletins for agencies."""
    return news_social_harvester.get_news_articles(limit)


@app.post("/api/ingestion/news/harvest", response_model=List[NewsArticleItem], tags=["Agency Data Ingestion & News"])
async def trigger_news_harvest():
    """Trigger real-time news agency crawler to ingest breaking bulletins."""
    return news_social_harvester.harvest_latest_news()


@app.get("/api/ingestion/social-osint", response_model=List[SocialMediaFeedItem], tags=["Agency Data Ingestion & News"])
async def get_social_osint(limit: int = Query(50, ge=1, le=200)):
    """Retrieve multi-source OSINT social media crisis signals."""
    return news_social_harvester.get_social_posts(limit)


@app.post("/api/ingestion/intel/submit", tags=["Agency Data Ingestion & News"])
async def submit_agency_intel(req: IntelHarvestRequest):
    """Field agency intelligence input form: Ingest raw news or tweet with automatic AI NLP extraction."""
    result = news_social_harvester.process_manual_intel(req)
    return {"status": "INGESTED", "result": result}


@app.get("/api/ingestion/sources-stats", tags=["Agency Data Ingestion & News"])
async def get_sources_stats():
    """Telemetry and credibility metrics across news agencies and social platforms."""
    return news_social_harvester.get_sources_stats()


# --- Incident Management Endpoints ---

@app.get("/api/incidents", response_model=List[DisasterIncident], tags=["Incident Intelligence"])
async def list_incidents(
    disaster_type: Optional[str] = Query(None, description="Filter by disaster type (flood, landslide, cyclone, etc.)"),
    urgency_level: Optional[str] = Query(None, description="Filter by urgency tier (P1_CRITICAL, P2_HIGH, P3_MEDIUM, P4_LOW)"),
    status: Optional[str] = Query(None, description="Filter by status (REPORTED, IN_REVIEW, DISPATCHED, IN_PROGRESS, RESOLVED)"),
    source: Optional[str] = Query(None, description="Filter by source (social_media_x, citizen_sos, usgs_seismic, etc.)"),
    is_sos: Optional[bool] = Query(None, description="Filter critical SOS requests only"),
    near_lat: Optional[float] = Query(None, description="Center latitude for spatial radius query"),
    near_lng: Optional[float] = Query(None, description="Center longitude for spatial radius query"),
    radius_km: Optional[float] = Query(50.0, description="Spatial search radius in kilometers"),
    limit: int = Query(100, ge=1, le=500)
):
    """Retrieve filtered list of multi-source disaster incidents with optional geospatial radius filtering."""
    incidents = ingestion_service.get_all_incidents()
    
    if disaster_type and disaster_type != "ALL":
        incidents = [i for i in incidents if i.disaster_type.lower() == disaster_type.lower()]
    if urgency_level and urgency_level != "ALL":
        incidents = [i for i in incidents if i.urgency_level == urgency_level]
    if status and status != "ALL":
        incidents = [i for i in incidents if i.status == status]
    if source and source != "ALL":
        incidents = [i for i in incidents if i.source == source]
    if is_sos is not None:
        incidents = [i for i in incidents if i.is_sos == is_sos]

    # Geospatial radius filter
    if near_lat is not None and near_lng is not None:
        incidents = [
            i for i in incidents
            if haversine_distance_km(near_lat, near_lng, i.latitude, i.longitude) <= radius_km
        ]

    return incidents[:limit]


@app.get("/api/incidents/{incident_id}", response_model=DisasterIncident, tags=["Incident Intelligence"])
async def get_incident(incident_id: str = Path(..., description="Unique Incident ID")):
    """Get full details, NLP extracted entities, and verification breakdown for an incident."""
    inc = ingestion_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc


@app.patch("/api/incidents/{incident_id}/status", response_model=DisasterIncident, tags=["Incident Intelligence"])
async def update_incident_status(incident_id: str, payload: StatusUpdateRequest):
    """Update incident lifecycle status (e.g. REPORTED -> IN_REVIEW -> DISPATCHED -> RESOLVED)."""
    inc = ingestion_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    inc.status = payload.status
    if payload.status == "RESOLVED":
        dispatch_service.resolve_incident(inc)

    persist_incident_to_db(inc)

    await broadcast_to_websockets({
        "event": "INCIDENT_UPDATED",
        "data": inc.model_dump()
    })
    return inc


@app.post("/api/sos", response_model=DisasterIncident, tags=["Citizen SOS Reporting"])
async def submit_sos_report(report: CitizenSOSReport):
    """
    Direct Citizen Emergency SOS endpoint.
    Automatically assigns P1 Critical priority, executes geocoding, and broadcasts to active dispatchers.
    """
    incident = await ingestion_service.submit_citizen_sos(report)
    persist_incident_to_db(incident)
    return incident


# --- Response Fleet & Dispatch Endpoints ---

@app.get("/api/units", response_model=List[ResponseUnit], tags=["Response Fleet & Logistics"])
async def list_response_units():
    """Retrieve all NDRF, SDRF, Medical Quick Reaction, and Army Engineering response units."""
    return dispatch_service.get_all_units()


@app.get("/api/units/{unit_id}", response_model=ResponseUnit, tags=["Response Fleet & Logistics"])
async def get_response_unit(unit_id: str):
    """Retrieve specific response unit status, equipment inventory, and active deployment."""
    unit = dispatch_service.get_unit(unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Response unit not found")
    return unit


@app.get("/api/dispatch/nearest", tags=["Response Fleet & Logistics"])
async def get_nearest_response_units(
    lat: float = Query(..., description="Target Latitude"),
    lng: float = Query(..., description="Target Longitude"),
    disaster_type: Optional[str] = Query(None, description="Disaster category to match specialized equipment")
):
    """
    Calculate geodesic proximity, disaster equipment matching, and estimated response ETA.
    Returns ranked list of response battalions.
    """
    nearest = dispatch_service.find_nearest_units(lat, lng, disaster_type=disaster_type)
    return nearest


@app.post("/api/dispatch", response_model=DispatchOrder, tags=["Response Fleet & Logistics"])
async def dispatch_unit(req: DispatchRequest):
    """
    Dispatch a response unit to an incident.
    Transitions unit to DISPATCHED status and binds active incident tracking.
    """
    incident = ingestion_service.get_incident(req.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    try:
        order = dispatch_service.create_dispatch(
            incident=incident,
            unit_id=req.unit_id,
            notes=req.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    persist_incident_to_db(incident)

    # Save dispatch order to DB
    try:
        db = SessionLocal()
        db_order = DBDispatchOrder(
            order_id=order.order_id,
            incident_id=order.incident_id,
            unit_id=order.unit_id,
            unit_name=order.unit_name,
            timestamp=order.timestamp,
            status=order.status,
            eta_minutes=order.eta_minutes,
            distance_km=order.distance_km,
            instructions=order.instructions
        )
        db.add(db_order)
        db.commit()
        db.close()
    except Exception as e:
        logger.warning(f"Error saving dispatch to DB: {e}")

    # Broadcast updates over WebSockets
    await broadcast_to_websockets({
        "event": "DISPATCH_CREATED",
        "data": order.model_dump()
    })
    await broadcast_to_websockets({
        "event": "INCIDENT_UPDATED",
        "data": incident.model_dump()
    })
    await broadcast_to_websockets({
        "event": "UNITS_UPDATED",
        "data": [u.model_dump() for u in dispatch_service.get_all_units()]
    })

    return order


@app.post("/api/incidents/{incident_id}/resolve", response_model=DisasterIncident, tags=["Response Fleet & Logistics"])
async def resolve_incident_endpoint(incident_id: str):
    """Mark an incident as resolved and release the assigned unit back to AVAILABLE."""
    incident = ingestion_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    dispatch_service.resolve_incident(incident)
    persist_incident_to_db(incident)

    await broadcast_to_websockets({
        "event": "INCIDENT_UPDATED",
        "data": incident.model_dump()
    })
    await broadcast_to_websockets({
        "event": "UNITS_UPDATED",
        "data": [u.model_dump() for u in dispatch_service.get_all_units()]
    })
    return incident


# --- Safe Routing & Evacuation Endpoints ---

class RoutingRequest(BaseModel):
    start_lat: float = Field(..., description="Starting Latitude")
    start_lng: float = Field(..., description="Starting Longitude")
    dest_lat: float = Field(..., description="Destination Latitude")
    dest_lng: float = Field(..., description="Destination Longitude")


@app.post("/api/routing/safe-path", tags=["Safe Evacuation Routing"])
async def calculate_safe_path(req: RoutingRequest):
    """
    Calculate an AI-driven safe evacuation corridor avoiding active danger zones,
    submerged bridges, and landslide sectors. Returns GeoJSON LineString and checkpoints.
    """
    # Collect active hazards
    hazards = [
        {"lat": inc.latitude, "lng": inc.longitude, "name": f"{inc.disaster_type.title()} at {inc.location_name}"}
        for inc in ingestion_service.get_all_incidents()
        if inc.urgency_level in ["P1_CRITICAL", "P2_HIGH"]
    ]
    
    route = routing_service.compute_safe_evacuation_path(
        start_lat=req.start_lat,
        start_lng=req.start_lng,
        dest_lat=req.dest_lat,
        dest_lng=req.dest_lng,
        hazards=hazards
    )
    return route


# --- Emergency Alert Broadcast Endpoints ---

@app.get("/api/alerts/broadcasts", response_model=List[BroadcastRecord], tags=["Emergency Broadcast & Alerts"])
async def get_broadcast_history():
    """Retrieve history of emergency SMS / WhatsApp / CAP broadcasts."""
    return broadcast_service.get_history()


@app.post("/api/alerts/broadcast", response_model=BroadcastRecord, tags=["Emergency Broadcast & Alerts"])
async def send_emergency_broadcast(req: BroadcastRequest):
    """
    Trigger a mass emergency alert broadcast via SMS, WhatsApp, and Common Alerting Protocol (CAP).
    """
    record = broadcast_service.send_broadcast(req)

    # Save to DB
    try:
        db = SessionLocal()
        db_bcast = DBAlertBroadcast(
            broadcast_id=record.broadcast_id,
            target_channel=record.target_channel,
            target_zone=record.target_zone,
            severity=record.severity,
            message=record.message,
            recipient_count=record.recipient_count,
            delivery_rate_percent=record.delivery_rate_percent,
            status=record.status
        )
        db.add(db_bcast)
        db.commit()
        db.close()
    except Exception as e:
        logger.error(f"Error persisting broadcast to DB: {e}")

    await broadcast_to_websockets({
        "event": "ALERT_BROADCAST_SENT",
        "data": record.model_dump()
    })
    return record


@app.get("/api/alerts/telecom-status", tags=["Emergency Broadcast & Alerts"])
async def get_telecom_status():
    """Check whether a live physical telecom SMS gateway (Fast2SMS or Twilio) is configured."""
    return broadcast_service.get_telecom_config_status()


@app.post("/api/alerts/telecom-config", tags=["Emergency Broadcast & Alerts"])
async def set_telecom_config(config: TelecomGatewayConfig):
    """Configure live API key for Fast2SMS or Twilio to deliver real cellular SMS to mobile numbers."""
    broadcast_service.update_telecom_config(config)
    return {"status": "UPDATED", "config": broadcast_service.get_telecom_config_status()}


@app.post("/api/alerts/send-sms", tags=["Emergency Broadcast & Alerts"])
async def send_direct_sms(req: DirectSMSAlertRequest):
    """
    Send real-time emergency alert message directly to a recipient phone number (e.g. +91-9825123456).
    Fires live Fast2SMS or Twilio cellular API if configured, and generates 1-click WhatsApp web dispatch link.
    """
    record = broadcast_service.send_direct_sms(req)
    return record


@app.get("/api/alerts/direct-history", tags=["Emergency Broadcast & Alerts"])
async def get_direct_sms_history():
    """Retrieve history of real-time direct SMS alerts sent to mobile numbers."""
    return broadcast_service.get_direct_sms_history()



# --- Emergency Facilities Directory & Navigation ---

@app.get("/api/facilities/nearby", tags=["Emergency Directory & Navigation"])
async def get_nearby_facilities(
    lat: float = Query(22.3072, description="User or incident Latitude"),
    lng: float = Query(73.1812, description="User or incident Longitude"),
    type: Optional[str] = Query("ALL", description="HOSPITAL, FIRE_STATION, POLICE_STATION, or ALL"),
    limit: int = Query(15, ge=1, le=50)
):
    """
    Retrieve nearest Gujarat hospitals, fire stations, and police stations with contact numbers,
    available ICU/trauma facilities, and estimated driving ETAs.
    """
    return emergency_directory_service.find_nearby_facilities(lat=lat, lng=lng, facility_type=type, limit=limit)


@app.get("/api/remedies", response_model=List[RemedyGuide], tags=["Disaster Remedies & Guides"])
async def get_disaster_remedies():
    """
    Retrieve comprehensive disaster remedies, safety checklists (Before/During/After),
    and First-Aid emergency instructions for Floods, Cyclones, Earthquakes, and Gas Hazards.
    """
    return emergency_directory_service.get_remedy_guides()


@app.get("/api/reports/download-csv", tags=["Analytics & Reports"])
async def download_incidents_csv():
    """
    Download complete real-time disaster incidents, SOS distress reports, and alert logs as CSV file.
    """
    import io
    import csv
    from fastapi.responses import Response

    incidents = ingestion_service.get_all_incidents()
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Incident_ID", "Timestamp", "Disaster_Type", "Urgency_Level",
        "Location_Name", "Latitude", "Longitude", "Status",
        "Victims_Estimated", "Identified_Needs", "Source", "Raw_Distress_Text"
    ])

    for inc in incidents:
        writer.writerow([
            inc.id,
            inc.created_at,
            inc.disaster_type,
            inc.urgency_level,
            inc.location_name,
            inc.latitude,
            inc.longitude,
            inc.status,
            inc.victim_count_estimated,
            "; ".join(inc.needs_identified),
            inc.source,
            inc.raw_text.replace("\n", " ")
        ])

    csv_data = output.getvalue()
    filename = f"SAHAY_Disaster_Incident_Report_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# --- Responder Field Check-in Endpoint ---

class ResponderCheckin(BaseModel):
    unit_id: str
    lat: float
    lng: float
    status: str = "AVAILABLE"
    notes: Optional[str] = None


@app.post("/api/responders/checkin", tags=["Response Fleet & Logistics"])
async def responder_checkin(checkin: ResponderCheckin):
    """Update live GPS location and status for a field responder unit."""
    unit = dispatch_service.get_unit(checkin.unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    unit.lat = checkin.lat
    unit.lng = checkin.lng
    unit.status = checkin.status
    unit.last_updated = datetime.now(timezone.utc).isoformat()

    await broadcast_to_websockets({
        "event": "UNITS_UPDATED",
        "data": [u.model_dump() for u in dispatch_service.get_all_units()]
    })
    return {"status": "UPDATED", "unit": unit.model_dump()}


# --- NLP & Intelligence Pipeline Endpoints ---

@app.post("/api/nlp/classify", tags=["AI & NLP Intelligence"])
async def analyze_disaster_text(payload: Dict[str, str]):
    """
    Directly run the AI/NLP pipeline on any unstructured crisis text or social media post.
    Returns detected disaster type, confidence score, urgency level, extracted needs, and Indic translation.
    """
    text = payload.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text' field in payload.")

    translated_text, lang = nlp_engine.detect_and_translate_vernacular(text)
    disaster_type, conf = nlp_engine.classify_disaster_type(text)
    urgency, score = nlp_engine.calculate_urgency(text, disaster_type)
    needs = nlp_engine.extract_needs(text)
    victim_count = nlp_engine.extract_victim_count(text)
    loc_name, lat, lng = nlp_engine.geocode_text(text)

    return {
        "raw_text": text,
        "detected_language": lang,
        "translated_text": translated_text if lang != "en" else None,
        "disaster_type": disaster_type,
        "classification_confidence": conf,
        "urgency_level": urgency,
        "urgency_score": score,
        "extracted_needs": needs,
        "estimated_victims": victim_count,
        "geocoding": {
            "location_name": loc_name,
            "latitude": lat,
            "longitude": lng
        }
    }


# --- Analytics & SitRep Endpoints ---

@app.get("/api/analytics/sitrep", response_model=SitRepSummary, tags=["Situational Reporting & Analytics"])
@app.get("/api/sitrep", response_model=SitRepSummary, tags=["Situational Reporting & Analytics"])
async def get_sitrep():
    """Get live quantitative Situation Report metrics, disaster breakdown, and executive briefing."""
    incidents = ingestion_service.get_all_incidents()
    units = dispatch_service.get_all_units()
    summary = sitrep_service.generate_sitrep_summary(incidents, units)
    return summary


@app.get("/api/analytics/sitrep/report", response_class=HTMLResponse, tags=["Situational Reporting & Analytics"])
@app.get("/api/sitrep/report", response_class=HTMLResponse, tags=["Situational Reporting & Analytics"])
async def get_sitrep_html():
    """Get full executive printable HTML SitRep briefing."""
    incidents = ingestion_service.get_all_incidents()
    units = dispatch_service.get_all_units()
    summary = sitrep_service.generate_sitrep_summary(incidents, units)
    html_content = sitrep_service.generate_html_report(summary, incidents, units)
    return HTMLResponse(content=html_content)


# --- Simulation & External Sources Endpoints ---

@app.get("/api/simulation/scenarios", tags=["Simulation & Sources"])
async def get_scenarios():
    """List available pre-configured disaster simulation scenarios."""
    return SIMULATION_SCENARIOS


@app.post("/api/simulation/control", tags=["Simulation & Sources"])
async def control_simulation(req: SimulationControlRequest):
    """Switch active crisis scenario, stream frequency, or toggle simulation."""
    ingestion_service.active_scenario_key = req.scenario_key
    ingestion_service.stream_delay_seconds = req.feed_speed_seconds
    return {
        "status": "UPDATED",
        "scenario": req.scenario_key,
        "feed_speed_seconds": req.feed_speed_seconds
    }


@app.post("/api/simulation/trigger-burst", response_model=DisasterIncident, tags=["Simulation & Sources"])
async def trigger_burst_incident():
    """Inject an immediate high-priority synthetic disaster event into the live pipeline."""
    inc = ingestion_service.generate_synthetic_incident()
    await ingestion_service.emit_incident(inc)
    return inc


@app.post("/api/sources/sync-usgs", tags=["Simulation & Sources"])
async def sync_usgs_now():
    """Trigger on-demand real-time ingestion from USGS Global Seismic API."""
    new_events = await ingestion_service.fetch_live_usgs_earthquakes()
    return {"status": "SUCCESS", "synced_count": len(new_events), "events": [e.model_dump() for e in new_events]}


# --- WebSocket Endpoint ---

@app.websocket("/ws/live-stream")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time bi-directional WebSocket feed for live incident streaming and dispatch updates."""
    await websocket.accept()
    active_websockets.add(websocket)
    logger.info(f"WebSocket client connected. Active connections: {len(active_websockets)}")
    
    try:
        await websocket.send_json({
            "event": "INIT_STATE",
            "data": {
                "active_scenario": ingestion_service.active_scenario_key,
                "incident_count": len(ingestion_service.incidents),
                "units": [u.model_dump() for u in dispatch_service.get_all_units()]
            }
        })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_websockets.discard(websocket)
        logger.info(f"WebSocket client disconnected. Remaining: {len(active_websockets)}")
    except Exception as e:
        active_websockets.discard(websocket)
        logger.warning(f"WebSocket exception: {e}")


# --- Static Files Mounting for Frontend Command Center & Map UI ---
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


