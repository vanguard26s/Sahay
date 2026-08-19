"""
Automated Situational Report (SitRep) and Command Analytics Generation Service.
"""
from typing import List, Dict, Any
from datetime import datetime, timezone
from collections import Counter

from backend.models import DisasterIncident, ResponseUnit, SitRepSummary


class SitRepService:
    """Compiles operational crisis metrics and generates executive briefings."""

    def generate_sitrep_summary(
        self,
        incidents: List[DisasterIncident],
        units: List[ResponseUnit]
    ) -> SitRepSummary:
        total_incidents = len(incidents)
        critical_sos = sum(1 for inc in incidents if inc.urgency_level == "P1_CRITICAL" or inc.is_sos)
        dispatched_count = sum(1 for inc in incidents if inc.status in ["DISPATCHED", "IN_PROGRESS"])
        resolved_count = sum(1 for inc in incidents if inc.status == "RESOLVED")
        
        # Estimate total affected population
        total_affected = sum(inc.victim_count_estimated for inc in incidents)

        # Disaster breakdown
        dtype_counts = Counter(inc.disaster_type for inc in incidents)

        # Zone clusters
        zone_counts = Counter(inc.location_name for inc in incidents)
        top_zones = [
            {"zone": zone, "incident_count": count, "critical_cases": sum(1 for inc in incidents if inc.location_name == zone and inc.urgency_level == "P1_CRITICAL")}
            for zone, count in zone_counts.most_common(5)
        ]

        # Resource deployment ratio
        total_units = len(units)
        active_units = sum(1 for u in units if u.status in ["DISPATCHED", "ON_SCENE"])
        dep_ratio = round(active_units / max(1, total_units), 2)

        # Executive Summary synthesis
        primary_disaster = dtype_counts.most_common(1)[0][0].upper() if dtype_counts else "GENERAL DISASTER"
        top_hotspot = top_zones[0]["zone"] if top_zones else "High-Risk Zone"

        exec_summary = (
            f"SITREP BRIEFING: Multi-source intelligence indicates an ongoing {primary_disaster} emergency "
            f"with major concentrations in {top_hotspot}. Total {total_incidents} verified ground incidents recorded, "
            f"with {critical_sos} P1 Life-Threatening SOS calls. Current fleet mobilization is at {int(dep_ratio * 100)}% capacity. "
            f"Estimated {total_affected} persons directly in danger zones."
        )

        recommended_actions = [
            f"Prioritize heavy inflatable boat and air rescue deployment to {top_hotspot}.",
            "Establish unified emergency medical triaging posts along primary arterial corridors.",
            "Coordinate with district administration to clear road blockages and restore power to hospitals.",
            "Issue emergency citizen safety advisories for low-lying and landslide-prone sectors.",
            "Replenish baby milk rations, drinking water canisters, and emergency insulin supplies."
        ]

        urgency_counts = Counter(inc.urgency_level for inc in incidents)
        mobilization_stats = {
            "total_personnel_deployed": sum(u.personnel for u in units if u.status in ["DISPATCHED", "ON_SCENE"]),
            "boats_deployed": sum(u.boats for u in units if u.status in ["DISPATCHED", "ON_SCENE"]),
            "ambulances_deployed": sum(u.ambulances for u in units if u.status in ["DISPATCHED", "ON_SCENE"]),
            "drones_airborne": sum(u.drones for u in units if u.status in ["DISPATCHED", "ON_SCENE"])
        }

        return SitRepSummary(
            generated_at=datetime.now(timezone.utc).isoformat(),
            total_incidents=total_incidents,
            critical_sos_count=critical_sos,
            dispatched_count=dispatched_count,
            resolved_count=resolved_count,
            estimated_affected_population=total_affected,
            top_affected_zones=top_zones,
            resource_deployment_ratio=dep_ratio,
            disaster_breakdown=dict(dtype_counts),
            urgency_breakdown=dict(urgency_counts),
            resource_mobilization=mobilization_stats,
            executive_summary=exec_summary,
            recommended_actions=recommended_actions
        )

    def generate_html_report(
        self,
        summary: SitRepSummary,
        incidents: List[DisasterIncident],
        units: List[ResponseUnit]
    ) -> str:
        """Render a printable, high-aesthetic executive SitRep document in HTML."""
        rows = ""
        for inc in incidents[:15]:
            badge_color = "#ef4444" if inc.urgency_level == "P1_CRITICAL" else "#f59e0b" if inc.urgency_level == "P2_HIGH" else "#3b82f6"
            status_color = "#10b981" if inc.status == "RESOLVED" else "#6366f1" if inc.status == "DISPATCHED" else "#94a3b8"
            rows += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #1e293b;"><b>{inc.id}</b></td>
                <td style="padding: 10px; border-bottom: 1px solid #1e293b;"><span style="background: {badge_color}22; color: {badge_color}; padding: 3px 8px; border-radius: 4px; font-weight: bold;">{inc.urgency_level}</span></td>
                <td style="padding: 10px; border-bottom: 1px solid #1e293b;">{inc.location_name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #1e293b;">{inc.disaster_type.upper()}</td>
                <td style="padding: 10px; border-bottom: 1px solid #1e293b; max-width: 320px; font-size: 13px;">{inc.raw_text[:140]}...</td>
                <td style="padding: 10px; border-bottom: 1px solid #1e293b;"><span style="color: {status_color}; font-weight: bold;">{inc.status}</span></td>
                <td style="padding: 10px; border-bottom: 1px solid #1e293b;">{inc.assigned_unit_name or 'Unassigned'}</td>
            </tr>
            """

        actions_html = "".join([f"<li style='margin-bottom: 8px; color: #e2e8f0;'>{act}</li>" for act in summary.recommended_actions])

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Official Disaster SitRep Briefing - {summary.generated_at}</title>
    <style>
        body {{ font-family: 'Segoe UI', Roboto, Helvetica, sans-serif; background: #0b0f19; color: #f8fafc; margin: 0; padding: 40px; }}
        .header {{ border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }}
        .badge {{ background: #ef4444; color: white; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; }}
        .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }}
        .card {{ background: #131b2e; border: 1px solid #1e293b; padding: 20px; border-radius: 10px; }}
        .card h3 {{ margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; }}
        .card .val {{ font-size: 28px; font-weight: bold; margin-top: 8px; color: #38bdf8; }}
        .exec-box {{ background: #1e1b4b; border-left: 4px solid #818cf8; padding: 18px; border-radius: 6px; margin-bottom: 30px; line-height: 1.6; }}
        table {{ width: 100%; border-collapse: collapse; background: #131b2e; border-radius: 8px; overflow: hidden; font-size: 14px; }}
        th {{ background: #1e293b; color: #94a3b8; text-align: left; padding: 12px 10px; font-size: 12px; text-transform: uppercase; }}
        .print-btn {{ background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }}
        @media print {{
            .print-btn {{ display: none; }}
            body {{ background: white; color: black; padding: 0; }}
            .card, table, .exec-box {{ background: #f8fafc; color: black; border-color: #cbd5e1; }}
            th {{ background: #e2e8f0; color: black; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 style="margin: 0; font-size: 24px; color: #ffffff;">NATIONAL DISASTER SITUATION REPORT (SITREP)</h1>
            <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">Unified Multi-Source Crisis Intelligence & Response Coordination Center</p>
        </div>
        <div>
            <span class="badge">CONFIDENTIAL / OPERATIONAL</span>
            <div style="margin-top: 10px; text-align: right;">
                <button class="print-btn" onclick="window.print()">Print / Export PDF</button>
            </div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h3>Total Ground Incidents</h3>
            <div class="val">{summary.total_incidents}</div>
        </div>
        <div class="card">
            <h3>Critical P1 SOS Cases</h3>
            <div class="val" style="color: #ef4444;">{summary.critical_sos_count}</div>
        </div>
        <div class="card">
            <h3>Active Responders Dispatched</h3>
            <div class="val" style="color: #10b981;">{summary.dispatched_count}</div>
        </div>
        <div class="card">
            <h3>Est. Affected Population</h3>
            <div class="val" style="color: #f59e0b;">{summary.estimated_affected_population}</div>
        </div>
    </div>

    <div class="exec-box">
        <h3 style="margin-top: 0; color: #c7d2fe; font-size: 16px;">EXECUTIVE CRISIS BRIEFING</h3>
        <p style="margin-bottom: 0; color: #e2e8f0;">{summary.executive_summary}</p>
    </div>

    <div style="background: #131b2e; border: 1px solid #1e293b; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="margin-top: 0; color: #38bdf8; font-size: 15px; text-transform: uppercase;">Command Action Directives (Next 6 Hours)</h3>
        <ol style="margin-bottom: 0; padding-left: 20px;">
            {actions_html}
        </ol>
    </div>

    <h3 style="color: #f8fafc; font-size: 16px; margin-bottom: 12px; text-transform: uppercase;">Active Incident Log (Top Priority Cases)</h3>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Priority</th>
                <th>Location</th>
                <th>Disaster</th>
                <th>Ground Report</th>
                <th>Status</th>
                <th>Assigned Unit</th>
            </tr>
        </thead>
        <tbody>
            {rows}
        </tbody>
    </table>

    <div style="margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px; font-size: 12px; color: #64748b; display: flex; justify-content: space-between;">
        <span>Generated by ResQ-IQ Autonomous Intelligence Platform</span>
        <span>Timestamp: {summary.generated_at}</span>
    </div>
</body>
</html>"""


# Global singleton instance
sitrep_service = SitRepService()
