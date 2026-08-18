import type {
  DisasterType,
  IncidentStatus,
  ResourceStatus,
  ResourceType,
  SeverityLevel,
  SourceType,
} from "./types";

export const SEVERITY_ORDER: SeverityLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const severityToken: Record<SeverityLevel, string> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const typeToken: Record<DisasterType, string> = {
  FLOOD: "flood",
  FIRE: "fire",
  CYCLONE: "cyclone",
  EARTHQUAKE: "earthquake",
  LANDSLIDE: "landslide",
  DROUGHT: "drought",
  INDUSTRIAL: "industrial",
  EPIDEMIC: "epidemic",
};

export const sourceToken: Record<SourceType, string> = {
  TWITTER: "src-twitter",
  NEWS: "src-news",
  CITIZEN: "src-citizen",
  GOVT_API: "src-govt",
  IOT: "src-iot",
};

export const sourceLabel: Record<SourceType, string> = {
  TWITTER: "Social",
  NEWS: "News",
  CITIZEN: "Citizen",
  GOVT_API: "Govt API",
  IOT: "IoT Sensor",
};

export const typeIcon: Record<DisasterType, string> = {
  FLOOD: "🌊",
  FIRE: "🔥",
  CYCLONE: "🌀",
  EARTHQUAKE: "🏚️",
  LANDSLIDE: "⛰️",
  DROUGHT: "☀️",
  INDUSTRIAL: "🏭",
  EPIDEMIC: "🦠",
};

export const sourceIcon: Record<SourceType, string> = {
  TWITTER: "🐦",
  NEWS: "📰",
  CITIZEN: "👤",
  GOVT_API: "🏛️",
  IOT: "📡",
};

export const resourceIcon: Record<ResourceType, string> = {
  BOAT: "⛵",
  AMBULANCE: "🚑",
  FIRE_TRUCK: "🚒",
  RESCUE_VEHICLE: "🚙",
  DRONE: "🛸",
  HELICOPTER: "🚁",
  PERSONNEL: "🧑‍🚒",
};

export const statusLabel: Record<IncidentStatus, string> = {
  REPORTED: "Reported",
  VERIFIED: "Verified",
  EN_ROUTE: "En-route",
  ON_SCENE: "On scene",
  RESOLVED: "Resolved",
  FALSE_ALARM: "False alarm",
};

export const resourceStatusLabel: Record<ResourceStatus, string> = {
  AVAILABLE: "Available",
  EN_ROUTE: "En-route",
  ON_SCENE: "On scene",
  OFFLINE: "Offline",
  MAINTENANCE: "Maintenance",
};

export function timeAgo(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

/** Projects lat/lng of India onto a 0-100 percentage box for the tactical map. */
export function projectIndia(lat: number, lng: number) {
  const x = ((lng - 67) / (98 - 67)) * 100;
  const y = ((37 - lat) / (37 - 7)) * 100;
  return { x: Math.min(97, Math.max(3, x)), y: Math.min(96, Math.max(4, y)) };
}
