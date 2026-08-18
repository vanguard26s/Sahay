/**
 * SAHAY Backend API Client & WebSocket Connector
 * Bridges frontend React components to the FastAPI backend.
 */

const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000";

export interface ApiIncident {
  id: string;
  source: string;
  author: string;
  raw_text: string;
  cleaned_text: string;
  disaster_type: string;
  urgency_level: "P1_CRITICAL" | "P2_HIGH" | "P3_MEDIUM" | "P4_LOW";
  urgency_score: number;
  location_name: string;
  latitude: number;
  longitude: number;
  affected_people_count: number;
  needs_identified: string[];
  verification_score: number;
  verification_status: string;
  status: "REPORTED" | "IN_REVIEW" | "DISPATCHED" | "RESPONDING" | "RESOLVED";
  timestamp: string;
}

export interface ApiUnit {
  unit_id: string;
  name: string;
  unit_type: string;
  status: "AVAILABLE" | "DISPATCHED" | "ON_SCENE" | "RETURNING";
  base_location: string;
  lat: number;
  lng: number;
  personnel: number;
  boats: number;
  ambulances: number;
  drones: number;
}

export interface SitRepData {
  report_id: string;
  timestamp: string;
  active_scenario: string;
  total_incidents: number;
  critical_sos_count: number;
  dispatched_count: number;
  resolved_count: number;
  executive_summary: string;
  disaster_breakdown: Record<string, number>;
  urgency_breakdown: Record<string, number>;
  top_affected_zones: Array<{ zone: string; incident_count: number; critical_cases: number }>;
}

export const sahayApi = {
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return res.json();
  },

  async getIncidents(limit = 100): Promise<ApiIncident[]> {
    const res = await fetch(`${API_BASE_URL}/api/incidents?limit=${limit}`);
    return res.json();
  },

  async getUnits(): Promise<ApiUnit[]> {
    const res = await fetch(`${API_BASE_URL}/api/units`);
    return res.json();
  },

  async getSitRep(): Promise<SitRepData> {
    const res = await fetch(`${API_BASE_URL}/api/sitrep`);
    return res.json();
  },

  async submitSos(data: {
    name: string;
    phone: string;
    disaster_type: string;
    location_name: string;
    description: string;
    people_count: number;
    needs: string[];
  }) {
    const res = await fetch(`${API_BASE_URL}/api/sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, urgency: "P1_CRITICAL" }),
    });
    return res.json();
  },

  async dispatchUnit(incidentId: string, unitId: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/api/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incident_id: incidentId, unit_id: unitId, notes }),
    });
    return res.json();
  },

  async resolveIncident(incidentId: string) {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${incidentId}/resolve`, {
      method: "POST",
    });
    return res.json();
  },

  async getSafeRoute(startLat: number, startLng: number, destLat: number, destLng: number) {
    const res = await fetch(`${API_BASE_URL}/api/routing/safe-path`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_lat: startLat, start_lng: startLng, dest_lat: destLat, dest_lng: destLng }),
    });
    return res.json();
  },

  async sendBroadcastAlert(zone: string, message: string, channel = "SMS_AND_WHATSAPP") {
    const res = await fetch(`${API_BASE_URL}/api/alerts/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_zone: zone,
        message: message,
        target_channel: channel,
        severity: "CRITICAL_EVACUATION",
        recipient_count_simulated: 4500,
      }),
    });
    return res.json();
  },

  createWebSocket(onMessage: (msg: { event: string; data: any }) => void): WebSocket {
    const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = typeof window !== "undefined" ? window.location.host : "127.0.0.1:8000";
    const ws = new WebSocket(`${protocol}//${host}/ws/live-stream`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };
    return ws;
  },
};
