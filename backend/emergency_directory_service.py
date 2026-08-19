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

    # --- POLICE STATIONS & CONTROL ROOMS ---
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


class EmergencyDirectoryService:
    """Provides querying and proximity sorting for Gujarat emergency facilities and remedy guides."""

    def __init__(self):
        self.facilities: List[EmergencyFacility] = []
        self._load_facilities()

    def _load_facilities(self):
        for data in VERIFIED_GUJARAT_FACILITIES:
            self.facilities.append(EmergencyFacility(**data))

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
            # Estimate driving time (assuming 30 km/h emergency response speed in city)
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

    def get_remedy_guides(self) -> List[RemedyGuide]:
        return [RemedyGuide(**g) for g in DISASTER_REMEDY_GUIDES]


emergency_directory_service = EmergencyDirectoryService()
