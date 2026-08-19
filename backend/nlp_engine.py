"""
AI and NLP Intelligence Engine for Disaster Data Classification,
Named Entity Recognition (NER), Geocoding, Credibility Scoring, and Need Extraction.
"""
import re
import math
import random
from typing import Dict, List, Tuple, Optional, Any
from backend.config import KNOWN_LOCATIONS, DISASTER_TYPES, URGENCY_LEVELS
from backend.models import DisasterIncident

# Keyword dictionaries for disaster classification
DISASTER_KEYWORDS = {
    "flood": [
        "flood", "flooding", "waterlogging", "submerged", "inundated", "water level", 
        "overflowing", "deluge", "drowning", "dam breach", "water rose", "chest deep",
        "પૂર", "પાણી ભરાઈ", "વિશ્વામિત્રી", "તાપી", "નર્મદા", "પાણી", "जलभराव", "வெள்ளம்"
    ],
    "cyclone": [
        "cyclone", "hurricane", "typhoon", "storm surge", "gale", "high winds",
        "gust", "tornado", "biparjoy", "tauktae", "vayu", "વાવાઝોડું", "તોફાન", "ચક્રવાત"
    ],
    "earthquake": [
        "earthquake", "tremor", "aftershock", "seismic", "richter", "epicenter",
        "shaking", "ground shake", "faultline", "ધરતીકંપ", "ભૂકંપ", "આંચકા"
    ],
    "industrial_hazard": [
        "gas leak", "chemical spill", "toxic fume", "ammonia leak", "boiler explosion",
        "hazardous waste", "ankleshwar", "dahej", "hazira", "ગેસ ગળતર", "કેમિકલ"
    ],
    "building_collapse": [
        "building collapse", "collapsed", "rubble", "crushed", "trapped under debris",
        "structural failure", "pillar cracked", "slab fell", "મકાન ધરાશાયી", "તૂટી પડ્યું"
    ],
    "landslide": [
        "landslide", "mudslide", "rockfall", "debris", "mountain collapse", "hill slope",
        "girnar", "saputara", "soil erosion", "ધસી પડવું", "ભૂસ્ખલન"
    ],
    "urban_fire": [
        "fire outbreak", "factory fire", "cylinder blast", "smoke billowing", "fire engine",
        "fire brigade", "આગ લાગી", "દાવાનળ"
    ],
    "stampede": [
        "stampede", "crush", "crowd surge", "choked exit", "overcrowded bridge", "ભાગદોડ"
    ]
}

# Critical urgency signals
URGENCY_P1_SIGNALS = [
    "sos", "save us", "save our lives", "trapped", "cannot breathe", "drowning", "infant",
    "baby", "elderly", "pregnant", "bleeding", "unconscious", "roof collapsing",
    "water chest high", "no way out", "urgent rescue", "send boat immediately",
    "life threatening", "બચાવો", "મદદ કરો", "ફસાયા છીએ", "બોટ મોકલો", "બચાઓ", "કાપાતુંગા"
]

URGENCY_P2_SIGNALS = [
    "need medicine", "insulin", "oxygen", "broken bone", "injured", "hospital cut off",
    "water rising", "power down for 24h", "ambulance required", "first aid", "dialysis",
    "દવા જોઈએ", "ઓક્સિજન", "ઈજા"
]

URGENCY_P3_SIGNALS = [
    "no food", "drinking water", "starving", "dry rations", "milk packets", "baby food",
    "road blocked", "fallen tree", "power outage", "need shelter", "relief camp",
    "ખોરાક", "પીવાનું પાણી", "લાઈટ ગઈ", "રસ્તો બંધ"
]

# Vernacular translations dictionary
INDIC_TRANSLATIONS = {
    "બચાવો": "[SOS/Save Us]",
    "મદદ કરો": "[Need Help]",
    "ફસાયા છીએ": "[Trapped in Flood]",
    "પાણી ભરાઈ ગયું": "[Severe Water Inundation]",
    "વાવાઝોડું": "[Cyclone/Storm Surge]",
    "ધરતીકંપ": "[Earthquake/Tremor]",
    "બોટ મોકલો": "[Send Rescue Boat]",
    "પૂર": "[Severe Flooding]",
    "આગ લાગી": "[Fire Outbreak]",
    "બચાઓ": "[SOS/Save Us]",
    "मदद चाहिए": "[Need Help]",
    "पानी भर गया": "[Water Inundation]",
    "भूस्खलन": "[Landslide]",
    "ભૂકંપ": "[Earthquake]",
    "காப்பாத்துங்க": "[SOS/Save Us]",
    "உதவி தேவை": "[Need Help]",
    "வெள்ளம்": "[Flooding]",
    "രക്ഷിക്കൂ": "[SOS/Rescue Us]",
    "വെള്ളപ്പൊക്കം": "[Severe Flooding]",
    "ഉരുൾപൊട്ടൽ": "[Major Landslide]",
    "ഭൂകമ്പം": "[Earthquake]",
    "भूकंप": "[Earthquake]"
}


class NLPIntelligenceEngine:
    """Disaster NLP analysis, entity extraction, scoring, and deduplication."""

    def __init__(self):
        self.known_locations = KNOWN_LOCATIONS

    def detect_and_translate_vernacular(self, text: str) -> Tuple[str, str]:
        """Detect Indian regional keywords and attach translated annotations."""
        translated = text
        detected_lang = "en"
        
        for vern_word, eng_trans in INDIC_TRANSLATIONS.items():
            if vern_word in text:
                translated = translated.replace(vern_word, f"{vern_word} {eng_trans}")
                if any(k in text for k in ["બચાવો", "મદદ", "ફસાયા", "પાણી", "વાવાઝોડું", "પૂર", "ધરતીકંપ"]):
                    detected_lang = "gu"
                elif "बचाओ" in text or "पानी" in text or "भू" in text:
                    detected_lang = "hi"
                elif "காப்" in text or "வெள்ளம்" in text or "உதવી" in text:
                    detected_lang = "ta"
                elif "രക്ഷിക്കൂ" in text or "ഉരുൾ" in text:
                    detected_lang = "ml"
                    
        return translated, detected_lang

    def classify_disaster_type(self, text: str) -> Tuple[str, float]:
        """Classify disaster type based on weighted keyword frequencies."""
        text_lower = text.lower()
        scores: Dict[str, float] = {}

        for dtype, kws in DISASTER_KEYWORDS.items():
            match_count = sum(1 for kw in kws if kw in text_lower)
            if match_count > 0:
                scores[dtype] = match_count * 1.5

        if not scores:
            return "flood" if "water" in text_lower else "other", 0.50

        best_type = max(scores, key=scores.get)
        confidence = min(0.98, 0.65 + (scores[best_type] * 0.1))
        return best_type, round(confidence, 2)

    def calculate_urgency(self, text: str, disaster_type: str = "flood") -> Tuple[str, float]:
        """Determine urgency priority level (P1 to P4) and numerical score."""
        text_lower = text.lower()
        score = 0.35  # base score

        # Check P1
        p1_matches = [sig for sig in URGENCY_P1_SIGNALS if sig in text_lower]
        if p1_matches or "sos" in text_lower or "rescue" in text_lower and "trapped" in text_lower:
            score = 0.85 + (len(p1_matches) * 0.04)
            return "P1_CRITICAL", min(0.99, round(score, 2))

        # Check P2
        p2_matches = [sig for sig in URGENCY_P2_SIGNALS if sig in text_lower]
        if p2_matches:
            score = 0.65 + (len(p2_matches) * 0.05)
            return "P2_HIGH", min(0.84, round(score, 2))

        # Check P3
        p3_matches = [sig for sig in URGENCY_P3_SIGNALS if sig in text_lower]
        if p3_matches:
            score = 0.45 + (len(p3_matches) * 0.05)
            return "P3_MEDIUM", min(0.64, round(score, 2))

        return "P4_LOW", round(score, 2)

    def extract_needs(self, text: str) -> List[str]:
        """Extract concrete actionable relief/rescue needs from text."""
        text_lower = text.lower()
        needs = []

        if any(w in text_lower for w in ["trap", "rescue", "evacuat", "drown", "save us", "stuck", "બચાવો", "ફસાયા", "બચાઓ", "મદદ"]):
            needs.append("Immediate Search & Rescue")
        if any(w in text_lower for w in ["boat", "dinghy", "raft", "swimming", "બોટ"]):
            needs.append("Inflatable Rescue Boat (IRB)")
        if any(w in text_lower for w in ["medic", "doctor", "ambulance", "injur", "blood", "insulin", "first aid", "દવા", "ઓક્સિજન", "ઈજા"]):
            needs.append("Medical Trauma Support")
        if any(w in text_lower for w in ["food", "ration", "water", "drink", "starv", "hungry", "packet", "ખોરાક", "પીવાનું પાણી", "દૂધ", "અનાજ"]):
            needs.append("Food & Drinking Water")
        if any(w in text_lower for w in ["baby", "infant", "child", "milk", "બાળક"]):
            needs.append("Infant Care & Milk")
        if any(w in text_lower for w in ["shelter", "stay", "homeless", "camp", "roof", "આશ્રય", "કેમ્પ"]):
            needs.append("Emergency Temporary Shelter")
        if any(w in text_lower for w in ["road block", "tree fell", "debris", "bridge broken", "severed", "રસ્તો બંધ", "પુલ તૂટ્યો"]):
            needs.append("Route Clearance / Heavy Machinery")
        if any(w in text_lower for w in ["power", "electricity", "generator", "darkness", "battery", "લાઈટ ગઈ", "વીજળી"]):
            needs.append("Power Generator / Mobile Lighting")

        if not needs:
            needs.append("Situational Assessment")

        return needs

    def extract_victim_count(self, text: str) -> int:
        """Estimate number of affected persons from numerical mentions."""
        text_lower = text.lower()
        patterns = [
            r'(\d+)\s*(?:people|persons|victims|families|residents|members|souls|kids|children)',
            r'family of\s*(\d+)',
            r'around\s*(\d+)',
            r'group of\s*(\d+)'
        ]
        
        for pat in patterns:
            match = re.search(pat, text_lower)
            if match:
                try:
                    count = int(match.group(1))
                    if 1 <= count <= 5000:
                        return count
                except ValueError:
                    pass

        if "family" in text_lower:
            return 4
        if "crowd" in text_lower or "many people" in text_lower or "entire street" in text_lower:
            return 25

        return 1

    def geocode_text(self, text: str, default_location: Optional[Tuple[float, float]] = None) -> Tuple[str, float, float]:
        """
        Named Entity Recognition for locations and geocoding into (name, lat, lng).
        Matches against known gazetteer with small Gaussian jitter for realistic pin spread.
        """
        text_lower = text.lower()
        matched_loc_name = None
        matched_coords = None

        # Check in gazetteer (longest match first)
        sorted_locs = sorted(self.known_locations.keys(), key=lambda k: len(k), reverse=True)
        for loc in sorted_locs:
            if loc in text_lower:
                matched_loc_name = loc.title()
                matched_coords = self.known_locations[loc]
                break

        if matched_coords:
            # Apply slight realistic spatial dispersion (+/- 0.008 deg ~ 800m)
            jitter_lat = matched_coords[0] + random.uniform(-0.008, 0.008)
            jitter_lng = matched_coords[1] + random.uniform(-0.008, 0.008)
            return matched_loc_name, round(jitter_lat, 5), round(jitter_lng, 5)

        if default_location:
            jitter_lat = default_location[0] + random.uniform(-0.015, 0.015)
            jitter_lng = default_location[1] + random.uniform(-0.015, 0.015)
            return "Incident Zone (Area Vicinity)", round(jitter_lat, 5), round(jitter_lng, 5)

        # Fallback default (Central India / Disaster Grid)
        return "Disaster Alert Sector", 13.0827, 80.2707

    def calculate_credibility_and_verification(
        self,
        source: str,
        text: str,
        has_coords: bool,
        has_phone: bool
    ) -> Tuple[str, float, List[str]]:
        """Calculate multi-factor credibility score and verification status."""
        score = 0.50
        verified_by = []

        # Source base weights
        if source in ["usgs_seismic", "weather_radar", "gdacs_rss"]:
            score += 0.40
            verified_by.append("Official Sensor / GDACS Feed")
        elif source == "citizen_sos":
            score += 0.30
            verified_by.append("Direct Citizen Authenticated SOS")
        elif source == "social_media_x":
            score += 0.15
            verified_by.append("Social Media Ground Report")
        else:
            score += 0.10
            verified_by.append("Open Web Aggregator")

        if has_coords:
            score += 0.10
            verified_by.append("GPS Geotag Verified")

        # Specific contact details / landmarks boost
        phone_match = re.search(r'\+?\d{10,12}', text)
        if phone_match or has_phone:
            score += 0.10
            verified_by.append("Contact Details Attached")

        final_score = min(0.99, max(0.20, round(score, 2)))

        if final_score >= 0.85:
            status = "CONFIRMED"
        elif final_score >= 0.65:
            status = "CROSS_VERIFIED"
        else:
            status = "UNVERIFIED"

        return status, final_score, verified_by

    def process_raw_report(
        self,
        incident_id: str,
        source: str,
        raw_text: str,
        author: Optional[str] = None,
        source_url: Optional[str] = None,
        override_lat: Optional[float] = None,
        override_lng: Optional[float] = None,
        override_loc_name: Optional[str] = None,
        default_center: Optional[Tuple[float, float]] = None
    ) -> DisasterIncident:
        """End-to-end processing pipeline for a disaster report."""
        translated_text, detected_lang = self.detect_and_translate_vernacular(raw_text)
        disaster_type, type_conf = self.classify_disaster_type(raw_text)
        urgency_lvl, urgency_score = self.calculate_urgency(raw_text, disaster_type)
        needs = self.extract_needs(raw_text)
        victim_count = self.extract_victim_count(raw_text)

        if override_lat is not None and override_lng is not None:
            lat = override_lat
            lng = override_lng
            loc_name = override_loc_name or "Reported GPS Location"
        else:
            loc_name, lat, lng = self.geocode_text(raw_text, default_center)

        verif_status, verif_score, verif_sources = self.calculate_credibility_and_verification(
            source=source,
            text=raw_text,
            has_coords=(override_lat is not None),
            has_phone=bool(re.search(r'\d{10}', raw_text))
        )

        is_sos = (urgency_lvl == "P1_CRITICAL" or source == "citizen_sos")

        return DisasterIncident(
            id=incident_id,
            source=source,
            source_url=source_url,
            author=author or "Disaster Stream",
            raw_text=raw_text,
            translated_text=translated_text if detected_lang != "en" else None,
            detected_language=detected_lang,
            disaster_type=disaster_type,
            urgency_level=urgency_lvl,
            urgency_score=urgency_score,
            location_name=loc_name,
            latitude=lat,
            longitude=lng,
            confidence_score=type_conf,
            verification_status=verif_status,
            verification_score=verif_score,
            verification_sources=verif_sources,
            needs_identified=needs,
            victim_count_estimated=victim_count,
            status="REPORTED",
            is_sos=is_sos
        )


# Global singleton instance
nlp_engine = NLPIntelligenceEngine()
