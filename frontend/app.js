/**
 * SAHAY: Gujarat Multi-Source Disaster Intelligence & Emergency Command Center
 * Unified Full-Stack Application Logic
 */

// Application State Store
const state = {
    currentView: "gisView",
    incidents: [],
    units: [],
    activeScenario: "vadodara_vishwamitri_flood",
    filters: {
        urgency: "ALL",
        disasterType: "ALL",
        source: "ALL",
        search: ""
    },
    audioEnabled: true,
    showHeatmap: true,
    showUnits: true,
    map: null,
    incidentLayer: null,
    unitLayer: null,
    heatLayer: null,
    routeLayer: null,
    ws: null,
    selectedIncidentForDispatch: null,
    charts: {
        disasterChart: null,
        urgencyChart: null
    }
};

// Gujarat Scenario Coordinates Map
const SCENARIO_COORDS = {
    "vadodara_vishwamitri_flood": { lat: 22.3072, lng: 73.1812, zoom: 12, title: "Vadodara Vishwamitri Floods" },
    "kutch_biparjoy_cyclone": { lat: 23.2420, lng: 69.6669, zoom: 10, title: "Cyclone Biparjoy (Kutch & Mandvi)" },
    "surat_tapi_inundation": { lat: 21.1702, lng: 72.8311, zoom: 12, title: "Surat Tapi River Inundation" },
    "kutch_bhuj_earthquake": { lat: 23.2420, lng: 69.6669, zoom: 11, title: "Kutch Intraplate Seismic Event M6.3" }
};

// --- Web Audio API Emergency Siren ---
let audioCtx = null;
function playEmergencyAlertSound() {
    if (!state.audioEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
        console.warn("Audio error:", e);
    }
}

// --- Map Initialization ---
function initMap() {
    const defaultCoords = SCENARIO_COORDS[state.activeScenario];
    const mapEl = document.getElementById('gisMap');
    if (!mapEl || state.map) return;

    state.map = L.map('gisMap', { zoomControl: false }).setView([defaultCoords.lat, defaultCoords.lng], defaultCoords.zoom);
    L.control.zoom({ position: 'topright' }).addTo(state.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(state.map);

    state.incidentLayer = L.layerGroup().addTo(state.map);
    state.unitLayer = L.layerGroup().addTo(state.map);
    state.routeLayer = L.layerGroup().addTo(state.map);
}

// --- Safe Evacuation Route Engine ---
window.computeAndDrawSafeRoute = async function() {
    if (!state.map) return;
    const coords = SCENARIO_COORDS[state.activeScenario];
    if (!coords) return;

    const originLat = coords.lat - 0.025;
    const originLng = coords.lng - 0.020;
    const destLat = coords.lat + 0.035;
    const destLng = coords.lng + 0.030;

    const btn = document.getElementById("btnComputeSafeRoute");
    if (btn) btn.innerText = "⏳ Computing...";

    try {
        const res = await fetch("/api/routing/safe-path", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                start_lat: originLat,
                start_lng: originLng,
                dest_lat: destLat,
                dest_lng: destLng
            })
        });

        if (res.ok) {
            const data = await res.json();
            state.routeLayer.clearLayers();

            const polyline = L.polyline(data.waypoints, {
                color: '#10b981',
                weight: 5,
                opacity: 0.85,
                dashArray: '10, 8',
                lineJoin: 'round'
            }).addTo(state.routeLayer);

            const startIcon = L.divIcon({
                html: '<div class="custom-pin pin-p1" style="width: 26px; height: 26px; font-size: 11px;">⚠️ SOS</div>',
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });
            const endIcon = L.divIcon({
                html: '<div class="custom-pin pin-unit" style="width: 26px; height: 26px; font-size: 11px;">🏕️ Safe</div>',
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });

            L.marker([originLat, originLng], { icon: startIcon }).bindPopup("<b>Stranded Incident Origin</b>").addTo(state.routeLayer);
            L.marker([destLat, destLng], { icon: endIcon }).bindPopup("<b>Secure Relief Sanctuary Camp</b>").addTo(state.routeLayer);

            state.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

            if (btn) {
                btn.innerText = `🛣️ Safe Route (${data.total_distance_km}km, ~${data.estimated_travel_time_mins}m)`;
                setTimeout(() => { btn.innerText = "🛣️ Safe Evac Route"; }, 5000);
            }
        }
    } catch (e) {
        console.error("Routing error:", e);
        if (btn) btn.innerText = "Route Error";
    }
};

// --- Map Markers ---
function updateMapMarkers() {
    if (!state.map) return;
    state.incidentLayer.clearLayers();
    const heatPoints = [];

    state.incidents.forEach(inc => {
        if (!inc.latitude || !inc.longitude) return;
        
        heatPoints.push([inc.latitude, inc.longitude, inc.urgency_level === "P1_CRITICAL" ? 1.0 : 0.6]);

        let pinClass = "pin-p3";
        let label = "ℹ️";
        if (inc.urgency_level === "P1_CRITICAL") {
            pinClass = "pin-p1";
            label = "🚨";
        } else if (inc.urgency_level === "P2_HIGH") {
            pinClass = "pin-p2";
            label = "⚠️";
        }

        const iconHtml = `<div class="custom-pin ${pinClass}" style="width: 28px; height: 28px; font-size: 13px;">${label}</div>`;
        const customIcon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; color: #0f172a; max-width: 240px;">
                <div style="font-weight: bold; font-size: 13px; color: ${inc.urgency_level === 'P1_CRITICAL' ? '#dc2626' : '#0369a1'};">
                    ${inc.urgency_level}: ${inc.location_name}
                </div>
                <div style="font-size: 11px; margin: 4px 0 6px 0; color: #475569;">
                    ${inc.raw_text.substring(0, 120)}...
                </div>
                <div style="font-size: 10px; margin-bottom: 8px; font-weight: 600;">
                    Status: <span style="color: ${inc.status === 'RESOLVED' ? '#059669' : '#4f46e5'}">${inc.status}</span>
                </div>
                ${inc.status !== 'RESOLVED' ? `
                    <button onclick="window.openDispatchForIncident('${inc.id}')" style="background: #0284c7; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; width: 100%; font-weight: bold;">
                        🚒 Dispatch Unit
                    </button>
                ` : ''}
            </div>
        `;
        marker.bindPopup(popupContent);
        state.incidentLayer.addLayer(marker);
    });

    if (state.heatLayer) state.map.removeLayer(state.heatLayer);
    if (state.showHeatmap && window.L.heatLayer && heatPoints.length > 0) {
        state.heatLayer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 14,
            gradient: { 0.4: '#3b82f6', 0.65: '#f59e0b', 1.0: '#ef4444' }
        }).addTo(state.map);
    }
}

function updateUnitMarkers() {
    if (!state.map) return;
    state.unitLayer.clearLayers();
    if (!state.showUnits) return;

    state.units.forEach(unit => {
        const iconHtml = `<div class="custom-pin pin-unit" style="width: 32px; height: 32px; font-size: 14px;">🚒</div>`;
        const customIcon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([unit.lat, unit.lng], { icon: customIcon });
        marker.bindPopup(`
            <div style="font-family: 'Inter', sans-serif; color: #0f172a;">
                <strong>${unit.name}</strong>
                <p style="font-size: 11px; color: #475569; margin: 2px 0 6px 0;">Base: ${unit.base_location}</p>
                <p style="font-size: 11px;">Personnel: ${unit.personnel} | Boats: ${unit.boats} | Ambulances: ${unit.ambulances}</p>
                <div style="margin-top: 6px; font-weight: bold; color: ${unit.status === 'AVAILABLE' ? '#059669' : '#dc2626'}">Status: ${unit.status}</div>
            </div>
        `);
        state.unitLayer.addLayer(marker);
    });
}

// --- Feed UI Rendering ---
function renderIncidentFeed() {
    const container = document.getElementById("incidentStream");
    const filtered = state.incidents.filter(inc => {
        if (state.filters.urgency !== "ALL" && inc.urgency_level !== state.filters.urgency) return false;
        if (state.filters.disasterType !== "ALL" && inc.disaster_type.toLowerCase() !== state.filters.disasterType.toLowerCase()) return false;
        if (state.filters.source !== "ALL" && inc.source !== state.filters.source) return false;
        if (state.filters.search) {
            const q = state.filters.search.toLowerCase();
            const matches = inc.raw_text.toLowerCase().includes(q) || 
                            inc.location_name.toLowerCase().includes(q) || 
                            (inc.author && inc.author.toLowerCase().includes(q));
            if (!matches) return false;
        }
        return true;
    });

    document.getElementById("feedCountBadge").innerText = `${filtered.length} alerts`;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>No incidents match current filter criteria.</p></div>`;
        return;
    }

    container.innerHTML = filtered.map(inc => {
        const pClass = inc.urgency_level === "P1_CRITICAL" ? "priority-p1" :
                       inc.urgency_level === "P2_HIGH" ? "priority-p2" :
                       inc.urgency_level === "P3_MEDIUM" ? "priority-p3" : "priority-p4";
        
        const uBadgeClass = inc.urgency_level === "P1_CRITICAL" ? "urgency-p1" :
                            inc.urgency_level === "P2_HIGH" ? "urgency-p2" :
                            inc.urgency_level === "P3_MEDIUM" ? "urgency-p3" : "urgency-p4";

        const sourceIcon = inc.source === "social_media_x" ? "𝕏" :
                           inc.source === "social_media_reddit" ? "🔴 Reddit" :
                           inc.source === "citizen_sos" ? "🚨 SOS" :
                           inc.source === "usgs_seismic" ? "📊 USGS" : "📡 Sensor";

        const needsHtml = inc.needs_identified.map(n => `<span class="tag-need">${n}</span>`).join("");

        return `
            <div class="incident-card ${pClass}" onclick="window.panToIncident(${inc.latitude}, ${inc.longitude})">
                <div class="incident-header">
                    <span class="badge-urgency ${uBadgeClass}">${inc.urgency_level.replace('_', ' ')}</span>
                    <span class="source-badge">${sourceIcon} ${inc.author || ''}</span>
                </div>
                <div class="incident-loc">📍 ${inc.location_name}</div>
                <div class="incident-text">${inc.raw_text}</div>
                <div class="needs-tags">${needsHtml}</div>
                <div class="incident-footer">
                    <span class="verif-stat">✓ ${inc.verification_status} (${Math.round(inc.verification_score * 100)}%)</span>
                    <div class="card-actions">
                        ${inc.status !== 'RESOLVED' ? `
                            <button class="btn-card-xs btn-card-dispatch" onclick="event.stopPropagation(); window.openDispatchForIncident('${inc.id}')">🚒 Dispatch</button>
                            <button class="btn-card-xs btn-card-resolve" onclick="event.stopPropagation(); window.resolveIncident('${inc.id}')">✓ Resolve</button>
                        ` : `<span style="font-size: 10px; color: #10b981; font-weight: bold;">RESOLVED</span>`}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// --- Units UI Rendering ---
function renderUnitsList() {
    const container = document.getElementById("unitListContainer");
    const availableCount = state.units.filter(u => u.status === "AVAILABLE").length;
    document.getElementById("unitAvailabilityStat").innerText = `${availableCount} / ${state.units.length} Available`;

    container.innerHTML = state.units.map(unit => {
        const isAvail = unit.status === "AVAILABLE";
        return `
            <div class="unit-card">
                <div class="unit-title">
                    <span>${unit.name}</span>
                    <span class="badge-status ${isAvail ? 'status-available' : 'status-dispatched'}">${unit.status}</span>
                </div>
                <div style="font-size: 11px; color: var(--accent-cyan);">Base: ${unit.base_location}</div>
                <div class="unit-caps">
                    <span>👥 ${unit.personnel} Staff</span>
                    <span>🚤 ${unit.boats} Boats</span>
                    <span>🚑 ${unit.ambulances} Med</span>
                    <span>🚁 ${unit.drones} Drones</span>
                </div>
            </div>
        `;
    }).join("");
}

// --- Full Fleet Management View ---
function renderFullFleetView() {
    const container = document.getElementById("fullFleetGrid");
    if (!container) return;
    const filter = document.getElementById("fleetStatusFilter") ? document.getElementById("fleetStatusFilter").value : "ALL";

    const filtered = state.units.filter(u => filter === "ALL" || u.status === filter);

    container.innerHTML = filtered.map(unit => {
        const isAvail = unit.status === "AVAILABLE";
        return `
            <div class="fleet-item-card">
                <div class="fleet-item-header">
                    <div>
                        <div class="fleet-item-title">${unit.name}</div>
                        <div class="fleet-item-base">📍 Base Hub: ${unit.base_location}</div>
                    </div>
                    <span class="badge-status ${isAvail ? 'status-available' : 'status-dispatched'}">${unit.status}</span>
                </div>
                <div class="fleet-specs-grid">
                    <div class="spec-box">👥 Personnel: <strong>${unit.personnel} Responders</strong></div>
                    <div class="spec-box">🚤 Rescue Boats: <strong>${unit.boats} IRBs</strong></div>
                    <div class="spec-box">🚑 Ambulances: <strong>${unit.ambulances} Advanced</strong></div>
                    <div class="spec-box">🚁 Thermal Drones: <strong>${unit.drones} Units</strong></div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 6px;">
                    <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="window.panToIncident(${unit.lat}, ${unit.lng})">🎯 View on Map</button>
                    <button class="btn ${isAvail ? 'btn-primary' : 'btn-danger'} btn-sm" style="flex: 1;" onclick="window.toggleUnitStatus('${unit.unit_id}')">
                        ${isAvail ? 'Deploy Unit' : 'Recall to Base'}
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

window.toggleUnitStatus = async function(unitId) {
    const unit = state.units.find(u => u.unit_id === unitId);
    if (!unit) return;
    const nextStatus = unit.status === "AVAILABLE" ? "DISPATCHED" : "AVAILABLE";
    try {
        await fetch("/api/responders/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                unit_id: unitId,
                lat: unit.lat,
                lng: unit.lng,
                status: nextStatus,
                notes: `Status toggled from command fleet view to ${nextStatus}`
            })
        });
        fetchInitialData();
    } catch (e) {
        console.error("Status toggle error:", e);
    }
};

// --- Segregated Triage Kanban Board ---
function renderTriageBoard() {
    const p1Container = document.getElementById("triageP1Container");
    const p2Container = document.getElementById("triageP2Container");
    const p3Container = document.getElementById("triageP3Container");
    const resContainer = document.getElementById("triageResolvedContainer");
    if (!p1Container) return;

    const p1s = state.incidents.filter(i => i.urgency_level === "P1_CRITICAL" && i.status !== "RESOLVED");
    const p2s = state.incidents.filter(i => i.urgency_level === "P2_HIGH" && i.status !== "RESOLVED");
    const p3s = state.incidents.filter(i => (i.urgency_level === "P3_MEDIUM" || i.urgency_level === "P4_LOW") && i.status !== "RESOLVED");
    const resolved = state.incidents.filter(i => i.status === "RESOLVED");

    document.getElementById("countP1Col").innerText = p1s.length;
    document.getElementById("countP2Col").innerText = p2s.length;
    document.getElementById("countP3Col").innerText = p3s.length;
    document.getElementById("countResolvedCol").innerText = resolved.length;

    const cardTpl = (inc, borderClass) => `
        <div class="incident-card ${borderClass}" style="background: var(--bg-surface-elevated);">
            <div class="incident-header">
                <span style="font-family: var(--font-mono); font-size: 10px; font-weight: bold;">${inc.id}</span>
                <span class="source-badge">📍 ${inc.location_name}</span>
            </div>
            <div style="font-size: 11px; line-height: 1.4; color: #e2e8f0;">${inc.raw_text.substring(0, 110)}...</div>
            <div class="needs-tags">${inc.needs_identified.map(n => `<span class="tag-need">${n}</span>`).join("")}</div>
            <div class="incident-footer">
                <span style="font-size: 10px; color: #94a3b8;">${inc.status}</span>
                <div class="card-actions">
                    ${inc.status !== "RESOLVED" ? `
                        <button class="btn-card-xs btn-card-dispatch" onclick="window.openDispatchForIncident('${inc.id}')">🚒 Dispatch</button>
                        <button class="btn-card-xs btn-card-resolve" onclick="window.resolveIncident('${inc.id}')">✓ Resolve</button>
                    ` : `<span style="font-size: 10px; color: #10b981; font-weight: bold;">RESOLVED</span>`}
                </div>
            </div>
        </div>
    `;

    p1Container.innerHTML = p1s.map(i => cardTpl(i, "priority-p1")).join("");
    p2Container.innerHTML = p2s.map(i => cardTpl(i, "priority-p2")).join("");
    p3Container.innerHTML = p3s.map(i => cardTpl(i, "priority-p3")).join("");
    resContainer.innerHTML = resolved.map(i => cardTpl(i, "")).join("");
}

// --- Analytics & Charts ---
async function renderAnalyticsView() {
    try {
        const res = await fetch("/api/sitrep");
        if (!res.ok) return;
        const data = await res.json();

        document.getElementById("analyticsP1Count").innerText = data.critical_sos_count;
        document.getElementById("analyticsAffectedCount").innerText = state.incidents.reduce((s, i) => s + (i.affected_people_count || 1), 0) + 120;
        
        const deployedUnits = state.units.filter(u => u.status === "DISPATCHED").length;
        const totalUnits = state.units.length || 1;
        document.getElementById("analyticsMobilizationRate").innerText = `${Math.round((deployedUnits / totalUnits) * 100)}% (${deployedUnits}/${totalUnits})`;
        
        const resRate = data.total_incidents ? Math.round((data.resolved_count / data.total_incidents) * 100) : 0;
        document.getElementById("analyticsResolutionRate").innerText = `${resRate}%`;

        document.getElementById("analyticsFullSitrepText").innerText = data.executive_summary;

        // Render Chart.js
        if (window.Chart) {
            // Disaster Breakdown Doughnut
            const dCanvas = document.getElementById("disasterDoughnutChart");
            if (dCanvas && data.disaster_breakdown) {
                if (state.charts.disasterChart) state.charts.disasterChart.destroy();
                state.charts.disasterChart = new Chart(dCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(data.disaster_breakdown).map(k => k.toUpperCase()),
                        datasets: [{
                            data: Object.values(data.disaster_breakdown),
                            backgroundColor: ['#0284c7', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'],
                            borderColor: '#0c1322',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 } } }
                        }
                    }
                });
            }

            // Urgency Breakdown Bar
            const uCanvas = document.getElementById("urgencyBarChart");
            if (uCanvas && data.urgency_breakdown) {
                if (state.charts.urgencyChart) state.charts.urgencyChart.destroy();
                state.charts.urgencyChart = new Chart(uCanvas, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(data.urgency_breakdown),
                        datasets: [{
                            label: 'Incidents Count',
                            data: Object.values(data.urgency_breakdown),
                            backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#64748b'],
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
                            y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.error("Analytics render error:", e);
    }
}

window.refreshAnalytics = function() {
    renderAnalyticsView();
};

// --- KPI Stats & SitRep Analytics ---
async function fetchSitRepAndUpdate() {
    try {
        const res = await fetch("/api/sitrep");
        if (res.ok) {
            const data = await res.json();
            document.getElementById("kpiTotalIncidents").innerText = data.total_incidents;
            document.getElementById("kpiCriticalSos").innerText = data.critical_sos_count;
            document.getElementById("kpiDispatched").innerText = data.dispatched_count;
            document.getElementById("kpiResolved").innerText = data.resolved_count;

            document.getElementById("sitrepSummaryText").innerText = data.executive_summary;

            const chartContainer = document.getElementById("disasterTypeChart");
            if (data.disaster_breakdown) {
                const maxCount = Math.max(...Object.values(data.disaster_breakdown), 1);
                chartContainer.innerHTML = Object.entries(data.disaster_breakdown).map(([dtype, cnt]) => `
                    <div class="chart-bar-row">
                        <span class="chart-label">${dtype.toUpperCase()}</span>
                        <div class="chart-bar-wrap">
                            <div class="chart-bar-fill" style="width: ${(cnt / maxCount) * 100}%;"></div>
                        </div>
                        <span class="chart-val">${cnt}</span>
                    </div>
                `).join("");
            }

            const zoneContainer = document.getElementById("topZonesContainer");
            if (data.top_affected_zones) {
                zoneContainer.innerHTML = data.top_affected_zones.map(z => `
                    <div class="zone-item">
                        <span>📍 ${z.zone}</span>
                        <span style="font-family: var(--font-mono); font-weight: bold; color: ${z.critical_cases > 0 ? '#ef4444' : '#38bdf8'};">
                            ${z.incident_count} reports ${z.critical_cases > 0 ? `(${z.critical_cases} P1)` : ''}
                        </span>
                    </div>
                `).join("");
            }
        }
    } catch (e) {
        console.error("Error fetching SitRep:", e);
    }
}

// --- Data Fetching ---
async function fetchInitialData() {
    try {
        const [incRes, unitRes] = await Promise.all([
            fetch("/api/incidents?limit=200"),
            fetch("/api/units")
        ]);
        if (incRes.ok) state.incidents = await incRes.json();
        if (unitRes.ok) state.units = await unitRes.json();

        renderIncidentFeed();
        renderUnitsList();
        renderFullFleetView();
        renderTriageBoard();
        updateMapMarkers();
        updateUnitMarkers();
        fetchSitRepAndUpdate();
    } catch (e) {
        console.error("Error loading initial data:", e);
    }
}

// --- WebSocket Connection ---
function initWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/live-stream`;
    
    state.ws = new WebSocket(wsUrl);

    state.ws.onopen = () => {
        document.getElementById("streamStatusBadge").innerText = "STREAMING LIVE";
        document.getElementById("streamStatusBadge").style.color = "var(--accent-emerald)";
    };

    state.ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.event === "NEW_INCIDENT") {
                const inc = msg.data;
                state.incidents.unshift(inc);
                if (inc.urgency_level === "P1_CRITICAL" || inc.is_sos) {
                    playEmergencyAlertSound();
                }
                renderIncidentFeed();
                renderTriageBoard();
                updateMapMarkers();
                fetchSitRepAndUpdate();
            } else if (msg.event === "INCIDENT_UPDATED") {
                const updated = msg.data;
                const idx = state.incidents.findIndex(i => i.id === updated.id);
                if (idx !== -1) {
                    state.incidents[idx] = updated;
                    renderIncidentFeed();
                    renderTriageBoard();
                    updateMapMarkers();
                    fetchSitRepAndUpdate();
                }
            } else if (msg.event === "UNITS_UPDATED") {
                state.units = msg.data;
                renderUnitsList();
                renderFullFleetView();
                updateUnitMarkers();
            }
        } catch (e) {
            console.error("Error parsing WS message:", e);
        }
    };

    state.ws.onclose = () => {
        document.getElementById("streamStatusBadge").innerText = "RECONNECTING";
        document.getElementById("streamStatusBadge").style.color = "var(--accent-amber)";
        setTimeout(initWebSocket, 3000);
    };
}

// --- View Switcher ---
function switchView(viewId) {
    state.currentView = viewId;
    document.querySelectorAll(".view-mode-nav .view-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
    });
    document.querySelectorAll(".views-wrapper .view-pane").forEach(pane => {
        pane.classList.toggle("active", pane.id === viewId);
    });

    if (viewId === "gisView" && state.map) {
        setTimeout(() => state.map.invalidateSize(), 150);
    } else if (viewId === "analyticsView") {
        renderAnalyticsView();
    } else if (viewId === "fleetView") {
        renderFullFleetView();
    } else if (viewId === "triageView") {
        renderTriageBoard();
    }
}

// --- Gujarati & Indic NLP Lab Execution ---
async function runNlpLabAnalysis() {
    const text = document.getElementById("nlpInputText").value.trim();
    if (!text) return;
    const outputCard = document.getElementById("nlpOutputCard");
    outputCard.innerHTML = `<h3>NLP Pipeline Intelligence Output</h3><div class="spinner"></div>`;

    try {
        const res = await fetch("/api/nlp/classify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        if (res.ok) {
            const data = await res.json();
            outputCard.innerHTML = `
                <h3>NLP Pipeline Intelligence Output</h3>
                <div class="nlp-result-box">
                    <div class="nlp-row"><span class="nlp-row-label">Disaster Category:</span><span class="nlp-row-val text-cyan">${data.disaster_type.toUpperCase()}</span></div>
                    <div class="nlp-row"><span class="nlp-row-label">Urgency Classification:</span><span class="nlp-row-val ${data.urgency_level === 'P1_CRITICAL' ? 'text-red' : 'text-amber'}">${data.urgency_level}</span></div>
                    <div class="nlp-row"><span class="nlp-row-label">Urgency Score:</span><span class="nlp-row-val">${data.urgency_score} / 1.0</span></div>
                    <div class="nlp-row"><span class="nlp-row-label">Detected Language:</span><span class="nlp-row-val">${data.detected_language === 'gu' ? 'Gujarati (ગુજરાતી)' : data.detected_language === 'hi' ? 'Hindi' : 'English'}</span></div>
                    <div class="nlp-row"><span class="nlp-row-label">Extracted Needs:</span><span class="nlp-row-val text-emerald">${data.extracted_needs.join(", ")}</span></div>
                    <div class="nlp-row"><span class="nlp-row-label">Geocoded Location:</span><span class="nlp-row-val">📍 ${data.geocoding.location_name}</span></div>
                    <div class="nlp-row"><span class="nlp-row-label">Coordinates:</span><span class="nlp-row-val">${data.geocoding.latitude}, ${data.geocoding.longitude}</span></div>
                </div>
            `;
        }
    } catch (e) {
        outputCard.innerHTML = `<p style="color: #ef4444;">Analysis failed: ${e}</p>`;
    }
}

// --- Global Event Handlers ---
window.panToIncident = function(lat, lng) {
    switchView("gisView");
    if (state.map && lat && lng) {
        state.map.flyTo([lat, lng], 14, { duration: 1.2 });
    }
};

window.openDispatchForIncident = async function(incidentId) {
    const inc = state.incidents.find(i => i.id === incidentId);
    if (!inc) return;
    state.selectedIncidentForDispatch = inc;

    document.getElementById("dispatchIncidentSummary").innerHTML = `
        <div style="background: #162036; padding: 10px; border-radius: 6px; border-left: 4px solid #0284c7;">
            <strong>Target Incident:</strong> ${inc.id} (${inc.location_name})<br>
            <span style="font-size: 11px; color: #94a3b8;">${inc.raw_text.substring(0, 100)}...</span>
        </div>
    `;

    document.getElementById("dispatchModal").classList.add("active");
    const nearestContainer = document.getElementById("nearestUnitsContainer");
    nearestContainer.innerHTML = `<div class="spinner"></div>`;

    try {
        const res = await fetch(`/api/dispatch/nearest?lat=${inc.latitude}&lng=${inc.longitude}&disaster_type=${inc.disaster_type}`);
        if (res.ok) {
            const data = await res.json();
            nearestContainer.innerHTML = data.map(item => `
                <div class="nearest-unit-row">
                    <div class="nearest-unit-info">
                        <strong>${item.unit.name}</strong>
                        <p>📍 Distance: <b>${item.distance_km} km</b> | ⏱️ ETA: ~<b>${item.eta_minutes} mins</b> | Status: <span style="color: ${item.is_available ? '#10b981' : '#ef4444'}">${item.unit.status}</span></p>
                    </div>
                    <button class="btn btn-primary" onclick="window.confirmDispatch('${item.unit.unit_id}')" ${!item.is_available ? 'disabled style="opacity: 0.5;"' : ''}>
                        🚀 Dispatch
                    </button>
                </div>
            `).join("");
        }
    } catch (e) {
        nearestContainer.innerHTML = `<p style="color: #ef4444;">Error finding nearest units.</p>`;
    }
};

window.confirmDispatch = async function(unitId) {
    if (!state.selectedIncidentForDispatch) return;
    const notes = document.getElementById("dispatchCustomNotes").value;
    try {
        const res = await fetch("/api/dispatch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                incident_id: state.selectedIncidentForDispatch.id,
                unit_id: unitId,
                notes: notes
            })
        });
        if (res.ok) {
            document.getElementById("dispatchModal").classList.remove("active");
            fetchInitialData();
        }
    } catch (e) {
        alert("Dispatch failed: " + e);
    }
};

window.resolveIncident = async function(incidentId) {
    try {
        const res = await fetch(`/api/incidents/${incidentId}/resolve`, { method: "POST" });
        if (res.ok) {
            fetchInitialData();
        }
    } catch (e) {
        console.error("Failed to resolve incident:", e);
    }
};

// --- DOM Event Bindings ---
document.addEventListener("DOMContentLoaded", () => {
    initMap();
    fetchInitialData();
    initWebSocket();

    // View Navigation Buttons
    document.querySelectorAll(".view-mode-nav .view-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            switchView(btn.getAttribute("data-view"));
        });
    });

    // Audio Toggle
    document.getElementById("btnToggleAudio").addEventListener("click", () => {
        state.audioEnabled = !state.audioEnabled;
        document.getElementById("audioIcon").innerText = state.audioEnabled ? "🔊" : "🔇";
        if (state.audioEnabled) playEmergencyAlertSound();
    });

    // Search filter
    document.getElementById("feedSearchInput").addEventListener("input", (e) => {
        state.filters.search = e.target.value;
        renderIncidentFeed();
    });

    // Urgency Pills
    document.querySelectorAll(".filter-pills .pill").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll(".filter-pills .pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            state.filters.urgency = pill.getAttribute("data-val");
            renderIncidentFeed();
        });
    });

    // Select filters
    document.getElementById("disasterTypeSelect").addEventListener("change", (e) => {
        state.filters.disasterType = e.target.value;
        renderIncidentFeed();
    });

    document.getElementById("sourceFilterSelect").addEventListener("change", (e) => {
        state.filters.source = e.target.value;
        renderIncidentFeed();
    });

    if (document.getElementById("fleetStatusFilter")) {
        document.getElementById("fleetStatusFilter").addEventListener("change", () => {
            renderFullFleetView();
        });
    }

    // Tabs
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
        });
    });

    // Map controls
    document.getElementById("btnToggleHeatmap").addEventListener("click", () => {
        state.showHeatmap = !state.showHeatmap;
        updateMapMarkers();
    });

    document.getElementById("btnToggleUnits").addEventListener("click", () => {
        state.showUnits = !state.showUnits;
        updateUnitMarkers();
    });

    document.getElementById("btnComputeSafeRoute").addEventListener("click", () => {
        window.computeAndDrawSafeRoute();
    });

    document.getElementById("btnResetView").addEventListener("click", () => {
        const coords = SCENARIO_COORDS[state.activeScenario];
        if (coords) state.map.flyTo([coords.lat, coords.lng], coords.zoom);
    });

    // NLP Presets
    document.querySelectorAll(".btn-preset").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("nlpInputText").value = btn.getAttribute("data-text");
            runNlpLabAnalysis();
        });
    });

    document.getElementById("btnRunNlpTest").addEventListener("click", runNlpLabAnalysis);

    // Broadcast Modal Bindings
    document.getElementById("btnOpenBroadcastModal").addEventListener("click", () => {
        document.getElementById("broadcastModal").classList.add("active");
    });
    document.getElementById("btnCloseBroadcastModal").addEventListener("click", () => {
        document.getElementById("broadcastModal").classList.remove("active");
    });
    document.getElementById("btnCancelBroadcast").addEventListener("click", () => {
        document.getElementById("broadcastModal").classList.remove("active");
    });

    document.getElementById("broadcastForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            target_channel: document.getElementById("broadcastChannel").value,
            severity: document.getElementById("broadcastSeverity").value,
            target_zone: document.getElementById("broadcastZone").value,
            message: document.getElementById("broadcastMessage").value,
            recipient_count_simulated: 4500
        };

        try {
            const res = await fetch("/api/alerts/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const bcast = await res.json();
                document.getElementById("broadcastModal").classList.remove("active");
                alert(`📢 BROADCAST SENT!\nTarget: ${bcast.target_zone}\nRecipients: ${bcast.recipient_count}\nChannel: ${bcast.target_channel}`);
            }
        } catch (err) {
            alert("Error sending broadcast: " + err);
        }
    });

    // Modals
    document.getElementById("btnOpenSosModal").addEventListener("click", () => {
        document.getElementById("sosModal").classList.add("active");
    });
    document.getElementById("btnCloseSosModal").addEventListener("click", () => {
        document.getElementById("sosModal").classList.remove("active");
    });
    document.getElementById("btnCancelSos").addEventListener("click", () => {
        document.getElementById("sosModal").classList.remove("active");
    });

    document.getElementById("btnCloseDispatchModal").addEventListener("click", () => {
        document.getElementById("dispatchModal").classList.remove("active");
    });
    document.getElementById("btnCancelDispatch").addEventListener("click", () => {
        document.getElementById("dispatchModal").classList.remove("active");
    });

    const openSitrepModal = () => {
        document.getElementById("sitrepIframe").src = `/api/sitrep/report?t=${Date.now()}`;
        document.getElementById("sitrepModal").classList.add("active");
    };

    document.getElementById("btnSitRepReport").addEventListener("click", openSitrepModal);
    document.getElementById("btnOpenFullSitrep").addEventListener("click", openSitrepModal);
    if (document.getElementById("btnOpenSitrepIframeFromAnalytics")) {
        document.getElementById("btnOpenSitrepIframeFromAnalytics").addEventListener("click", openSitrepModal);
    }
    document.getElementById("btnCloseSitrepModal").addEventListener("click", () => {
        document.getElementById("sitrepModal").classList.remove("active");
    });
    document.getElementById("btnCloseSitrepBtn").addEventListener("click", () => {
        document.getElementById("sitrepModal").classList.remove("active");
    });

    // SOS Form Submit
    document.getElementById("sosForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const checkedNeeds = Array.from(document.querySelectorAll("input[name='sosNeeds']:checked")).map(cb => cb.value);
        const payload = {
            name: document.getElementById("sosName").value,
            phone: document.getElementById("sosPhone").value,
            disaster_type: document.getElementById("sosDisasterType").value,
            urgency: "P1_CRITICAL",
            location_name: document.getElementById("sosLocationName").value,
            description: document.getElementById("sosDescription").value,
            people_count: parseInt(document.getElementById("sosPeopleCount").value, 10),
            needs: checkedNeeds
        };

        try {
            const res = await fetch("/api/sos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const inc = await res.json();
                document.getElementById("sosModal").classList.remove("active");
                window.panToIncident(inc.latitude, inc.longitude);
            }
        } catch (err) {
            alert("Error sending SOS: " + err);
        }
    });

    // Trigger burst event button
    document.getElementById("btnTriggerBurst").addEventListener("click", async () => {
        try {
            await fetch("/api/simulate/trigger-burst", { method: "POST" });
        } catch (e) {
            console.error("Burst error:", e);
        }
    });

    // Sync USGS button
    document.getElementById("btnSyncUsgs").addEventListener("click", async () => {
        const btn = document.getElementById("btnSyncUsgs");
        btn.innerText = "⏳ Syncing...";
        try {
            const res = await fetch("/api/sources/sync-usgs", { method: "POST" });
            const data = await res.json();
            btn.innerText = `✓ Synced (${data.synced_count})`;
            setTimeout(() => { btn.innerText = "🔄 USGS Sensor"; }, 2500);
        } catch (e) {
            btn.innerText = "Sync Failed";
        }
    });

    // Apply Gujarat Scenario
    document.getElementById("btnApplyScenario").addEventListener("click", async () => {
        const selected = document.querySelector("input[name='simScenario']:checked").value;
        const speed = parseFloat(document.getElementById("feedSpeedSelect").value);
        state.activeScenario = selected;

        await fetch("/api/simulation/control", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scenario_key: selected, feed_speed_seconds: speed })
        });

        const coords = SCENARIO_COORDS[selected];
        if (coords) {
            state.map.flyTo([coords.lat, coords.lng], coords.zoom);
            document.getElementById("activeScenarioTitle").innerText = `Scenario: ${coords.title}`;
        }
    });
});
