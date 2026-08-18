"""
Response Units Fleet Management, Geospatial Dispatching, and Incident Lifecycle Service.
"""
import math
import uuid
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone
from backend.config import DEFAULT_RESPONSE_UNITS
from backend.models import ResponseUnit, DisasterIncident, DispatchOrder, DispatchRequest


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth in kilometers."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


class DispatchService:
    """Manages disaster response resources, units, and dispatch logistics."""

    def __init__(self):
        self.units: Dict[str, ResponseUnit] = {}
        self.dispatch_orders: List[DispatchOrder] = []
        self._initialize_default_units()

    def _initialize_default_units(self):
        """Seed default NDRF, SDRF, and Medical Response Units."""
        for u in DEFAULT_RESPONSE_UNITS:
            unit = ResponseUnit(
                unit_id=u["unit_id"],
                name=u["name"],
                type=u["type"],
                base_location=u["base_location"],
                lat=u["lat"],
                lng=u["lng"],
                personnel=u["personnel"],
                boats=u["boats"],
                ambulances=u["ambulances"],
                drones=u["drones"],
                status=u["status"]
            )
            self.units[unit.unit_id] = unit

    def get_all_units(self) -> List[ResponseUnit]:
        return list(self.units.values())

    def get_unit(self, unit_id: str) -> Optional[ResponseUnit]:
        return self.units.get(unit_id)

    def find_nearest_units(
        self,
        target_lat: float,
        target_lng: float,
        disaster_type: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict]:
        """Find and rank available response units by distance and required capabilities."""
        results = []
        for unit in self.units.values():
            dist_km = haversine_distance_km(target_lat, target_lng, unit.lat, unit.lng)
            
            # Estimate ETA: 35 km/h avg speed in disaster corridor + 5 min dispatch overhead
            eta_mins = round((dist_km / 35.0) * 60 + 5, 1)

            # Match suitability score
            suitability_score = 1.0
            if disaster_type == "flood" and unit.boats > 0:
                suitability_score += 0.5
            if disaster_type in ["building_collapse", "earthquake"] and "ARMY" in unit.unit_id or "NDRF" in unit.unit_id:
                suitability_score += 0.4
            if unit.type == "MEDICAL_QRT":
                suitability_score += 0.3

            results.append({
                "unit": unit,
                "distance_km": dist_km,
                "eta_minutes": eta_mins,
                "suitability_score": round(suitability_score, 2),
                "is_available": (unit.status == "AVAILABLE")
            })

        # Sort: available first, then suitability, then distance
        results.sort(key=lambda x: (not x["is_available"], -x["suitability_score"], x["distance_km"]))
        return results[:limit]

    def create_dispatch(
        self,
        incident: DisasterIncident,
        unit_id: str,
        notes: Optional[str] = None,
        custom_instructions: Optional[str] = None
    ) -> DispatchOrder:
        """Assign and dispatch a response unit to an incident."""
        unit = self.units.get(unit_id)
        if not unit:
            raise ValueError(f"Response unit {unit_id} not found.")

        dist_km = haversine_distance_km(incident.latitude, incident.longitude, unit.lat, unit.lng)
        eta_mins = round((dist_km / 35.0) * 60 + 5, 1)

        order_id = f"DSP-{uuid.uuid4().hex[:8].upper()}"
        instructions = custom_instructions or f"Deploy to {incident.location_name} (Lat: {incident.latitude}, Lng: {incident.longitude}). Priority: {incident.urgency_level}. Needs: {', '.join(incident.needs_identified)}."

        order = DispatchOrder(
            order_id=order_id,
            incident_id=incident.id,
            unit_id=unit.unit_id,
            unit_name=unit.name,
            timestamp=datetime.now(timezone.utc).isoformat(),
            status="DISPATCHED",
            eta_minutes=eta_mins,
            distance_km=dist_km,
            instructions=instructions
        )

        # Update unit state
        unit.status = "DISPATCHED"
        unit.active_incident_id = incident.id
        unit.last_updated = datetime.now(timezone.utc).isoformat()

        # Update incident state
        incident.status = "DISPATCHED"
        incident.assigned_unit_id = unit.unit_id
        incident.assigned_unit_name = unit.name
        incident.updated_at = datetime.now(timezone.utc).isoformat()

        self.dispatch_orders.append(order)
        return order

    def update_unit_status(self, unit_id: str, new_status: str) -> ResponseUnit:
        """Update operational status of a unit."""
        unit = self.units.get(unit_id)
        if not unit:
            raise ValueError(f"Response unit {unit_id} not found.")
        unit.status = new_status
        unit.last_updated = datetime.now(timezone.utc).isoformat()
        if new_status == "AVAILABLE":
            unit.active_incident_id = None
        return unit

    def resolve_incident(self, incident: DisasterIncident, notes: Optional[str] = None) -> DisasterIncident:
        """Mark an incident as resolved and free the assigned unit."""
        incident.status = "RESOLVED"
        incident.updated_at = datetime.now(timezone.utc).isoformat()

        if incident.assigned_unit_id and incident.assigned_unit_id in self.units:
            unit = self.units[incident.assigned_unit_id]
            unit.status = "AVAILABLE"
            unit.active_incident_id = None
            unit.last_updated = datetime.now(timezone.utc).isoformat()

        return incident


# Global singleton instance
dispatch_service = DispatchService()
