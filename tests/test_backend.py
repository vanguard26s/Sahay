"""
Unit and Integration Tests for Disaster Intelligence and Response Support System.
"""
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.nlp_engine import nlp_engine
from backend.dispatch_service import dispatch_service, haversine_distance_km
from backend.ingestion_service import ingestion_service
from backend.models import CitizenSOSReport

client = TestClient(app)


def test_health_check():
    """Verify health check endpoint returns operational status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["active_incidents"] > 0
    assert data["active_units"] > 0


def test_nlp_classification_flood():
    """Test disaster classification for flood & waterlogging."""
    text = "Severe waterlogging in Velachery 5th Main Road. Submerged cars and chest deep water."
    disaster_type, conf = nlp_engine.classify_disaster_type(text)
    assert disaster_type == "flood"
    assert conf >= 0.70


def test_nlp_classification_landslide():
    """Test disaster classification for landslide."""
    text = "Massive landslide and rockfall near Chooralmala bridge, mudflow blocking road."
    disaster_type, conf = nlp_engine.classify_disaster_type(text)
    assert disaster_type == "landslide"
    assert conf >= 0.70


def test_nlp_urgency_scoring():
    """Test urgency scoring logic."""
    sos_text = "URGENT SOS! 4 people trapped in attic, water rising, baby needs oxygen! Save us!"
    urgency, score = nlp_engine.calculate_urgency(sos_text, "flood")
    assert urgency == "P1_CRITICAL"
    assert score >= 0.85

    info_text = "Traffic diversion on Mount Road due to light rainfall advisory."
    urgency_low, score_low = nlp_engine.calculate_urgency(info_text, "flood")
    assert urgency_low == "P4_LOW"


def test_ner_geocoding():
    """Test location entity extraction and coordinate resolution for Gujarat."""
    loc_name, lat, lng = nlp_engine.geocode_text("Water level rising fast near Karelibaug Vadodara")
    assert "Karelibaug" in loc_name or "Vadodara" in loc_name
    assert 22.0 < lat < 24.0
    assert 72.0 < lng < 74.0


def test_haversine_distance():
    """Test distance calculation between Ahmedabad and Vadodara."""
    # Ahmedabad ~ (23.0225, 72.5714), Vadodara ~ (22.3072, 73.1812) -> ~ 100-115 km
    dist = haversine_distance_km(23.0225, 72.5714, 22.3072, 73.1812)
    assert 95.0 < dist < 125.0


def test_list_incidents_api():
    """Test incident listing and filtering."""
    response = client.get("/api/incidents?limit=10")
    assert response.status_code == 200
    incidents = response.json()
    assert isinstance(incidents, list)
    assert len(incidents) > 0


def test_citizen_sos_submission():
    """Test citizen SOS submission endpoint."""
    sos_payload = {
        "name": "Arun Kumar",
        "phone": "+91-9876543210",
        "disaster_type": "flood",
        "urgency": "P1_CRITICAL",
        "location_name": "Velachery",
        "description": "5 people trapped on terrace. Send rescue boat immediately!",
        "people_count": 5,
        "needs": ["Inflatable Rescue Boat (IRB)", "Medical Trauma Support"]
    }
    response = client.post("/api/sos", json=sos_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "citizen_sos"
    assert data["urgency_level"] == "P1_CRITICAL"
    assert data["is_sos"] is True
    assert data["victim_count_estimated"] == 5


def test_dispatch_and_resolve_flow():
    """Test finding nearest units, dispatching, and resolving incident."""
    incidents = ingestion_service.get_all_incidents()
    target_inc = [i for i in incidents if i.status == "REPORTED"][0]

    # 1. Find nearest units
    nearest_res = client.get(f"/api/dispatch/nearest?lat={target_inc.latitude}&lng={target_inc.longitude}&disaster_type={target_inc.disaster_type}")
    assert nearest_res.status_code == 200
    ranked = nearest_res.json()
    assert len(ranked) > 0
    chosen_unit_id = ranked[0]["unit"]["unit_id"]

    # 2. Dispatch
    dispatch_payload = {
        "incident_id": target_inc.id,
        "unit_id": chosen_unit_id,
        "notes": "Fast-track boat deployment."
    }
    dsp_res = client.post("/api/dispatch", json=dispatch_payload)
    assert dsp_res.status_code == 200
    order = dsp_res.json()
    assert order["status"] == "DISPATCHED"

    # Verify incident updated
    updated_inc = ingestion_service.get_incident(target_inc.id)
    assert updated_inc.status == "DISPATCHED"
    assert updated_inc.assigned_unit_id == chosen_unit_id

    # 3. Resolve
    resolve_res = client.post(f"/api/incidents/{target_inc.id}/resolve")
    assert resolve_res.status_code == 200
    resolved_inc = resolve_res.json()
    assert resolved_inc["status"] == "RESOLVED"


def test_nlp_classify_endpoint():
    """Test standalone NLP classification endpoint with Gujarati emergency text."""
    payload = {"text": "બચાવો! વિશ્વામિત્રી નદીનું પાણી ઘરમાં ભરાઈ ગયું છે. 6 લોકો Karelibaug માં ફસાયા છીએ. બોટ મોકલો."}
    res = client.post("/api/nlp/classify", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["disaster_type"] == "flood"
    assert data["urgency_level"] == "P1_CRITICAL"
    assert "Immediate Search & Rescue" in data["extracted_needs"]
    assert "Karelibaug" in data["geocoding"]["location_name"]


def test_safe_routing_endpoint():
    """Test AI safe routing path calculation."""
    payload = {
        "start_lat": 11.5360,
        "start_lng": 76.1685,
        "dest_lat": 11.6854,
        "dest_lng": 76.1320
    }
    res = client.post("/api/routing/safe-path", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "total_distance_km" in data
    assert "estimated_travel_time_mins" in data
    assert len(data["waypoints"]) > 0
    assert len(data["checkpoints"]) > 0


def test_emergency_broadcast_endpoint():
    """Test sending emergency alert broadcast."""
    payload = {
        "target_channel": "SMS_AND_WHATSAPP",
        "target_zone": "Wayanad Sector",
        "severity": "CRITICAL_EVACUATION",
        "message": "Flash flood warning. Move to higher ground immediately.",
        "recipient_count_simulated": 3000
    }
    res = client.post("/api/alerts/broadcast", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "DELIVERED"
    assert data["recipient_count"] == 3000

    history_res = client.get("/api/alerts/broadcasts")
    assert history_res.status_code == 200
    assert len(history_res.json()) > 0


def test_responder_checkin_endpoint():
    """Test responder GPS check-in with Gujarat NDRF unit."""
    payload = {
        "unit_id": "NDRF-6BN-JAROD",
        "lat": 22.3080,
        "lng": 73.1820,
        "status": "AVAILABLE",
        "notes": "Refueled boats and ready for Vadodara Vishwamitri deployment."
    }
    res = client.post("/api/responders/checkin", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "UPDATED"
    assert data["unit"]["lat"] == 22.3080
