export type DisasterType =
  | "FLOOD"
  | "FIRE"
  | "CYCLONE"
  | "EARTHQUAKE"
  | "LANDSLIDE"
  | "DROUGHT"
  | "INDUSTRIAL"
  | "EPIDEMIC";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IncidentStatus =
  | "REPORTED"
  | "VERIFIED"
  | "EN_ROUTE"
  | "ON_SCENE"
  | "RESOLVED"
  | "FALSE_ALARM";

export type SourceType = "TWITTER" | "NEWS" | "CITIZEN" | "GOVT_API" | "IOT";

export interface Source {
  id: string;
  type: SourceType;
  content: string;
  author?: string;
  outlet?: string;
  credibility: number;
  minutesAgo: number;
}

export interface Incident {
  id: string;
  title: string;
  type: DisasterType;
  severity: SeverityLevel;
  status: IncidentStatus;
  confidence: number;
  sources: Source[];
  location: {
    lat: number;
    lng: number;
    address: string;
    district: string;
    state: string;
  };
  summary: string;
  minutesAgo: number;
  affectedPopulation: number;
  resourcesDeployed: string[];
}

export type ResourceType =
  | "BOAT"
  | "AMBULANCE"
  | "FIRE_TRUCK"
  | "RESCUE_VEHICLE"
  | "DRONE"
  | "HELICOPTER"
  | "PERSONNEL";

export type ResourceStatus = "AVAILABLE" | "EN_ROUTE" | "ON_SCENE" | "OFFLINE" | "MAINTENANCE";

export type Agency = "NDRF" | "SDRF" | "POLICE" | "FIRE" | "MEDICAL";

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  agency: Agency;
  base: string;
  capacity: number;
  distanceKm: number;
  etaMinutes: number;
  deployedTo?: string;
  contact: string;
}

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  icon: string;
  source?: SourceType;
  confidence?: number;
}
