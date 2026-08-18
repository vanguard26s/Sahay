"""
Data models and schemas for Disaster Intelligence System.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class DisasterIncident(BaseModel):
    id: str = Field(..., description="Unique Incident ID")
    source: str = Field(..., description="Source: twitter, reddit, gdacs, usgs, citizen_sos")
    source_url: Optional[str] = None
    author: Optional[str] = "Anonymous / Feed"
    raw_text: str = Field(..., description="Original post or alert text")
    translated_text: Optional[str] = None
    detected_language: str = "en"
    disaster_type: str = Field("other", description="flood, cyclone, earthquake, landslide, etc.")
    urgency_level: str = Field("P3_MEDIUM", description="P1_CRITICAL, P2_HIGH, P3_MEDIUM, P4_LOW")
    urgency_score: float = Field(0.5, description="Urgency probability 0.0 - 1.0")
    location_name: str = Field("Unknown Location", description="Extracted geographical landmark/city")
    latitude: float = 0.0
    longitude: float = 0.0
    confidence_score: float = 0.85
    verification_status: str = "UNVERIFIED"  # UNVERIFIED, CROSS_VERIFIED, CONFIRMED, REJECTED
    verification_score: float = 0.70
    verification_sources: List[str] = Field(default_factory=list)
    needs_identified: List[str] = Field(default_factory=list)
    victim_count_estimated: int = 1
    status: str = "REPORTED"  # REPORTED, IN_REVIEW, DISPATCHED, IN_PROGRESS, RESOLVED
    assigned_unit_id: Optional[str] = None
    assigned_unit_name: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    cluster_id: Optional[str] = None
    media_urls: List[str] = Field(default_factory=list)
    is_sos: bool = False


class CitizenSOSReport(BaseModel):
    name: str = Field("Anonymous Citizen", description="Victim / Reporter Name")
    phone: Optional[str] = "+91-XXXXXXXXXX"
    disaster_type: str = "flood"
    urgency: Optional[str] = "P1_CRITICAL"
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    people_count: int = 1
    needs: List[str] = Field(default_factory=lambda: ["Rescue / Evacuation"])
    image_data: Optional[str] = None  # Base64 or mock URL


class ResponseUnit(BaseModel):
    unit_id: str
    name: str
    type: str  # NDRF_RESCUE, SDRF_QUICK_RESPONSE, MEDICAL_QRT, etc.
    base_location: str
    lat: float
    lng: float
    personnel: int = 25
    boats: int = 4
    ambulances: int = 2
    drones: int = 2
    status: str = "AVAILABLE"  # AVAILABLE, DISPATCHED, ON_SCENE, RETURNING, OFFLINE
    active_incident_id: Optional[str] = None
    last_updated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class DispatchRequest(BaseModel):
    incident_id: str
    unit_id: str
    notes: Optional[str] = None
    priority_override: Optional[str] = None


class DispatchOrder(BaseModel):
    order_id: str
    incident_id: str
    unit_id: str
    unit_name: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    status: str = "DISPATCHED"
    eta_minutes: float = 15.0
    distance_km: float = 5.2
    instructions: str = "Proceed immediately to coordinates and establish contact."


class StatusUpdateRequest(BaseModel):
    status: str  # REPORTED, IN_REVIEW, DISPATCHED, IN_PROGRESS, RESOLVED
    notes: Optional[str] = None


class SitRepSummary(BaseModel):
    generated_at: str
    total_incidents: int
    critical_sos_count: int
    dispatched_count: int
    resolved_count: int
    estimated_affected_population: int
    top_affected_zones: List[Dict[str, Any]]
    resource_deployment_ratio: float
    disaster_breakdown: Dict[str, int]
    executive_summary: str
    recommended_actions: List[str]


class SimulationControlRequest(BaseModel):
    scenario_key: str = "wayanad_landslide"
    feed_speed_seconds: float = 3.0
    include_social: bool = True
    include_sensors: bool = True
