"""
Multi-Source Ingestion Engine:
Fetches live feeds (USGS, GDACS) and provides high-fidelity social media & citizen stream simulation.
"""
import uuid
import random
import asyncio
import logging
from typing import List, Dict, Optional, Callable
from datetime import datetime
import requests

from backend.config import SIMULATION_SCENARIOS, KNOWN_LOCATIONS
from backend.models import DisasterIncident, CitizenSOSReport
from backend.nlp_engine import nlp_engine

logger = logging.getLogger("IngestionService")


# Rich realistic pool of social media ground reports categorized by Gujarat scenarios
SIMULATED_SOCIAL_POSTS = {
    "vadodara_vishwamitri_flood": [
        {
            "source": "social_media_x",
            "author": "@BarodaCitizenWatch",
            "text": "CRITICAL SOS! Vishwamitri river has breached 37 ft mark near Karelibaug. 22 people stranded on terrace near Sayajigunj. Crocodile spotted in water! NDRF boat urgently needed! #VadodaraFloods #SOS #NDRF",
            "landmark": "Karelibaug",
            "lat": 22.3250, "lng": 73.1960
        },
        {
            "source": "social_media_x",
            "author": "@GujaratRescueNet",
            "text": "બચાવો! Fatehgunj underpass is completely submerged in 8 feet water. 6 people including a pregnant woman trapped in car. Send rescue team immediately! #VadodaraRains",
            "landmark": "Fatehgunj",
            "lat": 22.3200, "lng": 73.1850
        },
        {
            "source": "social_media_reddit",
            "author": "u/VadodaraRelief",
            "text": "Manjalpur sector 4: Ground floor apartments inundated. Power outage for 18 hours. Running low on drinking water and milk packets for toddlers. Contact Patel +919825123456.",
            "landmark": "Manjalpur",
            "lat": 22.2680, "lng": 73.1890
        },
        {
            "source": "social_media_telegram",
            "author": "VMC Emergency Alert Channel",
            "text": "Ajwa Dam gates open. Water discharge 45,000 cusecs into Vishwamitri. Low-lying wards 1 to 7 ordered to evacuate to Municipal School relief centers.",
            "landmark": "Vadodara",
            "lat": 22.3072, "lng": 73.1812
        },
        {
            "source": "citizen_sos",
            "author": "Jignesh Shah",
            "text": "Water entered living room in Alkapuri society. 5 family members with 85yo grandfather on 1st floor. Mobile battery 8%. Please send SDRF inflatable boat!",
            "landmark": "Alkapuri",
            "lat": 22.3120, "lng": 73.1720
        },
        {
            "source": "weather_radar",
            "author": "IMD Ahmedabad Radar Station",
            "text": "Extremely Heavy Rainfall (Red Alert) for Vadodara, Anand, and Panchmahal districts. 240mm recorded. Vishwamitri river danger level exceeded.",
            "landmark": "Vadodara",
            "lat": 22.3072, "lng": 73.1812
        }
    ],
    "kutch_biparjoy_cyclone": [
        {
            "source": "social_media_x",
            "author": "@KutchSamacharLive",
            "text": "EMERGENCY: Cyclone Biparjoy making landfall near Mandvi port. High winds 135 km/h ripping tin roofs. 18 fishermen stranded near coastal jetty! #CycloneBiparjoy #Kutch",
            "landmark": "Mandvi",
            "lat": 22.8329, "lng": 69.3556
        },
        {
            "source": "social_media_x",
            "author": "@KandlaPortWatch",
            "text": "Storm surge flooding coastal berths at Kandla Port and Gandhidham. 45 port workers cut off in terminal building. Power grid collapsed across Gandhidham.",
            "landmark": "Gandhidham",
            "lat": 23.0753, "lng": 70.1337
        },
        {
            "source": "social_media_reddit",
            "author": "u/BhujReliefSquad",
            "text": "Trees and electricity poles uprooted on Bhuj-Anjar highway. Ambulance route blocked near Bhachau junction. Need JCB bulldozers to clear corridor.",
            "landmark": "Bhuj",
            "lat": 23.2420, "lng": 69.6669
        },
        {
            "source": "citizen_sos",
            "author": "Kishore Jadeja",
            "text": "વાવાઝોડાને કારણે દરિયાનું પાણી ગામમાં ઘૂસી ગયું છે. 8 પરિવારો ટેકરી પર ફસાયા છીએ. તાત્કાલિક બોટ અને ખોરાકની જરૂર છે. માંડવી બીચ રોડ.",
            "landmark": "Mandvi",
            "lat": 22.8350, "lng": 69.3600
        }
    ],
    "surat_tapi_inundation": [
        {
            "source": "social_media_x",
            "author": "@SuratDisasterNet",
            "text": "CRITICAL: Tapi river overflowing at Singanpore Causeway. Adajan Patiya and Rander flooded in 5 ft water. NDRF inflatable boats deployed for evacuation.",
            "landmark": "Adajan",
            "lat": 21.1960, "lng": 72.7930
        },
        {
            "source": "social_media_x",
            "author": "@DiamondCityNews",
            "text": "Katargam GIDC area waterlogged. 15 workers stranded on mezzanine floor. Live transformer sparked on Katargam main road. DGVCL squad alerted.",
            "landmark": "Katargam",
            "lat": 21.2280, "lng": 72.8270
        },
        {
            "source": "social_media_reddit",
            "author": "u/SuratHelpline",
            "text": "Need drinking water pouches and dry snacks for 150 evacuees at Varachha community hall. Contact Surat Relief Volunteers +919879112233.",
            "landmark": "Varachha",
            "lat": 21.2160, "lng": 72.8660
        },
        {
            "source": "citizen_sos",
            "author": "Bhavik Patel",
            "text": "Water rising rapidly in Rander Gorat area. 6 people including 2 infants stuck. Please send rescue boat immediately!",
            "landmark": "Rander",
            "lat": 21.2150, "lng": 72.7880
        }
    ],
    "kutch_bhuj_earthquake": [
        {
            "source": "usgs_seismic",
            "author": "USGS / ISR Gandhinagar Feed",
            "text": "M 6.3 - 22 km ENE of Bhuj, Kutch, Gujarat, India. Depth: 12.0 km. Strong tremors felt across Kutch, Morbi, Rajkot, and Ahmedabad.",
            "landmark": "Bhuj",
            "lat": 23.2420, "lng": 69.6669
        },
        {
            "source": "social_media_x",
            "author": "@KutchExpress",
            "text": "Major structural fractures in old buildings around Bhuj Darbargadh & Saraf Bazar. 2 ancient walls collapsed. SDRF teams dispatched with search cameras! #Earthquake #Bhuj",
            "landmark": "Bhuj",
            "lat": 23.2450, "lng": 69.6700
        },
        {
            "source": "social_media_x",
            "author": "@MorbiDisasterWatch",
            "text": "Tremor impacts reported in Morbi ceramic industrial belt. Factory chimney crack inspected. Precautionary evacuation of workers initiated.",
            "landmark": "Morbi",
            "lat": 22.8173, "lng": 70.8370
        }
    ]
}


class IngestionService:
    """Manages multi-source data ingestion, live sensor polling, and streaming simulation."""

    def __init__(self):
        self.incidents: Dict[str, DisasterIncident] = {}
        self.active_scenario_key: str = "vadodara_vishwamitri_flood"
        self.stream_delay_seconds: float = 4.0
        self.is_streaming: bool = True
        self.event_callbacks: List[Callable[[DisasterIncident], Any]] = []
        self._seed_initial_data()

    def _seed_initial_data(self):
        """Pre-populate a robust set of incidents so the dashboard has rich data on startup."""
        for scenario_key, posts in SIMULATED_SOCIAL_POSTS.items():
            for post in posts:
                incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
                incident = nlp_engine.process_raw_report(
                    incident_id=incident_id,
                    source=post["source"],
                    raw_text=post["text"],
                    author=post["author"],
                    override_lat=post.get("lat"),
                    override_lng=post.get("lng"),
                    override_loc_name=post.get("landmark")
                )
                self.incidents[incident.id] = incident

    def register_event_callback(self, callback: Callable[[DisasterIncident], Any]):
        """Register listener for new streamed incidents (e.g. WebSocket broadcaster)."""
        self.event_callbacks.append(callback)

    async def emit_incident(self, incident: DisasterIncident):
        """Save incident and notify listeners."""
        self.incidents[incident.id] = incident
        for cb in self.event_callbacks:
            try:
                res = cb(incident)
                if asyncio.iscoroutine(res):
                    await res
            except Exception as e:
                logger.error(f"Error in event callback: {e}")

    def get_all_incidents(self) -> List[DisasterIncident]:
        """Return all recorded incidents, sorted by created_at descending."""
        return sorted(self.incidents.values(), key=lambda inc: inc.created_at, reverse=True)

    def get_incident(self, incident_id: str) -> Optional[DisasterIncident]:
        return self.incidents.get(incident_id)

    async def submit_citizen_sos(self, report: CitizenSOSReport) -> DisasterIncident:
        """Handle incoming Citizen SOS submission with instant P1 urgency boosting."""
        incident_id = f"SOS-{uuid.uuid4().hex[:8].upper()}"
        
        # Geocode or use provided GPS
        lat = report.latitude
        lng = report.longitude
        loc_name = report.location_name

        if lat is None or lng is None:
            loc_name, lat, lng = nlp_engine.geocode_text(report.location_name)

        combined_text = f"[CITIZEN SOS REPORT] By {report.name} ({report.phone}): {report.description}. People affected: {report.people_count}. Needs: {', '.join(report.needs)}."

        incident = nlp_engine.process_raw_report(
            incident_id=incident_id,
            source="citizen_sos",
            raw_text=combined_text,
            author=report.name,
            override_lat=lat,
            override_lng=lng,
            override_loc_name=loc_name
        )

        incident.disaster_type = report.disaster_type or incident.disaster_type
        incident.urgency_level = "P1_CRITICAL"
        incident.urgency_score = 0.99
        incident.location_name = report.location_name or loc_name
        incident.victim_count_estimated = report.people_count
        incident.needs_identified = report.needs if report.needs else incident.needs_identified
        incident.is_sos = True

        await self.emit_incident(incident)
        return incident

    async def fetch_live_usgs_earthquakes(self) -> List[DisasterIncident]:
        """Fetch real-world M4.5+ earthquakes from USGS API in real-time."""
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"
        new_incidents = []
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                features = data.get("features", [])
                for feat in features[:5]:  # Take top 5 recent events
                    props = feat.get("properties", {})
                    geom = feat.get("geometry", {})
                    coords = geom.get("coordinates", [0, 0, 0])
                    
                    mag = props.get("mag", 0)
                    place = props.get("place", "Unknown Location")
                    event_time = props.get("time", 0)
                    detail_url = props.get("url", "")
                    
                    incident_id = f"USGS-{feat.get('id', uuid.uuid4().hex[:6])}"
                    if incident_id in self.incidents:
                        continue

                    raw_text = f"USGS SEISMIC ALERT: Magnitude {mag} earthquake detected near {place}. Depth: {coords[2]} km. Automated sensor broadcast."
                    
                    incident = nlp_engine.process_raw_report(
                        incident_id=incident_id,
                        source="usgs_seismic",
                        raw_text=raw_text,
                        author="USGS Global Seismic Network",
                        source_url=detail_url,
                        override_lat=coords[1],
                        override_lng=coords[0],
                        override_loc_name=place
                    )
                    incident.disaster_type = "earthquake"
                    if mag >= 6.0:
                        incident.urgency_level = "P1_CRITICAL"
                    elif mag >= 5.0:
                        incident.urgency_level = "P2_HIGH"
                    else:
                        incident.urgency_level = "P3_MEDIUM"

                    await self.emit_incident(incident)
                    new_incidents.append(incident)
        except Exception as e:
            logger.warning(f"Could not reach live USGS API (offline/timeout): {e}")

        return new_incidents

    def generate_synthetic_incident(self) -> DisasterIncident:
        """Dynamically construct a realistic crisis report matching active scenario."""
        scenario = SIMULATION_SCENARIOS.get(self.active_scenario_key, SIMULATION_SCENARIOS["vadodara_vishwamitri_flood"])
        posts_pool = SIMULATED_SOCIAL_POSTS.get(self.active_scenario_key, SIMULATED_SOCIAL_POSTS["vadodara_vishwamitri_flood"])
        
        base_post = random.choice(posts_pool)
        
        # Add random caller variations
        names = ["Jignesh", "Bhavik", "Hitesh", "Ankita", "Pradip", "Kinjal", "Mehul", "Sneha", "Ketan", "Payal"]
        phone = f"+91-{random.randint(98000, 98999)}{random.randint(10000, 99999)}"
        caller = random.choice(names)
        
        incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
        
        # Add minor coordinate jitter around target area
        lat = base_post.get("lat", scenario["center_lat"]) + random.uniform(-0.012, 0.012)
        lng = base_post.get("lng", scenario["center_lng"]) + random.uniform(-0.012, 0.012)
        
        text = f"{base_post['text']} [Update: Reported by {caller}, Contact: {phone}]"
        
        incident = nlp_engine.process_raw_report(
            incident_id=incident_id,
            source=random.choice(["social_media_x", "social_media_reddit", "citizen_sos"]),
            raw_text=text,
            author=f"@{caller}_{random.randint(10, 99)}",
            override_lat=round(lat, 5),
            override_lng=round(lng, 5),
            override_loc_name=base_post.get("landmark", scenario["name"])
        )
        return incident


# Global singleton instance
ingestion_service = IngestionService()
