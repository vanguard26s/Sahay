import type {
  DemoStep,
  DisasterType,
  Incident,
  IncidentStatus,
  Resource,
  SeverityLevel,
  Source,
  SourceType,
} from "./types";

const NEWS_OUTLETS = ["Times of India", "NDTV", "The Hindu", "Indian Express", "ANI"];
const GOVT_BODIES = ["IMD", "INCOIS", "NDMA", "CWC", "NHAI"];

function makeSources(seed: number, count: number, type: DisasterType, place: string): Source[] {
  const pool: Array<Omit<Source, "id">> = [
    {
      type: "GOVT_API",
      content: `${GOVT_BODIES[seed % GOVT_BODIES.length]} bulletin: ${type.toLowerCase()} warning issued for ${place} and adjoining areas.`,
      outlet: GOVT_BODIES[seed % GOVT_BODIES.length],
      credibility: 100,
      minutesAgo: 42 + seed,
    },
    {
      type: "NEWS",
      content: `${NEWS_OUTLETS[seed % NEWS_OUTLETS.length]} reports escalating ${type.toLowerCase()} situation in ${place}; local administration on alert.`,
      outlet: NEWS_OUTLETS[seed % NEWS_OUTLETS.length],
      credibility: 80 + (seed % 10),
      minutesAgo: 34 + seed,
    },
    {
      type: "TWITTER",
      content: `Situation worsening near ${place}. People stranded, need help urgently. #${type.toLowerCase()}${place.replace(/[^A-Za-z]/g, "")}`,
      author: `@citizen_${1000 + seed}`,
      credibility: 55 + (seed % 25),
      minutesAgo: 25 + seed,
    },
    {
      type: "CITIZEN",
      content: `Geo-tagged report with 3 photos: water/debris blocking main approach road at ${place}.`,
      author: `Verified citizen #${400 + seed}`,
      credibility: 70 + (seed % 15),
      minutesAgo: 18 + seed,
    },
    {
      type: "IOT",
      content: `Sensor array ${type.slice(0, 2)}-${10 + seed} reports threshold breach at ${place}: CRITICAL band.`,
      outlet: `Sensor ${type.slice(0, 2)}-${10 + seed}`,
      credibility: 90 + (seed % 6),
      minutesAgo: 11 + seed,
    },
  ];
  return pool.slice(0, count).map((s, i) => ({ ...s, id: `SRC-${seed}-${i + 1}` }));
}

type Row = [
  DisasterType,
  SeverityLevel,
  IncidentStatus,
  string,
  string,
  string,
  number,
  number,
  number,
  number,
];

// type, severity, status, address, district, state, lat, lng, confidence, affected
const ROWS: Row[] = [
  ["FLOOD", "CRITICAL", "ON_SCENE", "Sector 4 Bridge", "Ahmedabad", "Gujarat", 23.03, 72.58, 94, 12400],
  ["CYCLONE", "CRITICAL", "EN_ROUTE", "Coastal Belt, Dwarka", "Devbhumi Dwarka", "Gujarat", 22.24, 68.97, 92, 48000],
  ["EARTHQUAKE", "CRITICAL", "VERIFIED", "Bhachau Tehsil", "Kutch", "Gujarat", 23.29, 70.34, 88, 31000],
  ["FIRE", "CRITICAL", "ON_SCENE", "Kurla Industrial Estate", "Mumbai", "Maharashtra", 19.07, 72.88, 91, 2600],
  ["EPIDEMIC", "CRITICAL", "VERIFIED", "Ward 12 Health Block", "Patna", "Bihar", 25.59, 85.13, 86, 8700],
  ["FLOOD", "HIGH", "EN_ROUTE", "Ganga Ghat Road", "Varanasi", "Uttar Pradesh", 25.31, 82.97, 81, 9200],
  ["LANDSLIDE", "HIGH", "ON_SCENE", "NH-5 Km 42", "Shimla", "Himachal Pradesh", 31.1, 77.17, 79, 1400],
  ["FIRE", "HIGH", "VERIFIED", "Chandni Chowk Market", "Delhi", "Delhi", 28.65, 77.23, 77, 3300],
  ["CYCLONE", "HIGH", "REPORTED", "Marina Stretch", "Chennai", "Tamil Nadu", 13.05, 80.28, 74, 21000],
  ["FLOOD", "HIGH", "VERIFIED", "Kuttanad Low Lands", "Alappuzha", "Kerala", 9.49, 76.33, 83, 15600],
  ["INDUSTRIAL", "HIGH", "EN_ROUTE", "Chemical Park Unit 9", "Vadodara", "Gujarat", 22.31, 73.18, 76, 1800],
  ["EARTHQUAKE", "HIGH", "REPORTED", "Rohini Fault Line", "Delhi", "Delhi", 28.74, 77.07, 71, 5400],
  ["DROUGHT", "HIGH", "VERIFIED", "Marathwada Belt", "Beed", "Maharashtra", 18.99, 75.76, 73, 62000],
  ["FLOOD", "MEDIUM", "VERIFIED", "Hooghly Embankment", "Howrah", "West Bengal", 22.59, 88.31, 66, 7100],
  ["FIRE", "MEDIUM", "RESOLVED", "Peenya Godown 4", "Bengaluru", "Karnataka", 13.03, 77.52, 64, 900],
  ["LANDSLIDE", "MEDIUM", "REPORTED", "Ghat Section Km 18", "Kodagu", "Karnataka", 12.42, 75.74, 61, 700],
  ["DROUGHT", "MEDIUM", "VERIFIED", "Barmer Rural Cluster", "Barmer", "Rajasthan", 25.75, 71.39, 63, 41000],
  ["FLOOD", "MEDIUM", "EN_ROUTE", "Kosi Left Bank", "Supaul", "Bihar", 26.12, 86.6, 68, 18800],
  ["EPIDEMIC", "MEDIUM", "VERIFIED", "Zone 3 PHC Cluster", "Kolkata", "West Bengal", 22.57, 88.36, 62, 4200],
  ["CYCLONE", "MEDIUM", "REPORTED", "Kanyakumari Coast", "Kanyakumari", "Tamil Nadu", 8.09, 77.54, 59, 11200],
  ["INDUSTRIAL", "MEDIUM", "RESOLVED", "Ankleshwar GIDC", "Bharuch", "Gujarat", 21.62, 73.0, 60, 1100],
  ["EARTHQUAKE", "MEDIUM", "RESOLVED", "Chamoli Hill Belt", "Chamoli", "Uttarakhand", 30.4, 79.32, 57, 2100],
  ["FLOOD", "MEDIUM", "REPORTED", "Yamuna Floodplain", "Delhi", "Delhi", 28.63, 77.25, 65, 13300],
  ["FLOOD", "LOW", "RESOLVED", "Adyar Creek", "Chennai", "Tamil Nadu", 13.01, 80.25, 44, 800],
  ["FIRE", "LOW", "RESOLVED", "Jaipur Textile Lane", "Jaipur", "Rajasthan", 26.91, 75.79, 41, 300],
  ["LANDSLIDE", "LOW", "REPORTED", "Kalimpong Slope", "Kalimpong", "West Bengal", 27.06, 88.47, 38, 250],
  ["DROUGHT", "LOW", "VERIFIED", "Vidarbha Tail End", "Yavatmal", "Maharashtra", 20.39, 78.13, 46, 9400],
  ["EPIDEMIC", "LOW", "RESOLVED", "Kochi Port Ward", "Ernakulam", "Kerala", 9.97, 76.28, 40, 600],
  ["FLOOD", "LOW", "RESOLVED", "Mithi Nallah", "Mumbai", "Maharashtra", 19.11, 72.87, 43, 1200],
  ["CYCLONE", "LOW", "RESOLVED", "Puri Shoreline", "Puri", "Odisha", 19.81, 85.83, 39, 2400],
  ["INDUSTRIAL", "LOW", "FALSE_ALARM", "Noida Phase 2", "Gautam Buddh Nagar", "Uttar Pradesh", 28.57, 77.33, 22, 0],
  ["FIRE", "LOW", "FALSE_ALARM", "Hebbal Warehouse", "Bengaluru", "Karnataka", 13.04, 77.59, 19, 0],
];

const TITLES: Record<DisasterType, string> = {
  FLOOD: "Rapid urban flooding",
  FIRE: "Structural fire outbreak",
  CYCLONE: "Cyclonic landfall threat",
  EARTHQUAKE: "Seismic tremor damage",
  LANDSLIDE: "Slope collapse blocking access",
  DROUGHT: "Severe water stress",
  INDUSTRIAL: "Chemical leak / industrial hazard",
  EPIDEMIC: "Disease outbreak cluster",
};

export const INCIDENTS: Incident[] = ROWS.map((row, i) => {
  const [type, severity, status, address, district, state, lat, lng, confidence, affected] = row;
  const sourceCount = severity === "CRITICAL" ? 5 : severity === "HIGH" ? 4 : severity === "MEDIUM" ? 3 : 2;
  return {
    id: `INC-${104 + i}`,
    title: `${TITLES[type]} — ${district}`,
    type,
    severity,
    status,
    confidence,
    sources: makeSources(i + 1, sourceCount, type, `${address}, ${district}`),
    location: { lat, lng, address, district, state },
    summary: `AI summary: ${sourceCount} independent sources corroborate a ${severity.toLowerCase()} ${type.toLowerCase()} event at ${address}, ${district} (${state}). Estimated ${affected.toLocaleString("en-IN")} people in the impact envelope. Access routes partially degraded; nearest response units notified.`,
    minutesAgo: 2 + i * 7,
    affectedPopulation: affected,
    resourcesDeployed:
      status === "EN_ROUTE" || status === "ON_SCENE"
        ? [`RES-${(i % 15) + 1}`, `RES-${((i + 4) % 15) + 1}`]
        : [],
  };
});

export const RESOURCES: Resource[] = [
  ["RES-1", "Rescue Boat Boat-07", "BOAT", "AVAILABLE", "NDRF", "Ahmedabad Base", 12, 1.2, 8],
  ["RES-2", "Rescue Boat Boat-12", "BOAT", "EN_ROUTE", "NDRF", "Gandhinagar Depot", 12, 2.1, 10],
  ["RES-3", "Rescue Boat Boat-19", "BOAT", "AVAILABLE", "SDRF", "Surat Base", 10, 6.4, 18],
  ["RES-4", "Rescue Boat Boat-23", "BOAT", "MAINTENANCE", "SDRF", "Vadodara Yard", 10, 9.8, 0],
  ["RES-5", "Ambulance AMB-04", "AMBULANCE", "AVAILABLE", "MEDICAL", "Civil Hospital, Ahmedabad", 4, 1.8, 6],
  ["RES-6", "Ambulance AMB-11", "AMBULANCE", "ON_SCENE", "MEDICAL", "Kurla Health Post", 4, 0.4, 2],
  ["RES-7", "Ambulance AMB-15", "AMBULANCE", "AVAILABLE", "MEDICAL", "Patna Medical College", 4, 3.2, 11],
  ["RES-8", "Ambulance AMB-21", "AMBULANCE", "OFFLINE", "MEDICAL", "Shimla District HQ", 4, 14.0, 0],
  ["RES-9", "Fire Tender FT-03", "FIRE_TRUCK", "ON_SCENE", "FIRE", "Kurla Fire Station", 8, 0.6, 3],
  ["RES-10", "Fire Tender FT-08", "FIRE_TRUCK", "AVAILABLE", "FIRE", "Chandni Chowk Station", 8, 2.4, 9],
  ["RES-11", "Fire Tender FT-14", "FIRE_TRUCK", "AVAILABLE", "FIRE", "Peenya Station", 8, 5.1, 14],
  ["RES-12", "Rescue Vehicle RV-05", "RESCUE_VEHICLE", "EN_ROUTE", "NDRF", "Kutch Camp", 16, 7.7, 21],
  ["RES-13", "Rescue Vehicle RV-09", "RESCUE_VEHICLE", "AVAILABLE", "SDRF", "Shimla Camp", 16, 4.3, 16],
  ["RES-14", "Recon Drone DR-02", "DRONE", "AVAILABLE", "NDRF", "Ahmedabad Base", 0, 1.0, 4],
  ["RES-15", "Recon Drone DR-06", "DRONE", "ON_SCENE", "SDRF", "Dwarka Coast Post", 0, 0.2, 1],
  ["RES-16", "Helicopter HEL-01", "HELICOPTER", "AVAILABLE", "NDRF", "Vadodara Airbase", 14, 22.5, 19],
  ["RES-17", "NDRF Team Alpha (24)", "PERSONNEL", "ON_SCENE", "NDRF", "Sector 4, Ahmedabad", 24, 0.3, 2],
  ["RES-18", "Police Unit Bravo (18)", "PERSONNEL", "AVAILABLE", "POLICE", "Zone 3 Control Room", 18, 2.9, 8],
].map(
  ([id, name, type, status, agency, base, capacity, distanceKm, etaMinutes]) =>
    ({
      id,
      name,
      type,
      status,
      agency,
      base,
      capacity,
      distanceKm,
      etaMinutes,
      deployedTo: status === "EN_ROUTE" || status === "ON_SCENE" ? "INC-104" : undefined,
      contact: `+91 98${String(id).replace(/\D/g, "").padStart(3, "0")}0 4${String(id).replace(/\D/g, "").padStart(4, "0")}`,
    }) as Resource,
);

export const SOURCE_FEED: Array<Source & { matchedIncident: string; matchConfidence: number }> =
  INCIDENTS.flatMap((inc) =>
    inc.sources.map((s) => ({
      ...s,
      matchedIncident: inc.id,
      matchConfidence: inc.confidence,
    })),
  ).sort((a, b) => a.minutesAgo - b.minutesAgo);

export const DEMO_STEPS: DemoStep[] = [
  { step: 1, title: "Extreme Rainfall Detected", description: "IMD API detects 120mm/hr rainfall near Sector 4, Ahmedabad.", icon: "🌧️", source: "GOVT_API", confidence: 38 },
  { step: 2, title: "Citizen Report Received", description: "Geo-tagged report of rising water at the Sector 4 bridge, with photos.", icon: "📱", source: "CITIZEN", confidence: 56 },
  { step: 3, title: "IoT Sensor Confirms", description: "Water level sensor WL-07 reports CRITICAL band breach.", icon: "📡", source: "IOT", confidence: 74 },
  { step: 4, title: "AI Correlates Sources", description: "Cross-source correlation engine links 4 signals to one event.", icon: "🧠", confidence: 94 },
  { step: 5, title: "Critical Incident Created", description: "System auto-creates flood incident INC-104 at CRITICAL severity.", icon: "📋", confidence: 94 },
  { step: 6, title: "Incident on Live Map", description: "Critical marker plotted at Sector 4 with impact envelope.", icon: "🗺️", confidence: 94 },
  { step: 7, title: "AI Recommends Resources", description: "2 rescue boats + 1 ambulance recommended from nearest bases.", icon: "🚤", confidence: 94 },
  { step: 8, title: "Officer Confirms Dispatch", description: "Dispatch officer approves the recommendation in one click.", icon: "✅", confidence: 96 },
  { step: 9, title: "Resources En-Route", description: "Boat-07 ETA 8 min, Boat-12 ETA 10 min, AMB-04 ETA 6 min.", icon: "🚁", confidence: 97 },
  { step: 10, title: "Incident Resolved", description: "412 people evacuated. Incident closed and after-action logged.", icon: "🎯", confidence: 99 },
];

export const RESPONSE_TREND = [
  { day: "Oct 01", minutes: 14.2, target: 8 },
  { day: "Oct 05", minutes: 12.8, target: 8 },
  { day: "Oct 09", minutes: 11.4, target: 8 },
  { day: "Oct 13", minutes: 10.1, target: 8 },
  { day: "Oct 17", minutes: 9.6, target: 8 },
  { day: "Oct 21", minutes: 8.4, target: 8 },
  { day: "Oct 25", minutes: 7.9, target: 8 },
  { day: "Oct 29", minutes: 7.1, target: 8 },
];

export const SOURCE_MIX: Array<{ source: SourceType; value: number }> = [
  { source: "TWITTER", value: 45 },
  { source: "NEWS", value: 20 },
  { source: "CITIZEN", value: 15 },
  { source: "GOVT_API", value: 12 },
  { source: "IOT", value: 8 },
];

export const KEY_INSIGHTS = [
  { tone: "good", text: "85% of incidents verified within 3 minutes of first signal." },
  { tone: "bad", text: "Social media carried 40% unverified reports — tighten pre-filtering." },
  { tone: "good", text: "94% of affected population reached within 4 hours." },
  { tone: "warn", text: "Boat fleet utilisation peaked at 92% in Gujarat — capacity risk." },
];
