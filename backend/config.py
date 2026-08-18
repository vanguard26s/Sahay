"""
Configuration and constants for Gujarat Disaster Intelligence & Response Support System.
Tailored for Gujarat Districts, Municipal Corporations, and Coastal Disaster Grids.
"""
from typing import Dict, List, Tuple
from pydantic import BaseModel

APP_NAME = "ResQ-IQ: Gujarat Multi-Source Disaster Intelligence System"
APP_VERSION = "2.5.0-GUJARAT"
API_PREFIX = "/api"

# Disaster Categories
DISASTER_TYPES = [
    "flood",
    "cyclone",
    "earthquake",
    "industrial_hazard",
    "urban_fire",
    "landslide",
    "building_collapse",
    "stampede",
    "chemical_spill",
    "other"
]

# Need / Urgency Tiers
URGENCY_LEVELS = ["P1_CRITICAL", "P2_HIGH", "P3_MEDIUM", "P4_LOW"]

# Source Types
SOURCE_TYPES = [
    "social_media_x",
    "social_media_reddit",
    "social_media_telegram",
    "gdacs_rss",
    "usgs_seismic",
    "weather_radar",
    "citizen_sos"
]

# Gazetteers: High-accuracy coordinates for Gujarat Cities, Districts, Rivers, and Ports
KNOWN_LOCATIONS: Dict[str, Tuple[float, float]] = {
    # Ahmedabad & Gandhinagar (Central Gujarat)
    "ahmedabad": (23.0225, 72.5714),
    "amdavad": (23.0225, 72.5714),
    "sabarmati": (23.0800, 72.5900),
    "maninagar": (22.9967, 72.6019),
    "bopal": (23.0338, 72.4634),
    "nikol": (23.0450, 72.6650),
    "naroda": (23.0689, 72.6528),
    "chandkheda": (23.1114, 72.5856),
    "sarkhej": (22.9850, 72.4980),
    "vastrapur": (23.0350, 72.5293),
    "gandhinagar": (23.2156, 72.6369),
    "gift city": (23.1610, 72.6840),
    "kalol": (23.2450, 72.4980),
    
    # Vadodara & Central Gujarat
    "vadodara": (22.3072, 73.1812),
    "baroda": (22.3072, 73.1812),
    "vishwamitri": (22.3000, 73.1900),
    "karelibaug": (22.3250, 73.1960),
    "fatehgunj": (22.3200, 73.1850),
    "sayajigunj": (22.3100, 73.1820),
    "manjalpur": (22.2680, 73.1890),
    "alkapuri": (22.3120, 73.1720),
    "makarpura": (22.2470, 73.1940),
    "ajwa": (22.3600, 73.3900),
    "anand": (22.5645, 72.9289),
    "nadiad": (22.6916, 72.8634),
    "kheda": (22.7500, 72.6800),
    "godhra": (22.7758, 73.6149),
    "dahod": (22.8347, 74.2554),
    "chhota udepur": (22.3100, 74.0100),
    
    # Surat & South Gujarat Coastal
    "surat": (21.1702, 72.8311),
    "tapi": (21.2100, 72.8200),
    "adajan": (21.1960, 72.7930),
    "rander": (21.2150, 72.7880),
    "katargam": (21.2280, 72.8270),
    "hazira": (21.1100, 72.6400),
    "varachha": (21.2160, 72.8660),
    "vesu": (21.1400, 72.7750),
    "dumas": (21.0833, 72.7167),
    "bharuch": (21.7051, 72.9959),
    "ankleshwar": (21.6264, 73.0041),
    "dahej": (21.7100, 72.5400),
    "navsari": (20.9467, 72.9520),
    "valsad": (20.5992, 72.9342),
    "vapi": (20.3718, 72.9043),
    "daman": (20.3974, 72.8328),
    "bilimora": (20.7600, 72.9500),
    
    # Kutch & Western Coastal Grid
    "kutch": (23.2420, 69.6669),
    "kachchh": (23.2420, 69.6669),
    "bhuj": (23.2420, 69.6669),
    "gandhidham": (23.0753, 70.1337),
    "kandla": (23.0033, 70.2189),
    "mandvi": (22.8329, 69.3556),
    "anjar": (23.1139, 70.0278),
    "mundra": (22.8390, 69.7240),
    "bhachau": (23.2920, 70.3440),
    "rapar": (23.5700, 70.6300),
    "dholavira": (23.8860, 70.2180),
    "rann of kutch": (23.8000, 69.8000),
    
    # Saurashtra & Coastal Ports
    "rajkot": (22.3039, 70.8022),
    "aji dam": (22.2500, 70.8300),
    "morbi": (22.8173, 70.8370),
    "machchhu": (22.8170, 70.8350),
    "gondal": (21.9619, 70.7997),
    "jamnagar": (22.4707, 70.0577),
    "dwarka": (22.2442, 68.9685),
    "okha": (22.4639, 69.0722),
    "khambhalia": (22.2000, 69.6500),
    "porbandar": (21.6417, 69.6293),
    "junagadh": (21.5222, 70.4579),
    "gir somnath": (20.9000, 70.3667),
    "veraval": (20.9000, 70.3667),
    "somnath": (20.8880, 70.4012),
    "bhavnagar": (21.7645, 72.1519),
    "alang": (21.4116, 72.1908),
    "mahuva": (21.0917, 71.7631),
    "amreli": (21.6032, 71.2221),
    "surendranagar": (22.7274, 71.6370),
    "botad": (22.1700, 71.6600),
    
    # North Gujarat
    "mehsana": (23.5880, 72.3693),
    "patan": (23.8493, 72.1266),
    "palanpur": (24.1724, 72.4346),
    "banaskantha": (24.1724, 72.4346),
    "deesa": (24.2580, 72.1810),
    "dhanera": (24.5100, 72.0200),
    "himatnagar": (23.5977, 72.9647),
    "sabarkantha": (23.5977, 72.9647),
    "modasa": (23.4600, 73.3000),
    "arvalli": (23.4600, 73.3000)
}

# Pre-configured Response Bases in Gujarat
DEFAULT_RESPONSE_UNITS = [
    {
        "unit_id": "NDRF-6BN-JAROD",
        "name": "NDRF 6th Battalion (Jarod Base, Vadodara)",
        "type": "NDRF_RESCUE",
        "base_location": "Jarod, Vadodara District",
        "lat": 22.3072,
        "lng": 73.1812,
        "personnel": 55,
        "boats": 14,
        "ambulances": 6,
        "drones": 4,
        "status": "AVAILABLE"
    },
    {
        "unit_id": "SDRF-GUJ-GANDHINAGAR",
        "name": "Gujarat SDRF 1st Battalion (Gandhinagar / Ahmedabad)",
        "type": "SDRF_QUICK_RESPONSE",
        "base_location": "Gandhinagar Police HQ",
        "lat": 23.2156,
        "lng": 72.6369,
        "personnel": 45,
        "boats": 8,
        "ambulances": 5,
        "drones": 3,
        "status": "AVAILABLE"
    },
    {
        "unit_id": "SDRF-COASTAL-SURAT",
        "name": "SDRF South Gujarat Rapid Water Rescue (Surat)",
        "type": "SDRF_COASTAL",
        "base_location": "Surat Tapi River Control Base",
        "lat": 21.1702,
        "lng": 72.8311,
        "personnel": 40,
        "boats": 12,
        "ambulances": 4,
        "drones": 2,
        "status": "AVAILABLE"
    },
    {
        "unit_id": "NDRF-KUTCH-KANDLA",
        "name": "NDRF Coastal Cyclone & Marine QRT (Gandhidham / Kandla)",
        "type": "NDRF_MARINE",
        "base_location": "Kandla Port Trust / Gandhidham",
        "lat": 23.0753,
        "lng": 70.1337,
        "personnel": 50,
        "boats": 16,
        "ambulances": 4,
        "drones": 4,
        "status": "AVAILABLE"
    },
    {
        "unit_id": "MED-QRT-AHMEDABAD",
        "name": "Gujarat Disaster Trauma & Emergency Medical Unit",
        "type": "MEDICAL_QRT",
        "base_location": "Civil Hospital, Asarwa, Ahmedabad",
        "lat": 23.0530,
        "lng": 72.5900,
        "personnel": 30,
        "boats": 2,
        "ambulances": 12,
        "drones": 2,
        "status": "AVAILABLE"
    },
    {
        "unit_id": "SDRF-SAURASHTRA-RAJKOT",
        "name": "SDRF Saurashtra Quick Reaction Force (Rajkot)",
        "type": "SDRF_QUICK_RESPONSE",
        "base_location": "Rajkot Control Center",
        "lat": 22.3039,
        "lng": 70.8022,
        "personnel": 35,
        "boats": 6,
        "ambulances": 4,
        "drones": 2,
        "status": "AVAILABLE"
    },
    {
        "unit_id": "COAST-GUARD-OKHA",
        "name": "Indian Coast Guard & SDRF Marine Unit (Dwarka / Okha)",
        "type": "COAST_GUARD",
        "base_location": "Okha Marine Station, Devbhumi Dwarka",
        "lat": 22.4639,
        "lng": 69.0722,
        "personnel": 30,
        "boats": 10,
        "ambulances": 2,
        "drones": 3,
        "status": "AVAILABLE"
    }
]

# Gujarat Disaster Simulation Scenarios
SIMULATION_SCENARIOS = {
    "vadodara_vishwamitri_flood": {
        "name": "Vadodara Vishwamitri River Floods & Crocodile Alert",
        "center_lat": 22.3072,
        "center_lng": 73.1812,
        "primary_type": "flood",
        "severity": "CRITICAL",
        "description": "Ajwa Dam discharge causing Vishwamitri to swell above 36ft. Flooding in Karelibaug, Sayajigunj, and Fatehgunj with stranded residents."
    },
    "kutch_biparjoy_cyclone": {
        "name": "Cyclone Biparjoy Coastal Surge (Kutch & Mandvi)",
        "center_lat": 23.2420,
        "center_lng": 69.6669,
        "primary_type": "cyclone",
        "severity": "CRITICAL",
        "description": "Severe cyclonic storm making landfall near Mandvi/Jakhau. 140 km/h winds, power grid disruptions, and port evacuations in Kandla & Mundra."
    },
    "surat_tapi_inundation": {
        "name": "Surat Tapi River Flood & Causeway Inundation",
        "center_lat": 21.1702,
        "center_lng": 72.8311,
        "primary_type": "flood",
        "severity": "HIGH",
        "description": "Ukai Dam releasing 3.5 lakh cusecs. Waterlogging in Rander, Adajan, and Katargam low-lying wards."
    },
    "kutch_bhuj_earthquake": {
        "name": "Kutch Intraplate Seismic Event M6.5 (Bhuj / Anjar)",
        "center_lat": 23.2420,
        "center_lng": 69.6669,
        "primary_type": "earthquake",
        "severity": "CRITICAL",
        "description": "Strong shallow earthquake felt across Kutch, Morbi, and Rajkot. Building fissures in Bhuj old city and Anjar."
    }
}
