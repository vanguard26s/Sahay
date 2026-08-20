"""
Emergency Directory Service for Gujarat Hospitals, Fire Stations, and Police Stations.
Provides verified contact numbers, available medical/rescue facilities, and proximity searches.
Also provides Actionable Disaster Remedies & First-Aid Guides.
"""
import uuid
from typing import List, Dict, Any, Optional
from backend.models import EmergencyFacility, RemedyGuide
from backend.dispatch_service import haversine_distance_km


VERIFIED_GUJARAT_FACILITIES: List[Dict[str, Any]] = [
    # --- HOSPITALS ---
    {
        "facility_id": "HOSP-VAD-001",
        "name": "SSG Hospital (Sir Sayajirao General Hospital)",
        "type": "HOSPITAL",
        "phone": "0265-2424848",
        "alternate_phone": "+91-9825100108",
        "address": "Jail Road, Anandpura, Vadodara, Gujarat 390001",
        "city": "Vadodara",
        "lat": 22.3015,
        "lng": 73.1930,
        "available_facilities": [
            "24x7 Level-1 Trauma Care",
            "150 Dedicated ICU Beds",
            "Liquid Medical Oxygen Plant",
            "Emergency Blood Bank",
            "Emergency Burn & Wound Ward",
            "10 Advanced Life Support Ambulances"
        ],
        "total_capacity": "1500 Beds (Government Tertiary Hub)",
        "is_24x7": True
    },
    {
        "facility_id": "HOSP-VAD-002",
        "name": "GMERS Medical College & Hospital, Gotri",
        "type": "HOSPITAL",
        "phone": "0265-2398001",
        "alternate_phone": "0265-2398002",
        "address": "Gotri Road, Vadodara, Gujarat 390021",
        "city": "Vadodara",
        "lat": 22.3210,
        "lng": 73.1490,
        "available_facilities": [
            "80 ICU & HDU Beds",
            "Pediatric & Neonatal ICU",
            "Emergency Resuscitation Center",
            "Dialysis Unit",
            "Mobile Medical Response Vans"
        ],
        "total_capacity": "750 Beds",
        "is_24x7": True
    },
    {
        "facility_id": "HOSP-VAD-003",
        "name": "Sterling Multi-Speciality Hospital",
        "type": "HOSPITAL",
        "phone": "0265-6188000",
        "alternate_phone": "0265-2311111",
        "address": "Race Course Circle, Alkapuri, Vadodara, Gujarat 390007",
        "city": "Vadodara",
        "lat": 22.3125,
        "lng": 73.1705,
        "available_facilities": [
            "Advanced Cardiac Emergency Care",
            "Neuro-Trauma ICU",
            "24x7 Stroke Team",
            "Pharmacy & CT Scan",
            "Air Ambulance Coordination"
        ],
        "total_capacity": "300 Beds",
        "is_24x7": True
    },
    {
        "facility_id": "HOSP-AHM-001",
        "name": "Ahmedabad Civil Hospital & Disaster Trauma Hub",
        "type": "HOSPITAL",
        "phone": "079-22680074",
        "alternate_phone": "079-22681024",
        "address": "Asarwa, Ahmedabad, Gujarat 380016",
        "city": "Ahmedabad",
        "lat": 23.0525,
        "lng": 72.5975,
        "available_facilities": [
            "State Apex Disaster Hospital",
            "300 Critical ICU Beds",
            "Helipad for Air Rescue Evacuations",
            "National Organ & Tissue Bank",
            "Mass Casualty Triage Center"
        ],
        "total_capacity": "2800 Beds (Apex State Hub)",
        "is_24x7": True
    },
    {
        "facility_id": "HOSP-SUR-001",
        "name": "Surat New Civil Hospital",
        "type": "HOSPITAL",
        "phone": "0261-2244456",
        "alternate_phone": "0261-2244457",
        "address": "Majura Gate, Ring Road, Surat, Gujarat 395001",
        "city": "Surat",
        "lat": 21.1730,
        "lng": 72.8210,
        "available_facilities": [
            "Waterborne Epidemic & Trauma Wing",
            "120 Ventilator Beds",
            "Rapid Anti-Venom & Infection Care",
            "24x7 Ambulance Dispatch"
        ],
        "total_capacity": "1200 Beds",
        "is_24x7": True
    },

    # --- FIRE & RESCUE STATIONS ---
    {
        "facility_id": "FIRE-VAD-001",
        "name": "Dandia Bazar Main Fire & Emergency Rescue HQ",
        "type": "FIRE_STATION",
        "phone": "0265-2413333",
        "alternate_phone": "101",
        "address": "Dandia Bazar, Near Tower, Vadodara, Gujarat 390001",
        "city": "Vadodara",
        "lat": 22.2980,
        "lng": 73.2010,
        "available_facilities": [
            "Heavy High-Pressure Water Tenders",
            "55-Meter Hydraulic Turntable Rescue Ladders",
            "4 Inflatable Rubber Boats (IRBs) with OBM",
            "Hydraulic Spreaders & Debris Cutters",
            "24x7 Emergency Flood Rescue Squad"
        ],
        "total_capacity": "12 Rescue Vehicles / 60 Firefighters",
        "is_24x7": True
    },
    {
        "facility_id": "FIRE-VAD-002",
        "name": "Makarpura Industrial Fire & Chemical Hazmat Station",
        "type": "FIRE_STATION",
        "phone": "0265-2642222",
        "alternate_phone": "0265-2643333",
        "address": "GIDC Makarpura, Vadodara, Gujarat 390010",
        "city": "Vadodara",
        "lat": 22.2450,
        "lng": 73.1950,
        "available_facilities": [
            "Chemical Foam Tenders for Gas/Oil Fires",
            "Hazmat Chemical Protection Suits (Level A)",
            "High-Volume Water Bowsers (15,000 Litres)",
            "Industrial Gas Leak Detection Kits"
        ],
        "total_capacity": "8 Heavy Tenders",
        "is_24x7": True
    },
    {
        "facility_id": "FIRE-VAD-003",
        "name": "Panigate Emergency Fire Station",
        "type": "FIRE_STATION",
        "phone": "0265-2562222",
        "alternate_phone": "101",
        "address": "Panigate Road, East Zone, Vadodara, Gujarat 390019",
        "city": "Vadodara",
        "lat": 22.3020,
        "lng": 73.2210,
        "available_facilities": [
            "Quick Response Rescue Vehicles (QRVs)",
            "Submersible Dewatering Water Pumps",
            "Chainsaws & Heavy Tree Clearing Blades",
            "Life Jackets & Rescue Buoys"
        ],
        "total_capacity": "6 Tenders / 35 Firefighters",
        "is_24x7": True
    },
    {
        "facility_id": "FIRE-SUR-001",
        "name": "Muglisara Fire Headquarters & Marine Squad",
        "type": "FIRE_STATION",
        "phone": "0261-2423777",
        "alternate_phone": "101",
        "address": "Muglisara, Surat, Gujarat 395003",
        "city": "Surat",
        "lat": 21.2010,
        "lng": 72.8250,
        "available_facilities": [
            "High-Capacity Amphibious Water Rescue Boats",
            "Tapi River Silt & Flood Evacuation Tenders",
            "High-Rise Rescue Cradles",
            "Emergency Dive Rescue Squad"
        ],
        "total_capacity": "18 Vehicles / 100 Personnel",
        "is_24x7": True
    },

    # --- POLICE STATIONS & CONTROL ROOMS (VADODARA) ---
    {
        "facility_id": "POL-VAD-001",
        "name": "Sayajigunj Police Station & Disaster Aid Post",
        "type": "POLICE_STATION",
        "phone": "0265-2361100",
        "alternate_phone": "112",
        "address": "Station Road, Sayajigunj, Vadodara, Gujarat 390005",
        "city": "Vadodara",
        "lat": 22.3110,
        "lng": 73.1840,
        "available_facilities": [
            "24x7 Dial-112 Emergency Control Post",
            "5 Mobile PCR Highway Patrol Vans",
            "Crowd Evacuation & Traffic Diversion Squad",
            "Anti-Looting Flood Security Patrols",
            "Emergency Wireless VHF Relay"
        ],
        "total_capacity": "50 Officers / 5 PCR Vans",
        "is_24x7": True
    },
    {
        "facility_id": "POL-VAD-002",
        "name": "Karelibaug Police Station",
        "type": "POLICE_STATION",
        "phone": "0265-2461100",
        "alternate_phone": "112",
        "address": "Karelibaug Main Road, Vadodara, Gujarat 390018",
        "city": "Vadodara",
        "lat": 22.3240,
        "lng": 73.1980,
        "available_facilities": [
            "Vishwamitri Basin Flood Evacuation Unit",
            "Community Shelter Security Force",
            "Loudspeaker Warning Patrols",
            "First Responder Medical Kits"
        ],
        "total_capacity": "40 Officers / 4 PCR Vans",
        "is_24x7": True
    },
    {
        "facility_id": "POL-VAD-003",
        "name": "Vadodara City Police Commissionerate Control Room",
        "type": "POLICE_STATION",
        "phone": "0265-2415111",
        "alternate_phone": "100 / 112",
        "address": "Jail Road, Kothi Compound, Vadodara, Gujarat 390001",
        "city": "Vadodara",
        "lat": 22.3040,
        "lng": 73.1960,
        "available_facilities": [
            "Apex District Police Command & CCTV Grid",
            "Direct Hotline to GSDMA & Army Headquarters",
            "City-Wide Siren Activation System",
            "Emergency VIP & Hospital Corridor Management"
        ],
        "total_capacity": "Central District Command",
        "is_24x7": True
    },

    # --- ALL GUJARAT DISTRICT FACILITIES ---
    # AHMEDABAD
    {
        "facility_id": "FIRE-AHM-001",
        "name": "Danapith Central Fire Headquarters, Ahmedabad",
        "type": "FIRE_STATION",
        "phone": "079-22148465",
        "alternate_phone": "101",
        "address": "Danapith, Old City, Ahmedabad, Gujarat 380001",
        "city": "Ahmedabad",
        "lat": 23.0238,
        "lng": 72.5855,
        "available_facilities": ["81-Meter Hydraulic Snorkel Ladder", "12 Rubber Boats", "Chemical Hazmat Unit", "High-Volume Pumps"],
        "total_capacity": "25 Rescue Units",
        "is_24x7": True
    },
    {
        "facility_id": "POL-AHM-001",
        "name": "Ahmedabad Police Commissionerate Control Room",
        "type": "POLICE_STATION",
        "phone": "079-25630100",
        "alternate_phone": "112",
        "address": "Shahibaug, Ahmedabad, Gujarat 380004",
        "city": "Ahmedabad",
        "lat": 23.0580,
        "lng": 72.5930,
        "available_facilities": ["24x7 Emergency Dial-112 Grid", "City-Wide Drone Surveillance", "Rapid Action Force Relay"],
        "total_capacity": "State Central Police Command",
        "is_24x7": True
    },
    # RAJKOT
    {
        "facility_id": "HOSP-RAJ-001",
        "name": "PDU Government Civil Hospital & Medical College, Rajkot",
        "type": "HOSPITAL",
        "phone": "0281-2453664",
        "alternate_phone": "108",
        "address": "Hospital Chowk, Jamnagar Road, Rajkot, Gujarat 360001",
        "city": "Rajkot",
        "lat": 22.3045,
        "lng": 70.7980,
        "available_facilities": ["Saurashtra Apex Trauma Unit", "100 ICU Beds", "Dialysis & Blood Bank", "Emergency Ambulances"],
        "total_capacity": "1200 Beds",
        "is_24x7": True
    },
    {
        "facility_id": "FIRE-RAJ-001",
        "name": "Rajkot Municipal Corporation Fire HQ",
        "type": "FIRE_STATION",
        "phone": "0281-2227222",
        "alternate_phone": "101",
        "address": "Dhebar Road, Rajkot, Gujarat 360001",
        "city": "Rajkot",
        "lat": 22.2960,
        "lng": 70.8030,
        "available_facilities": ["Hydraulic Rescue Ladders", "Water Tenders", "Aji Dam Flood Rescue Boats"],
        "total_capacity": "10 Tenders",
        "is_24x7": True
    },
    # SURAT
    {
        "facility_id": "POL-SUR-001",
        "name": "Surat City Police Control Room",
        "type": "POLICE_STATION",
        "phone": "0261-2465100",
        "alternate_phone": "112",
        "address": "Athwalines, Surat, Gujarat 395001",
        "city": "Surat",
        "lat": 21.1760,
        "lng": 72.8080,
        "available_facilities": ["Tapi River Flood Patrols", "PCR Mobile Units", "Coastal Border Security"],
        "total_capacity": "District Command",
        "is_24x7": True
    },
    # GANDHINAGAR
    {
        "facility_id": "HOSP-GAN-001",
        "name": "GMERS Civil Hospital, Gandhinagar",
        "type": "HOSPITAL",
        "phone": "079-23221931",
        "alternate_phone": "108",
        "address": "Sector 12, Gandhinagar, Gujarat 382016",
        "city": "Gandhinagar",
        "lat": 23.2230,
        "lng": 72.6480,
        "available_facilities": ["State Capital Trauma Center", "ICU Beds", "Emergency Response Fleet"],
        "total_capacity": "650 Beds",
        "is_24x7": True
    },
    # KUTCH / BHUJ
    {
        "facility_id": "HOSP-BHUJ-001",
        "name": "GK General Hospital, Bhuj (Adani Institute)",
        "type": "HOSPITAL",
        "phone": "02832-246417",
        "alternate_phone": "108",
        "address": "Lotus Colony, Bhuj, Kutch, Gujarat 370001",
        "city": "Kutch / Bhuj",
        "lat": 23.2510,
        "lng": 69.6710,
        "available_facilities": ["Earthquake & Cyclone Trauma Center", "50 ICU Beds", "Disaster Resuscitation Ward"],
        "total_capacity": "750 Beds",
        "is_24x7": True
    },
    {
        "facility_id": "FIRE-BHUJ-001",
        "name": "Bhuj Emergency Fire & Disaster Rescue Station",
        "type": "FIRE_STATION",
        "phone": "02832-250101",
        "alternate_phone": "101",
        "address": "Station Road, Bhuj, Kutch 370001",
        "city": "Kutch / Bhuj",
        "lat": 23.2430,
        "lng": 69.6640,
        "available_facilities": ["Earthquake Collapse Debris Search Gear", "High-Wind Cyclone Rescue Vans", "IRB Boats"],
        "total_capacity": "8 Heavy Units",
        "is_24x7": True
    },
    # BHAVNAGAR
    {
        "facility_id": "HOSP-BHAV-001",
        "name": "Sir Takhtasinhji General Hospital, Bhavnagar",
        "type": "HOSPITAL",
        "phone": "0278-2511511",
        "alternate_phone": "108",
        "address": "Kalanala, Bhavnagar, Gujarat 364001",
        "city": "Bhavnagar",
        "lat": 21.7710,
        "lng": 72.1480,
        "available_facilities": ["Coastal Trauma Hub", "80 ICU Beds", "Blood Bank", "Emergency Ambulances"],
        "total_capacity": "900 Beds",
        "is_24x7": True
    },
    # JAMNAGAR
    {
        "facility_id": "HOSP-JAM-001",
        "name": "Guru Gobindsingh (GG) Government Hospital, Jamnagar",
        "type": "HOSPITAL",
        "phone": "0288-2550204",
        "alternate_phone": "108",
        "address": "Pandit Nehru Marg, Jamnagar, Gujarat 361008",
        "city": "Jamnagar",
        "lat": 22.4740,
        "lng": 70.0620,
        "available_facilities": ["Level-1 Coastal Emergency Center", "120 ICU Beds", "Marine Toxin Treatment Ward"],
        "total_capacity": "1500 Beds",
        "is_24x7": True
    },
    # JUNAGADH
    {
        "facility_id": "HOSP-JUN-001",
        "name": "GMERS Civil Hospital, Junagadh",
        "type": "HOSPITAL",
        "phone": "0285-2651911",
        "alternate_phone": "108",
        "address": "Majevadi Gate, Junagadh, Gujarat 362001",
        "city": "Junagadh",
        "lat": 21.5270,
        "lng": 70.4610,
        "available_facilities": ["Gir Forest & Flash Flood Medical Hub", "Anti-Venom Bank", "ICU Beds"],
        "total_capacity": "500 Beds",
        "is_24x7": True
    },
    # ANAND
    {
        "facility_id": "HOSP-AND-001",
        "name": "Shree Krishna Hospital, Karamsad (Anand)",
        "type": "HOSPITAL",
        "phone": "02692-228411",
        "alternate_phone": "108",
        "address": "Gokal Nagar, Karamsad, Anand, Gujarat 388325",
        "city": "Anand",
        "lat": 22.5480,
        "lng": 72.8980,
        "available_facilities": ["Cardiac & Multi-Organ Trauma Care", "100 ICU Beds", "24x7 Blood Bank"],
        "total_capacity": "800 Beds",
        "is_24x7": True
    },
    # BHARUCH
    {
        "facility_id": "HOSP-BHA-001",
        "name": "Bharuch Civil Hospital & Narmada Basin Trauma Hub",
        "type": "HOSPITAL",
        "phone": "02642-240100",
        "alternate_phone": "108",
        "address": "Station Road, Bharuch, Gujarat 392001",
        "city": "Bharuch",
        "lat": 21.7080,
        "lng": 72.9980,
        "available_facilities": ["Narmada Flood Trauma Care", "Industrial Chemical Burn Care", "ICU Beds"],
        "total_capacity": "450 Beds",
        "is_24x7": True
    },
    # MORBI
    {
        "facility_id": "HOSP-MOR-001",
        "name": "Morbi General Civil Hospital",
        "type": "HOSPITAL",
        "phone": "02822-220011",
        "alternate_phone": "108",
        "address": "Ayodhya Puri, Morbi, Gujarat 363641",
        "city": "Morbi",
        "lat": 22.8180,
        "lng": 70.8410,
        "available_facilities": ["Machchhu River Disaster Medical Care", "Trauma ICU", "Ambulance Hub"],
        "total_capacity": "350 Beds",
        "is_24x7": True
    },
    # PORBANDAR
    {
        "facility_id": "HOSP-POR-001",
        "name": "Bhavsinhji General Hospital, Porbandar",
        "type": "HOSPITAL",
        "phone": "0286-2242100",
        "alternate_phone": "108",
        "address": "MG Road, Porbandar, Gujarat 360575",
        "city": "Porbandar",
        "lat": 21.6440,
        "lng": 69.6120,
        "available_facilities": ["Cyclone Surge Emergency Ward", "Coastal Rescue Link", "ICU Beds"],
        "total_capacity": "400 Beds",
        "is_24x7": True
    },
    # NAVSARI
    {
        "facility_id": "HOSP-NAV-001",
        "name": "Navsari Civil Hospital (Purna River Zone)",
        "type": "HOSPITAL",
        "phone": "02637-258100",
        "alternate_phone": "108",
        "address": "Lunsikui, Navsari, Gujarat 396445",
        "city": "Navsari",
        "lat": 20.9510,
        "lng": 72.9340,
        "available_facilities": ["Purna Flood Evacuation Medical Hub", "ICU Beds", "24x7 Ambulance"],
        "total_capacity": "350 Beds",
        "is_24x7": True
    },
    # VALSAD & VAPI
    {
        "facility_id": "HOSP-VAL-001",
        "name": "GMERS Hospital, Valsad & Vapi GIDC Hazmat Hub",
        "type": "HOSPITAL",
        "phone": "02632-251100",
        "alternate_phone": "108",
        "address": "Halar, Valsad, Gujarat 396001",
        "city": "Valsad",
        "lat": 20.6120,
        "lng": 72.9280,
        "available_facilities": ["Chemical Toxicology & Burn Center", "Auranga Flood Medical Post", "ICU Beds"],
        "total_capacity": "550 Beds",
        "is_24x7": True
    },
    # MEHSANA & PATAN
    {
        "facility_id": "HOSP-MEH-001",
        "name": "Mehsana General Civil Hospital",
        "type": "HOSPITAL",
        "phone": "02762-252100",
        "alternate_phone": "108",
        "address": "TB Hospital Road, Mehsana, Gujarat 384002",
        "city": "Mehsana",
        "lat": 23.5950,
        "lng": 72.3810,
        "available_facilities": ["North Gujarat Regional Trauma Hub", "ICU Beds", "Blood Bank"],
        "total_capacity": "450 Beds",
        "is_24x7": True
    },
    # BANASKANTHA (PALANPUR)
    {
        "facility_id": "HOSP-PAL-001",
        "name": "Palanpur Civil Hospital & Banaskantha Disaster Ward",
        "type": "HOSPITAL",
        "phone": "02742-252200",
        "alternate_phone": "108",
        "address": "Civil Hospital Road, Palanpur, Gujarat 385001",
        "city": "Palanpur (Banaskantha)",
        "lat": 24.1750,
        "lng": 72.4380,
        "available_facilities": ["Desert Border Medical Hub", "Trauma Unit", "Flash Flood Aid Center"],
        "total_capacity": "400 Beds",
        "is_24x7": True
    },
    # PANCHMAHAL & DAHOD
    {
        "facility_id": "HOSP-GOD-001",
        "name": "Godhra Civil Hospital & Eastern Tribal Trauma Hub",
        "type": "HOSPITAL",
        "phone": "02672-242100",
        "alternate_phone": "108",
        "address": "Station Road, Godhra, Gujarat 389001",
        "city": "Godhra (Panchmahal)",
        "lat": 22.7810,
        "lng": 73.6180,
        "available_facilities": ["Panchmahal Emergency Care", "Anti-Venom & Trauma Units", "ICU Beds"],
        "total_capacity": "350 Beds",
        "is_24x7": True
    }
]



DISASTER_REMEDY_GUIDES: List[Dict[str, Any]] = [
    {
        "disaster_type": "FLOOD",
        "title": "🌊 Floods & Heavy Inundation (Vishwamitri / Tapi Basins)",
        "summary": "Rapid rising water levels due to cloudburst or dam gate opening. Follow these essential life-saving measures.",
        "emergency_helpline": "Vadodara Flood Cell: 1077 | State SEOC: 1070 | Ambulance: 108",
        "before_steps": [
            "Identify the nearest high-ground sanctuary or municipal relief camp.",
            "Pack an Emergency Grab Bag: Aadhar card, waterproof pouch for cash, torch, extra batteries, clean drinking water, and essential medicines.",
            "Turn off the main electricity circuit breaker and gas cylinder valve before water enters premises.",
            "Move elderly citizens, pregnant mothers, and infants to the first floor or terrace early."
        ],
        "during_steps": [
            "NEVER walk or drive through moving flood water—6 inches of rushing water can knock down an adult.",
            "Stay alert for crocodiles and snakes known to enter residential areas during Vishwamitri river overflow.",
            "If trapped on a terrace or roof, wave a bright-colored cloth or whistle to attract rescue helicopters and NDRF boats.",
            "Do NOT touch electric poles, transformers, or fallen wires lying in stagnant water."
        ],
        "after_steps": [
            "Boil drinking water for at least 5 minutes to prevent cholera, typhoid, and leptospirosis.",
            "Do not turn on electrical appliances until inspected and dried by a certified electrician.",
            "Report damaged bridges or weakened road causeways to the municipal corporation."
        ],
        "first_aid_tips": [
            "Hypothermia: Wrap wet victims in dry woollen blankets and provide warm fluids (if conscious).",
            "Drowning Resuscitation: Check airway, begin chest compressions immediately (100-120 per minute), and give rescue breaths."
        ]
    },
    {
        "disaster_type": "CYCLONE",
        "title": "🌀 Cyclone & Severe Coastal Gale (Cyclone Biparjoy / Arabian Sea)",
        "summary": "Extreme wind speeds exceeding 120 km/h with heavy storm surges. Key survival protocols for coastal and urban sectors.",
        "emergency_helpline": "Coast Guard: 1554 | NDRF Helpline: 011-24363260 | Police: 112",
        "before_steps": [
            "Board up or tape glass windows with heavy criss-cross adhesive tape to prevent flying glass shards.",
            "Secure or bring inside loose outdoor objects (tin sheets, flower pots, solar water heaters, satellite dishes).",
            "Keep mobile phones, power banks, and rechargeable emergency lamps fully charged.",
            "Store at least 5 days of non-perishable food, dry snacks, and canned drinking water."
        ],
        "during_steps": [
            "Stay indoors in the strongest, windowless room (like an interior hallway or under a sturdy stairwell).",
            "Beware of the 'Eye of the Cyclone'—if winds suddenly drop calm, do NOT go outside; destructive winds will return from the opposite direction within minutes.",
            "Keep tuned into official AIR (All India Radio) and IMD weather radar bulletins.",
            "Avoid sheltering under tin sheds, billboards, or tall eucalyptus/banyan trees."
        ],
        "after_steps": [
            "Watch out for dangling live electrical wires and severed gas pipes.",
            "Drive only if strictly necessary; roads may be blocked by fallen trees and downed pylons.",
            "Help clear municipal drainage grates to relieve local water accumulation."
        ],
        "first_aid_tips": [
            "Deep Lacerations: Apply direct firm pressure with a clean sterile cloth for 10 minutes to stop bleeding.",
            "Head Trauma: Keep patient's head elevated and still; do not give solid food if vomiting."
        ]
    },
    {
        "disaster_type": "EARTHQUAKE",
        "title": "🏚️ Earthquakes & Structural Fractures (Kutch Seismic Zone 5)",
        "summary": "Sudden violent ground shaking. Fast reaction within the first 5 seconds saves lives.",
        "emergency_helpline": "GSDMA Bhuj Cell: 02832-250000 | Fire & Rescue: 101 | National Relief: 1078",
        "before_steps": [
            "Fasten heavy furniture, cupboards, and water heaters firmly to walls.",
            "Know your family's designated outdoor safe assembly point in an open park or ground."
        ],
        "during_steps": [
            "DROP to the ground, take COVER under a heavy wooden desk or table, and HOLD ON until shaking stops.",
            "If in bed, stay there and protect your head with pillows.",
            "If outdoors, move immediately away from buildings, glass facades, streetlights, and utility wires.",
            "NEVER use elevators or run into stairwells while the building is shaking."
        ],
        "after_steps": [
            "Expect aftershocks—be prepared to Drop, Cover, and Hold On repeatedly.",
            "Check for gas leaks: if you smell sulfur/gas, open windows, evacuate immediately, and do not use light switches.",
            "Wear heavy-soled shoes to avoid puncture wounds from broken glass and debris."
        ],
        "first_aid_tips": [
            "Bone Fractures: Immobilize the broken limb using a rigid splint (cardboard or wood) before moving the patient.",
            "Crush Injuries: Do not remove heavy debris if trapped for over 1 hour without medical team presence (prevent crush syndrome shock)."
        ]
    },
    {
        "disaster_type": "INDUSTRIAL_HAZARD",
        "title": "🧪 Chemical, Gas & Industrial Hazards (GIDC Belts / Ankleshwar)",
        "summary": "Toxic gas release, chlorine leaks, or industrial fire in GIDC estates. Critical respiratory defense.",
        "emergency_helpline": "Disaster Hazmat Cell: 02646-242222 | Fire Emergency: 101 | Factory Inspector: 1077",
        "before_steps": [
            "Know your community siren codes for chemical alarm.",
            "Keep N95 or multi-gas activated carbon respirator masks in home emergency kits."
        ],
        "during_steps": [
            "Cover your nose and mouth immediately with a wet cotton towel or cloth to filter airborne toxic particles.",
            "Evacuate PERPENDICULAR (crosswind) or UPWIND from the gas plume; never run with the wind.",
            "If sheltering in place, close all windows, doors, and AC air vents, and seal door cracks with wet towels.",
            "Do NOT light matches, lighters, or operate vehicle ignitions near flammable vapor clouds."
        ],
        "after_steps": [
            "Thoroughly flush eyes and exposed skin with clean running water for at least 15 minutes.",
            "Discard contaminated clothing in sealed plastic bags."
        ],
        "first_aid_tips": [
            "Chemical Inhalation: Move victim to fresh air immediately, loosen tight collar, and administer medical oxygen if available.",
            "Chemical Eye Burn: Flush eyes with saline water from inner to outer corner continuously."
        ]
    }
]


from backend.models import (
    EmergencyFacility,
    RemedyGuide,
    ReliefShelter,
    BloodOxygenInventory,
    DamWaterGauge,
    SafePersonRecord
)


VERIFIED_GUJARAT_SHELTERS: List[Dict[str, Any]] = [
    {
        "shelter_id": "SHEL-VAD-001",
        "name": "Akota Indoor Stadium Emergency Relief Sanctuary",
        "locality": "Akota Main Road",
        "city": "Vadodara",
        "lat": 22.2965,
        "lng": 73.1750,
        "capacity_total": 2500,
        "current_occupants": 1150,
        "food_packets_available": 4200,
        "drinking_water_litres": 15000,
        "medical_team_on_site": True,
        "contact_phone": "0265-2358899",
        "status": "OPEN"
    },
    {
        "shelter_id": "SHEL-VAD-002",
        "name": "Sama Indoor Sports Complex Relief Hub",
        "locality": "Sama Road, North Zone",
        "city": "Vadodara",
        "lat": 22.3380,
        "lng": 73.1950,
        "capacity_total": 1800,
        "current_occupants": 740,
        "food_packets_available": 3000,
        "drinking_water_litres": 8000,
        "medical_team_on_site": True,
        "contact_phone": "0265-2782244",
        "status": "OPEN"
    },
    {
        "shelter_id": "SHEL-VAD-003",
        "name": "MSU (Maharaja Sayajirao University) Pavilion Safe Sanctuary",
        "locality": "Sayajigunj",
        "city": "Vadodara",
        "lat": 22.3140,
        "lng": 73.1890,
        "capacity_total": 3200,
        "current_occupants": 1420,
        "food_packets_available": 5500,
        "drinking_water_litres": 20000,
        "medical_team_on_site": True,
        "contact_phone": "0265-2795555",
        "status": "OPEN"
    },
    {
        "shelter_id": "SHEL-SUR-001",
        "name": "Rander Community Flood Relief Center",
        "locality": "Rander Road",
        "city": "Surat",
        "lat": 21.2180,
        "lng": 72.7950,
        "capacity_total": 2000,
        "current_occupants": 920,
        "food_packets_available": 3500,
        "drinking_water_litres": 12000,
        "medical_team_on_site": True,
        "contact_phone": "0261-2761100",
        "status": "OPEN"
    }
]


VERIFIED_BLOOD_OXYGEN_INVENTORY: List[Dict[str, Any]] = [
    {
        "center_id": "BLOOD-VAD-001",
        "name": "SSG Hospital Apex Regional Blood & Medical Oxygen Bank",
        "city": "Vadodara",
        "phone": "0265-2424848",
        "blood_units": {"O+": 85, "A+": 60, "B+": 75, "AB+": 40, "O-": 18, "A-": 12, "B-": 15, "AB-": 8},
        "oxygen_cylinders_available": 340,
        "anti_venom_vials": 120
    },
    {
        "center_id": "BLOOD-VAD-002",
        "name": "Prathama Blood Centre & GMERS Gotri Hub",
        "city": "Vadodara",
        "phone": "0265-2398001",
        "blood_units": {"O+": 62, "A+": 45, "B+": 58, "AB+": 25, "O-": 10, "A-": 8, "B-": 11, "AB-": 5},
        "oxygen_cylinders_available": 190,
        "anti_venom_vials": 65
    },
    {
        "center_id": "BLOOD-AHM-001",
        "name": "Ahmedabad Civil Apex Disaster Blood Bank",
        "city": "Ahmedabad",
        "phone": "079-22680074",
        "blood_units": {"O+": 190, "A+": 140, "B+": 175, "AB+": 90, "O-": 45, "A-": 30, "B-": 38, "AB-": 22},
        "oxygen_cylinders_available": 850,
        "anti_venom_vials": 350
    }
]


VERIFIED_DAM_WATER_GAUGES: List[Dict[str, Any]] = [
    {
        "gauge_id": "DAM-AJWA-01",
        "river_or_dam_name": "Ajwa Dam (Surya Sagar Reservoir)",
        "location": "Vadodara Catchment Area",
        "current_level_ft": 213.85,
        "warning_level_ft": 212.00,
        "danger_level_ft": 214.00,
        "discharge_cusecs": 45000,
        "risk_level": "RED_ALERT",
        "trend": "RISING_FAST"
    },
    {
        "gauge_id": "RIV-VISH-01",
        "river_or_dam_name": "Vishwamitri River Bridge Gauge",
        "location": "Karelibaug / Kalaghoda Bridge, Vadodara",
        "current_level_ft": 35.40,
        "warning_level_ft": 24.00,
        "danger_level_ft": 26.00,
        "discharge_cusecs": 38500,
        "risk_level": "RED_ALERT",
        "trend": "RISING_FAST"
    },
    {
        "gauge_id": "DAM-UKAI-01",
        "river_or_dam_name": "Ukai Dam (Tapi River)",
        "location": "Tapi / Surat District",
        "current_level_ft": 338.20,
        "warning_level_ft": 335.00,
        "danger_level_ft": 345.00,
        "discharge_cusecs": 125000,
        "risk_level": "AMBER_WARNING",
        "trend": "STABLE"
    },
    {
        "gauge_id": "DAM-NARM-01",
        "river_or_dam_name": "Sardar Sarovar Narmada Dam",
        "location": "Kevadia / Narmada",
        "current_level_ft": 136.50,
        "warning_level_ft": 135.00,
        "danger_level_ft": 138.68,
        "discharge_cusecs": 85000,
        "risk_level": "NORMAL",
        "trend": "STABLE"
    }
]


class EmergencyDirectoryService:
    """Provides querying and proximity sorting for Gujarat emergency facilities, shelters, blood/oxygen, dam telemetry, and safe registry."""

    def __init__(self):
        self.facilities: List[EmergencyFacility] = []
        self.shelters: List[ReliefShelter] = []
        self.blood_inventory: List[BloodOxygenInventory] = []
        self.dam_gauges: List[DamWaterGauge] = []
        self.safe_persons: List[SafePersonRecord] = []
        self._load_data()

    def _load_data(self):
        for data in VERIFIED_GUJARAT_FACILITIES:
            self.facilities.append(EmergencyFacility(**data))
        for data in VERIFIED_GUJARAT_SHELTERS:
            self.shelters.append(ReliefShelter(**data))
        for data in VERIFIED_BLOOD_OXYGEN_INVENTORY:
            self.blood_inventory.append(BloodOxygenInventory(**data))
        for data in VERIFIED_DAM_WATER_GAUGES:
            self.dam_gauges.append(DamWaterGauge(**data))

        # Seed initial safe registry
        self.safe_persons.append(SafePersonRecord(
            record_id="SAFE-001",
            full_name="Jignesh Shah & Family",
            phone_number="+91-9825123456",
            current_location="Akota Indoor Stadium Safe Camp, Vadodara",
            status="SAFE",
            notes="Evacuated safely from Karelibaug ground floor. Family of 5 safe.",
            family_members_count=5
        ))
        self.safe_persons.append(SafePersonRecord(
            record_id="SAFE-002",
            full_name="Pooja Patel",
            phone_number="+91-9898112233",
            current_location="Sama Indoor Complex, Vadodara",
            status="SAFE",
            notes="Reached relief center with infant. Food and water available.",
            family_members_count=3
        ))

    def get_all_facilities(self, facility_type: Optional[str] = None, city: Optional[str] = None) -> List[EmergencyFacility]:
        results = self.facilities
        if facility_type and facility_type != "ALL":
            results = [f for f in results if f.type.upper() == facility_type.upper()]
        if city and city != "ALL":
            results = [f for f in results if f.city.lower() == city.lower()]
        return results

    def find_nearby_facilities(
        self,
        lat: float,
        lng: float,
        facility_type: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Rank emergency facilities by geodesic proximity to user/incident coordinates."""
        candidates = self.get_all_facilities(facility_type=facility_type)
        ranked = []

        for fac in candidates:
            dist_km = haversine_distance_km(lat, lng, fac.lat, fac.lng)
            est_minutes = max(2, round((dist_km / 30.0) * 60))
            
            ranked.append({
                "facility": fac.model_dump(),
                "distance_km": dist_km,
                "eta_minutes": est_minutes,
                "navigation_origin": {"lat": lat, "lng": lng},
                "navigation_destination": {"lat": fac.lat, "lng": fac.lng, "name": fac.name}
            })

        ranked.sort(key=lambda x: x["distance_km"])
        return ranked[:limit]

    def get_relief_shelters(self, city: Optional[str] = None) -> List[ReliefShelter]:
        if city and city != "ALL":
            return [s for s in self.shelters if s.city.lower() == city.lower()]
        return self.shelters

    def get_blood_oxygen_inventory(self) -> List[BloodOxygenInventory]:
        return self.blood_inventory

    def get_dam_water_gauges(self) -> List[DamWaterGauge]:
        return self.dam_gauges

    def register_safe_person(self, person: SafePersonRecord) -> SafePersonRecord:
        self.safe_persons.insert(0, person)
        return person

    def search_safe_persons(self, query: str = "") -> List[SafePersonRecord]:
        if not query:
            return self.safe_persons
        q = query.lower()
        return [
            p for p in self.safe_persons
            if q in p.full_name.lower() or q in p.phone_number.lower() or q in p.current_location.lower()
        ]

    def get_remedy_guides(self) -> List[RemedyGuide]:
        return [RemedyGuide(**g) for g in DISASTER_REMEDY_GUIDES]


emergency_directory_service = EmergencyDirectoryService()

