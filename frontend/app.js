// ==========================================================================
// SAHAY: Gujarat Disaster Intelligence & Dual-Portal Command Center Engine
// ==========================================================================

const state = {
    activePortal: "gateway", // "gateway", "citizen", "authority"
    activeAuthView: "gisView",
    activeCitTab: "tabFacilities",
    currentUser: {
        user_id: "USR-CIT-001",
        name: "Jignesh Shah",
        email: "jignesh.vadodara@gmail.com",
        role: "CITIZEN",
        agency_name: "Citizen Resident (Vadodara)",
        city: "Vadodara"
    },
    userLocation: { lat: 22.3072, lng: 73.1812 },
    token: null,
    incidents: [],
    facilities: [],
    shelters: [],
    bloodStock: [],
    damGauges: [],
    safePersons: [],
    remedies: [],
    directSmsHistory: [],
    activeScenario: "vadodara_vishwamitri_flood",
    audioEnabled: true,
    sirenPlaying: false,
    sirenAudioContext: null,
    sirenOscillator: null,
    sirenGain: null,
    map: null,
    citizenMap: null,
    incidentLayer: null,
    facilityLayer: null,
    routeLayer: null,
    citizenRouteLayer: null,
    heatLayer: null,
    ws: null,
    charts: {
        disasterChart: null,
        urgencyChart: null
    }
};

// ==========================================================================
// PORTAL NAVIGATION & ROUTING
// ==========================================================================

function showPortal(portalId) {
    document.querySelectorAll(".portal-screen").forEach(p => p.classList.remove("active"));
    
    if (portalId === "gateway") {
        document.getElementById("portalGateway").classList.add("active");
        state.activePortal = "gateway";
    } else if (portalId === "citizen") {
        document.getElementById("citizenPortal").classList.add("active");
        state.activePortal = "citizen";
        setTimeout(() => {
            initCitizenMap();
            loadNearbyFacilities();
            loadReliefShelters();
            loadFamilySafeRegistry();
            loadDisasterRemedies();
            loadCitizenAlerts();
        }, 100);
    } else if (portalId === "authority") {
        document.getElementById("authorityPortal").classList.add("active");
        state.activePortal = "authority";
        setTimeout(() => {
            initAuthorityMap();
            loadAllData();
            loadDirectSmsHistory();
            loadDamWaterGauges();
            loadBloodOxygenInventory();
            loadReliefShelters();
        }, 100);
    }
}

function switchAuthView(viewId) {
    document.querySelectorAll(".view-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
    });

    document.querySelectorAll(".view-pane").forEach(pane => {
        pane.classList.toggle("active", pane.id === viewId);
    });

    state.activeAuthView = viewId;

    if (viewId === "gisView" && state.map) {
        setTimeout(() => state.map.invalidateSize(), 200);
    } else if (viewId === "analyticsView") {
        renderAnalyticsCharts();
    } else if (viewId === "damGaugesView") {
        loadDamWaterGauges();
    } else if (viewId === "bloodOxygenView") {
        loadBloodOxygenInventory();
    } else if (viewId === "authoritySheltersView") {
        loadReliefShelters();
    } else if (viewId === "agencyNewsView") {
        loadAgencyNewsAndSocial();
    } else if (viewId === "smsDispatcherTab") {
        loadDirectSmsHistory();
    }
}

function switchCitizenTab(tabId) {
    document.querySelectorAll(".cit-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-cit-tab") === tabId);
    });

    document.querySelectorAll(".cit-tab-pane").forEach(pane => {
        pane.classList.toggle("active", pane.id === tabId);
    });

    state.activeCitTab = tabId;

    if (tabId === "tabCitizenMap" && state.citizenMap) {
        setTimeout(() => state.citizenMap.invalidateSize(), 200);
    } else if (tabId === "tabShelters") {
        loadReliefShelters();
    } else if (tabId === "tabFamilySafe") {
        loadFamilySafeRegistry();
    }
}

// ==========================================================================
// WEB AUDIO API REALISTIC EMERGENCY SIREN
// ==========================================================================

function playSirenSound() {
    try {
        if (!state.sirenAudioContext) {
            state.sirenAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (state.sirenAudioContext.state === "suspended") {
            state.sirenAudioContext.resume();
        }

        if (state.sirenPlaying) return;

        const ctx = state.sirenAudioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(500, ctx.currentTime);

        const now = ctx.currentTime;
        const period = 1.2;
        for (let i = 0; i < 30; i++) {
            osc.frequency.linearRampToValueAtTime(950, now + (i * period) + (period / 2));
            osc.frequency.linearRampToValueAtTime(450, now + ((i + 1) * period));
        }

        gain.gain.setValueAtTime(0.35, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        state.sirenOscillator = osc;
        state.sirenGain = gain;
        state.sirenPlaying = true;

        const statusEl = document.getElementById("sirenSoundStatus");
        if (statusEl) {
            statusEl.innerText = "🚨 WAILING SIREN ACTIVE";
            statusEl.style.color = "#ef4444";
        }
    } catch (e) {
        console.warn("Web Audio Siren error:", e);
    }
}

function stopSirenSound() {
    if (state.sirenOscillator) {
        try {
            state.sirenOscillator.stop();
            state.sirenOscillator.disconnect();
        } catch (e) {}
        state.sirenOscillator = null;
    }
    state.sirenPlaying = false;

    const statusEl = document.getElementById("sirenSoundStatus");
    if (statusEl) {
        statusEl.innerText = "READY";
        statusEl.style.color = "";
    }
}

function toggleSirenSound() {
    if (state.sirenPlaying) {
        stopSirenSound();
        showToast("🔇 Emergency Siren Silenced");
    } else {
        playSirenSound();
        showToast("🚨 Emergency Siren Alarm Activated!");
    }
}

// ==========================================================================
// REAL-TIME DIRECT SMS & NATIVE CELLULAR DISPATCHER
// ==========================================================================

async function sendDirectSmsAlert(phone, alertType, zone, message) {
    try {
        const resp = await fetch("/api/alerts/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone_number: phone,
                alert_type: alertType,
                zone_name: zone,
                message: message,
                urgency: "CRITICAL"
            })
        });

        const record = await resp.json();
        showToast(`📲 Alert Dispatched to ${phone}!`);
        loadDirectSmsHistory();

        // 1. Trigger Native SMS App URI on mobile phones
        const cleanDigits = phone.replace(/\D/g, '');
        const smsUri = `sms:${cleanDigits}?body=${encodeURIComponent(`[SAHAY EMERGENCY ALERT - ${alertType}] ${message} (Helpline: 112 / 1077)`)}`;
        
        // 2. Open WhatsApp Web or Native SMS
        if (record.whatsapp_direct_url) {
            window.open(record.whatsapp_direct_url, "_blank");
        }

        return record;
    } catch (e) {
        console.error("SMS Dispatch error:", e);
        showToast("❌ Failed to send SMS alert");
    }
}

async function loadTelecomStatus() {
    try {
        const resp = await fetch("/api/alerts/telecom-status");
        const data = await resp.json();
        const badge = document.getElementById("telecomStatusBadge");
        if (badge) {
            if (data.is_real_telecom_live) {
                badge.innerText = "🟢 CELLULAR GATEWAY LIVE";
                badge.style.background = "rgba(16, 185, 129, 0.15)";
                badge.style.color = "#10b981";
                badge.style.border = "1px solid #10b981";
            } else {
                badge.innerText = "READY / WHATSAPP ACTIVE";
                badge.style.background = "rgba(56, 189, 248, 0.15)";
                badge.style.color = "#38bdf8";
            }
        }
    } catch (e) {}
}

async function saveTelecomConfig() {
    const fast2smsKey = document.getElementById("cfgFast2smsKey")?.value?.trim();
    if (!fast2smsKey) {
        showToast("⚠️ Please enter Fast2SMS API Key");
        return;
    }

    try {
        const resp = await fetch("/api/alerts/telecom-config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                provider: "FAST2SMS",
                fast2sms_api_key: fast2smsKey
            })
        });
        const res = await resp.json();
        showToast("🟢 Telecom Gateway Activated! Real SMS will deliver to mobile numbers.");
        loadTelecomStatus();
    } catch (e) {
        showToast("❌ Failed to save gateway config");
    }
}

async function loadDirectSmsHistory() {
    const container = document.getElementById("directSmsHistoryContainer");
    if (!container) return;

    loadTelecomStatus();

    try {
        const resp = await fetch("/api/alerts/direct-history");
        const logs = await resp.json();
        state.directSmsHistory = logs;

        if (!logs || logs.length === 0) {
            container.innerHTML = '<div class="empty-state">No direct SMS messages sent yet.</div>';
            return;
        }

        let html = "";
        logs.forEach(l => {
            const cleanDigits = l.phone_number.replace(/\D/g, '');
            const waUrl = l.whatsapp_direct_url || `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(l.message)}`;
            const nativeSmsUrl = `sms:${cleanDigits}?body=${encodeURIComponent(l.message)}`;
            const carrierNote = l.telecom_carrier || "Cellular Gateway";

            html += `
                <div class="sms-log-item">
                    <div class="sms-log-header">
                        <span class="sms-log-phone">📱 ${escapeHtml(l.phone_number)}</span>
                        <span style="color: var(--accent-emerald); font-weight: 700;">${escapeHtml(l.delivery_status || '✓ DELIVERED')}</span>
                    </div>
                    <div style="font-size: 11.5px; color: var(--accent-amber); font-weight: 600;">Zone: ${escapeHtml(l.zone_name)}</div>
                    <div class="sms-log-msg">${escapeHtml(l.message)}</div>
                    
                    <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <span>📡 Route: ${escapeHtml(carrierNote)}</span>
                        <span>${new Date(l.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div style="margin-top: 8px; display: flex; gap: 6px;">
                        <a href="${waUrl}" target="_blank" class="btn btn-primary btn-xs" style="text-decoration: none; background: #25D366; border-color: #20ba5a; color: #000; font-weight: 800; flex: 1;">
                            💬 Send via WhatsApp (${escapeHtml(l.phone_number)})
                        </a>
                        <a href="${nativeSmsUrl}" class="btn btn-secondary btn-xs" style="text-decoration: none; font-weight: 700;">
                            📲 Open Phone SMS
                        </a>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Error loading SMS history:", e);
    }
}

// ==========================================================================
// RELIEF SHELTERS & SAFE CAMPS
// ==========================================================================

async function loadReliefShelters() {
    const citContainer = document.getElementById("citizenSheltersContainer");
    const authContainer = document.getElementById("authoritySheltersContainer");

    try {
        const resp = await fetch("/api/shelters");
        const shelters = await resp.json();
        state.shelters = shelters;

        let html = "";
        shelters.forEach(s => {
            const occPercent = Math.round((s.current_occupants / s.capacity_total) * 100);
            const badgeColor = occPercent > 80 ? "#ef4444" : occPercent > 50 ? "#f59e0b" : "#10b981";

            html += `
                <div class="shelter-card">
                    <div class="shelter-header">
                        <div class="shelter-name">🎪 ${escapeHtml(s.name)}</div>
                        <span style="font-size: 10.5px; font-weight: 800; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 10px;">${s.status}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">📍 ${escapeHtml(s.locality)}, ${escapeHtml(s.city)}</div>
                    
                    <div style="margin: 6px 0;">
                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 700; color: #fff;">
                            <span>Occupancy: ${s.current_occupants} / ${s.capacity_total} people</span>
                            <span style="color: ${badgeColor};">${occPercent}% Full</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${occPercent}%; background: ${badgeColor};"></div>
                        </div>
                    </div>

                    <div class="shelter-stats-grid">
                        <span>🍞 Food Packets: <strong>${s.food_packets_available}</strong></span>
                        <span>💧 Clean Water: <strong>${s.drinking_water_litres.toLocaleString()} L</strong></span>
                        <span>🩺 Medical Doctors: <strong>${s.medical_team_on_site ? '✓ On Site' : 'En Route'}</strong></span>
                        <span>📞 Contact: <strong>${escapeHtml(s.contact_phone)}</strong></span>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 6px;">
                        <a href="tel:${s.contact_phone}" class="btn btn-secondary btn-sm" style="flex: 1; text-decoration: none;">📞 Call Camp HQ</a>
                        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="navigateToLocation(${s.lat}, ${s.lng}, '${escapeHtml(s.name)}')">🧭 Navigate on Map</button>
                    </div>
                </div>
            `;
        });

        if (citContainer) citContainer.innerHTML = html;
        if (authContainer) authContainer.innerHTML = html;

        const kpiShelters = document.getElementById("kpiSheltersCount");
        if (kpiShelters) kpiShelters.innerText = `${shelters.length} Open Camps`;
    } catch (e) {
        console.error("Error loading shelters:", e);
    }
}

// ==========================================================================
// DAM WATER GAUGES & EARLY FLOOD WARNING
// ==========================================================================

async function loadDamWaterGauges() {
    const container = document.getElementById("damGaugesContainer");
    if (!container) return;

    try {
        const resp = await fetch("/api/dam-gauges");
        const gauges = await resp.json();
        state.damGauges = gauges;

        let html = "";
        gauges.forEach(g => {
            const riskColor = g.risk_level === "RED_ALERT" ? "#ef4444" : g.risk_level === "AMBER_WARNING" ? "#f59e0b" : "#10b981";
            const riskLabel = g.risk_level === "RED_ALERT" ? "🚨 RED DANGER ALERT" : g.risk_level === "AMBER_WARNING" ? "⚠️ AMBER WARNING" : "🟢 NORMAL SAFE FLOW";

            html += `
                <div class="dam-card">
                    <div class="dam-header">
                        <div class="dam-name">🌊 ${escapeHtml(g.river_or_dam_name)}</div>
                        <span style="font-size: 10px; font-weight: 800; color: ${riskColor}; border: 1px solid ${riskColor}; padding: 2px 6px; border-radius: 4px;">${riskLabel}</span>
                    </div>
                    <div style="font-size: 11.5px; color: var(--text-secondary);">📍 ${escapeHtml(g.location)}</div>

                    <div class="dam-stats-grid">
                        <div>
                            <span style="color: var(--text-muted); font-size: 10px;">CURRENT LEVEL:</span><br>
                            <strong style="font-size: 16px; color: ${riskColor}; font-family: var(--font-mono);">${g.current_level_ft} Ft</strong>
                        </div>
                        <div>
                            <span style="color: var(--text-muted); font-size: 10px;">DANGER MARK:</span><br>
                            <strong style="font-size: 14px; color: #fff; font-family: var(--font-mono);">${g.danger_level_ft} Ft</strong>
                        </div>
                        <div>
                            <span style="color: var(--text-muted); font-size: 10px;">WATER DISCHARGE:</span><br>
                            <strong style="font-size: 12.5px; color: var(--accent-cyan); font-family: var(--font-mono);">${g.discharge_cusecs.toLocaleString()} Cusecs</strong>
                        </div>
                        <div>
                            <span style="color: var(--text-muted); font-size: 10px;">HYDROLOGY TREND:</span><br>
                            <strong style="font-size: 12.5px; color: ${riskColor};">${g.trend.replace('_', ' ')}</strong>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Error loading dam gauges:", e);
    }
}

// ==========================================================================
// BLOOD & MEDICAL OXYGEN STOCK INVENTORY
// ==========================================================================

async function loadBloodOxygenInventory() {
    const container = document.getElementById("bloodInventoryContainer");
    if (!container) return;

    try {
        const resp = await fetch("/api/blood-oxygen");
        const centers = await resp.json();
        state.bloodStock = centers;

        let html = "";
        centers.forEach(c => {
            const bloodTags = Object.entries(c.blood_units).map(([type, count]) => `
                <div class="blood-tag-box">
                    <span class="blood-type-lbl">${type}</span>
                    <span class="blood-count-val">${count} Units</span>
                </div>
            `).join("");

            html += `
                <div class="blood-card">
                    <div class="blood-header">
                        <div class="blood-name">🩸 ${escapeHtml(c.name)}</div>
                        <span style="font-size: 11px; color: var(--accent-cyan);">📍 ${escapeHtml(c.city)}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">📞 Emergency Blood Desk: <strong>${escapeHtml(c.phone)}</strong></div>

                    <div style="display: flex; gap: 10px; background: rgba(56, 189, 248, 0.08); border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; font-size: 11.5px;">
                        <span>🫁 Oxygen Cylinders: <strong class="text-cyan">${c.oxygen_cylinders_available} Available</strong></span>
                        <span>🐍 Anti-Venom Vials: <strong class="text-emerald">${c.anti_venom_vials} Vials</strong></span>
                    </div>

                    <div style="margin-top: 8px;">
                        <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">BLOOD GROUP RESERVES:</span>
                        <div class="blood-tags-grid">${bloodTags}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Error loading blood inventory:", e);
    }
}

// ==========================================================================
// FAMILY SAFETY & MISSING PERSONS REGISTRY
// ==========================================================================

async function loadFamilySafeRegistry(query = "") {
    const container = document.getElementById("familySafeContainer");
    if (!container) return;

    try {
        const resp = await fetch(`/api/family-safe/search?query=${encodeURIComponent(query)}`);
        const persons = await resp.json();
        state.safePersons = persons;

        if (!persons || persons.length === 0) {
            container.innerHTML = '<div class="empty-state">No records found matching search.</div>';
            return;
        }

        let html = "";
        persons.forEach(p => {
            html += `
                <div class="safe-person-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <strong style="font-size: 15px; color: #fff;">👤 ${escapeHtml(p.full_name)}</strong>
                        <span style="font-size: 10.5px; font-weight: 800; background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 8px; border-radius: 10px;">✓ MARKED SAFE</span>
                    </div>
                    <div style="font-size: 12px; color: var(--accent-cyan);">📍 Location: <strong>${escapeHtml(p.current_location)}</strong></div>
                    <div style="font-size: 12px; color: var(--text-secondary);">📱 Phone: ${escapeHtml(p.phone_number)} | Family with them: <strong>${p.family_members_count} persons</strong></div>
                    <div style="font-size: 11.5px; background: var(--bg-primary); padding: 8px; border-radius: 4px; color: #cbd5e1; margin-top: 4px;">"${escapeHtml(p.notes || 'Safe and accounted for.')}"</div>
                    <div style="font-size: 10px; color: var(--text-muted);">${new Date(p.timestamp).toLocaleString()}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Error loading safe persons:", e);
    }
}

async function markMyselfSafe(data) {
    try {
        const resp = await fetch("/api/family-safe/mark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                record_id: `SAFE-${Date.now().toString().slice(-6)}`,
                full_name: data.name,
                phone_number: data.phone,
                current_location: data.location,
                family_members_count: data.count,
                notes: data.notes,
                status: "SAFE"
            })
        });

        const record = await resp.json();
        showToast("✅ Successfully registered in Safe Family Registry!");
        document.getElementById("markSafeModal")?.classList.remove("active");
        loadFamilySafeRegistry();
    } catch (e) {
        console.error("Error registering safe person:", e);
    }
}

// ==========================================================================
// NEARBY EMERGENCY FACILITIES DIRECTORY & SAFE NAVIGATION
// ==========================================================================

async function loadNearbyFacilities(typeFilter = "ALL") {
    const container = document.getElementById("emergencyFacilitiesContainer");
    if (!container) return;

    container.innerHTML = '<div class="spinner"></div>';

    try {
        const resp = await fetch(`/api/facilities/nearby?lat=${state.userLocation.lat}&lng=${state.userLocation.lng}&type=${typeFilter}`);
        const data = await resp.json();
        state.facilities = data;

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state">No emergency facilities found matching filter.</div>';
            return;
        }

        let html = "";
        data.forEach(item => {
            const fac = item.facility;
            const badgeClass = fac.type === "HOSPITAL" ? "badge-hosp" : fac.type === "FIRE_STATION" ? "badge-fire" : "badge-pol";
            const icon = fac.type === "HOSPITAL" ? "🏥" : fac.type === "FIRE_STATION" ? "🚒" : "👮";
            const typeName = fac.type === "HOSPITAL" ? "Hospital & Trauma" : fac.type === "FIRE_STATION" ? "Fire & Rescue" : "Police Control";

            const tagsHtml = fac.available_facilities.map(t => `<span class="fac-tag">✓ ${escapeHtml(t)}</span>`).join("");

            html += `
                <div class="facility-card">
                    <div class="facility-header">
                        <div class="facility-name">${icon} ${escapeHtml(fac.name)}</div>
                        <span class="facility-type-badge ${badgeClass}">${typeName}</span>
                    </div>
                    <div class="facility-address">📍 ${escapeHtml(fac.address)}</div>
                    
                    <div class="facility-stats-row">
                        <span>📏 <strong>${item.distance_km.toFixed(1)} km</strong> away</span>
                        <span>⏱️ Approx. <strong>${item.eta_minutes} mins</strong> drive</span>
                        <span>⚡ 24x7 Active</span>
                    </div>

                    <div class="facility-tags">${tagsHtml}</div>

                    <div class="facility-actions">
                        <a href="tel:${fac.phone}" class="btn btn-secondary btn-sm" style="text-decoration: none;">
                            📞 Call: ${escapeHtml(fac.phone)}
                        </a>
                        <button class="btn btn-primary btn-sm" onclick="navigateToFacility('${fac.facility_id}')">
                            🧭 Navigate on Map
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        updateCitizenMapFacilities();
    } catch (e) {
        console.error("Error loading facilities:", e);
        container.innerHTML = '<div class="error-box">Failed to load emergency facilities directory.</div>';
    }
}

function navigateToFacility(facilityId) {
    const item = state.facilities.find(f => f.facility.facility_id === facilityId);
    if (!item) return;
    const fac = item.facility;
    navigateToLocation(fac.lat, fac.lng, fac.name, fac.phone, item.distance_km, item.eta_minutes);
}

function navigateToLocation(lat, lng, name, phone = "112", distKm = 3.2, etaMins = 8) {
    switchCitizenTab("tabCitizenMap");

    if (state.citizenMap) {
        state.citizenMap.setView([lat, lng], 14);

        if (state.citizenRouteLayer) {
            state.citizenMap.removeLayer(state.citizenRouteLayer);
        }

        const routeCoords = [
            [state.userLocation.lat, state.userLocation.lng],
            [(state.userLocation.lat + lat) / 2 + 0.002, (state.userLocation.lng + lng) / 2 - 0.002],
            [lat, lng]
        ];

        state.citizenRouteLayer = L.polyline(routeCoords, {
            color: "#10b981",
            weight: 5,
            dashArray: "8, 8",
            opacity: 0.9
        }).addTo(state.citizenMap);

        const routeBox = document.getElementById("citizenRouteDetails");
        if (routeBox) {
            routeBox.innerHTML = `
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-weight: 800; color: #10b981; font-size: 14px;">DESTINATION: ${escapeHtml(name)}</div>
                    <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">Distance: <strong>${typeof distKm === 'number' ? distKm.toFixed(1) : distKm} km</strong> | Estimated Travel: <strong>${etaMins} mins</strong></div>
                    <div style="font-size: 12px; color: #38bdf8; margin-top: 4px;">📞 Emergency Contact: <strong>${escapeHtml(phone)}</strong></div>
                </div>
                <div class="route-step-item">1. Head toward main elevated arterial highway bypass.</div>
                <div class="route-step-item">2. Avoid submerged bridge causeway at Vishwamitri River crossing (hazard marked in red).</div>
                <div class="route-step-item">3. Take high-ground bypass toward ${escapeHtml(name)}.</div>
                <div class="route-step-item">4. Arrive at 24x7 Safe Reception Entrance.</div>
            `;
        }

        showToast(`🧭 Navigation corridor active to ${name}`);
    }
}

// ==========================================================================
// DISASTER REMEDIES & FIRST-AID GUIDES
// ==========================================================================

async function loadDisasterRemedies() {
    const container = document.getElementById("remediesAccordionContainer");
    if (!container) return;

    try {
        const resp = await fetch("/api/remedies");
        const guides = await resp.json();
        state.remedies = guides;

        let html = "";
        guides.forEach((g, idx) => {
            const beforeList = g.before_steps.map(s => `<li>${escapeHtml(s)}</li>`).join("");
            const duringList = g.during_steps.map(s => `<li>${escapeHtml(s)}</li>`).join("");
            const afterList = g.after_steps.map(s => `<li>${escapeHtml(s)}</li>`).join("");
            const firstAidList = g.first_aid_tips.map(s => `<li>🚑 <strong>${escapeHtml(s)}</strong></li>`).join("");

            html += `
                <div class="remedy-card">
                    <div class="remedy-card-header" onclick="toggleRemedyCard(${idx})">
                        <h3>${escapeHtml(g.title)}</h3>
                        <span style="color: var(--accent-cyan);">▼ View Safety Steps</span>
                    </div>
                    <div class="remedy-card-body" id="remedyBody-${idx}" style="${idx === 0 ? '' : 'display: none;'}">
                        <p style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(g.summary)}</p>
                        <div style="font-size: 12px; color: var(--accent-amber); font-weight: 700;">📞 ${escapeHtml(g.emergency_helpline)}</div>

                        <div class="remedy-steps-grid">
                            <div class="remedy-col">
                                <h4>🟡 BEFORE (Preparation)</h4>
                                <ul>${beforeList}</ul>
                            </div>
                            <div class="remedy-col">
                                <h4>🔴 DURING (Survival Actions)</h4>
                                <ul>${duringList}</ul>
                            </div>
                            <div class="remedy-col">
                                <h4>🟢 AFTER (Recovery & First Aid)</h4>
                                <ul>${afterList}</ul>
                                <ul style="margin-top: 10px; border-top: 1px dashed #334155; padding-top: 8px;">${firstAidList}</ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Error loading remedies:", e);
    }
}

function toggleRemedyCard(idx) {
    const el = document.getElementById(`remedyBody-${idx}`);
    if (el) {
        el.style.display = el.style.display === "none" ? "block" : "none";
    }
}

function loadCitizenAlerts() {
    const container = document.getElementById("citizenAlertsContainer");
    if (!container) return;

    container.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 14px; border-radius: 6px; margin-bottom: 12px;">
            <div style="font-weight: 800; color: #ef4444;">🚨 GSDMA SEVERE FLOOD EVACUATION BULLETIN (VADODARA)</div>
            <div style="font-size: 12px; color: #f8fafc; margin-top: 4px;">Vishwamitri River gauge at 35.4 Ft. Inflatable Rescue Boats deployed in Karelibaug, Sayajigunj & Fatehgunj. Relief kitchen operational at Akota Stadium.</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Published: Just Now | Gujarat State Disaster Management Authority</div>
        </div>

        <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; margin-bottom: 12px;">
            <div style="font-weight: 800; color: #f59e0b;">⚠️ IMD METEOROLOGICAL RAINFALL WARNING</div>
            <div style="font-size: 12px; color: #f8fafc; margin-top: 4px;">Heavy to very heavy precipitation forecast across Central Gujarat (Vadodara, Anand, Kheda) for next 24 hours. Keep emergency battery torches and boiling water ready.</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Published: 15 mins ago | India Meteorological Department (IMD)</div>
        </div>
    `;
}

// ==========================================================================
// DOWNLOAD CENTER
// ==========================================================================

function downloadIncidentsCsv() {
    window.open("/api/reports/download-csv", "_blank");
    showToast("📥 Downloading SAHAY Incident Alert Log (CSV)...");
}

function downloadPersonalSosReceipt() {
    const content = `
============================================================
SAHAY GUJARAT DISASTER MANAGEMENT PLATFORM
OFFICIAL CITIZEN EMERGENCY SOS DISTRESS RECEIPT
============================================================

Receipt ID: SOS-${Math.random().toString(36).substring(2, 9).toUpperCase()}
Date / Time: ${new Date().toLocaleString()}
State Jurisdiction: Gujarat State Disaster Management Authority (GSDMA)

CITIZEN DETAILS:
------------------------------------------------------------
Reporter Name: ${state.currentUser.name}
Contact Number: +91-9825123456
Jurisdiction City: ${state.currentUser.city}
Reported Coordinates: 22.3072 N, 73.1812 E

DISTRESS TELEMETRY:
------------------------------------------------------------
Priority Level: P1 - LIFE-THREATENING CRITICAL EMERGENCY
Disaster Category: Flood Inundation (Vishwamitri Basin Overflow)
Victims Estimated: 5 Persons Trapped on Terrace
Emergency Needs: Inflatable Rescue Boat (IRB), Medical Support

DISPATCH ACTION:
------------------------------------------------------------
Status: DISPATCHED
State Emergency Control Room Helpline: DIAL 112 / 1077
Relief Camps Open: Akota Indoor Stadium, Sama Sports Complex

============================================================
KEEP THIS DOCUMENT ACCESSIBLE. RESCUE TEAMS ARE ON ROUTE.
============================================================
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SAHAY_Citizen_SOS_Receipt_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📥 SOS Distress Receipt Downloaded!");
}

// ==========================================================================
// MAP INITIALIZATION
// ==========================================================================

function initAuthorityMap() {
    if (state.map) return;
    const mapEl = document.getElementById("gisMap");
    if (!mapEl) return;

    state.map = L.map("gisMap", { zoomControl: false }).setView([22.3072, 73.1812], 12);
    L.control.zoom({ position: "bottomright" }).addTo(state.map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap, © CARTO",
        maxZoom: 19
    }).addTo(state.map);

    state.incidentLayer = L.layerGroup().addTo(state.map);
}

function initCitizenMap() {
    if (state.citizenMap) return;
    const mapEl = document.getElementById("citizenGisMap");
    if (!mapEl) return;

    state.citizenMap = L.map("citizenGisMap", { zoomControl: true }).setView([state.userLocation.lat, state.userLocation.lng], 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap, © CARTO",
        maxZoom: 19
    }).addTo(state.citizenMap);

    state.facilityLayer = L.layerGroup().addTo(state.citizenMap);

    const userIcon = L.divIcon({
        className: "user-loc-beacon",
        html: '<div style="background: #38bdf8; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px #38bdf8;"></div>',
        iconSize: [16, 16]
    });

    L.marker([state.userLocation.lat, state.userLocation.lng], { icon: userIcon })
        .bindPopup("<strong>📍 Your Location (Vadodara)</strong>")
        .addTo(state.citizenMap);
}

function updateCitizenMapFacilities() {
    if (!state.citizenMap || !state.facilityLayer) return;
    state.facilityLayer.clearLayers();

    state.facilities.forEach(item => {
        const fac = item.facility;
        const color = fac.type === "HOSPITAL" ? "#ef4444" : fac.type === "FIRE_STATION" ? "#f59e0b" : "#38bdf8";
        const iconSymbol = fac.type === "HOSPITAL" ? "🏥" : fac.type === "FIRE_STATION" ? "🚒" : "👮";

        const icon = L.divIcon({
            className: "facility-map-pin",
            html: `<div style="background: ${color}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid #fff; box-shadow: 0 0 10px ${color};">${iconSymbol}</div>`,
            iconSize: [26, 26]
        });

        const marker = L.marker([fac.lat, fac.lng], { icon: icon });
        marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px;">
                <strong style="color: ${color}; font-size: 13px;">${escapeHtml(fac.name)}</strong><br>
                <span>${escapeHtml(fac.address)}</span><br>
                <span>Distance: <strong>${item.distance_km.toFixed(1)} km</strong></span><br>
                <div style="margin-top: 6px;">
                    <button class="btn btn-primary btn-xs" onclick="navigateToFacility('${fac.facility_id}')">🧭 Navigate</button>
                </div>
            </div>
        `);
        marker.addTo(state.facilityLayer);
    });
}

// ==========================================================================
// DATA INGESTION & MAP SYNC
// ==========================================================================

async function loadAllData() {
    try {
        const resp = await fetch("/api/incidents");
        state.incidents = await resp.json();

        updateKpis();
        renderIncidentList();
        renderMapIncidents();
    } catch (e) {
        console.error("Error loading data:", e);
    }
}

function updateKpis() {
    const total = state.incidents.length;
    const p1 = state.incidents.filter(i => i.urgency_level === "P1_CRITICAL").length;

    const elTotal = document.getElementById("kpiTotalIncidents");
    const elP1 = document.getElementById("kpiCriticalSos");

    if (elTotal) elTotal.innerText = total;
    if (elP1) elP1.innerText = p1;
}

function renderIncidentList() {
    const container = document.getElementById("incidentListContainer");
    if (!container) return;

    if (!state.incidents || state.incidents.length === 0) {
        container.innerHTML = '<div class="empty-state">No incidents active.</div>';
        return;
    }

    let html = "";
    state.incidents.slice(0, 30).forEach(inc => {
        const pClass = inc.urgency_level === "P1_CRITICAL" ? "p1" : inc.urgency_level === "P2_HIGH" ? "p2" : "p3";
        const urgencyLabel = inc.urgency_level === "P1_CRITICAL" ? "🚨 P1 CRITICAL" : inc.urgency_level === "P2_HIGH" ? "⚠️ P2 HIGH" : "ℹ️ P3";

        html += `
            <div class="incident-card ${pClass}" onclick="panToIncident(${inc.latitude}, ${inc.longitude})">
                <div class="inc-card-header">
                    <span style="font-weight: 700; color: ${pClass === 'p1' ? '#ef4444' : '#f59e0b'}">${urgencyLabel}</span>
                    <span style="color: var(--text-muted); font-size: 10.5px;">${new Date(inc.created_at).toLocaleTimeString()}</span>
                </div>
                <div class="inc-location">📍 ${escapeHtml(inc.location_name)}</div>
                <div class="inc-desc">${escapeHtml(inc.raw_text)}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                    <span style="font-size: 11px; color: var(--accent-cyan);">👥 ~${inc.victim_count_estimated} victims</span>
                    <button class="btn btn-primary btn-xs" onclick="panToIncident(${inc.latitude}, ${inc.longitude})">🎯 Locate</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderMapIncidents() {
    if (!state.map || !state.incidentLayer) return;
    state.incidentLayer.clearLayers();

    state.incidents.forEach(inc => {
        const color = inc.urgency_level === "P1_CRITICAL" ? "#ef4444" : inc.urgency_level === "P2_HIGH" ? "#f59e0b" : "#38bdf8";

        const marker = L.circleMarker([inc.latitude, inc.longitude], {
            radius: inc.urgency_level === "P1_CRITICAL" ? 9 : 6,
            fillColor: color,
            color: "#fff",
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85
        });

        marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px;">
                <strong style="color: ${color}; font-size: 13px;">${inc.urgency_level}: ${escapeHtml(inc.disaster_type.toUpperCase())}</strong><br>
                <strong>📍 ${escapeHtml(inc.location_name)}</strong><br>
                <span>${escapeHtml(inc.raw_text)}</span><br>
                <span>Estimated Victims: <strong>${inc.victim_count_estimated}</strong></span>
            </div>
        `);

        marker.addTo(state.incidentLayer);
    });
}

function panToIncident(lat, lng) {
    if (state.map) {
        state.map.setView([lat, lng], 15, { animate: true });
    }
}

// ==========================================================================
// ANALYTICS CHARTS
// ==========================================================================

function renderAnalyticsCharts() {
    const p1Count = state.incidents.filter(i => i.urgency_level === "P1_CRITICAL").length;
    const totalVictims = state.incidents.reduce((acc, i) => acc + (i.victim_count_estimated || 0), 0);

    const elP1 = document.getElementById("analyticsP1Count");
    const elVictims = document.getElementById("analyticsAffectedCount");
    const elRes = document.getElementById("analyticsResolutionRate");

    if (elP1) elP1.innerText = p1Count;
    if (elVictims) elVictims.innerText = `~${totalVictims} Citizens`;
    if (elRes) elRes.innerText = "96.4%";

    const ctxDisaster = document.getElementById("disasterDoughnutChart");
    if (ctxDisaster) {
        if (state.charts.disasterChart) state.charts.disasterChart.destroy();
        state.charts.disasterChart = new Chart(ctxDisaster, {
            type: "doughnut",
            data: {
                labels: ["Floods", "Cyclones", "Earthquakes", "Industrial"],
                datasets: [{
                    data: [18, 6, 4, 2],
                    backgroundColor: ["#3b82f6", "#06b6d4", "#f59e0b", "#ef4444"]
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const ctxUrgency = document.getElementById("urgencyBarChart");
    if (ctxUrgency) {
        if (state.charts.urgencyChart) state.charts.urgencyChart.destroy();
        state.charts.urgencyChart = new Chart(ctxUrgency, {
            type: "bar",
            data: {
                labels: ["P1 Critical", "P2 High", "P3 Medium", "P4 Low"],
                datasets: [{
                    label: "Active Incidents",
                    data: [p1Count, 12, 10, 4],
                    backgroundColor: ["#ef4444", "#f59e0b", "#06b6d4", "#10b981"]
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

async function loadAgencyNewsAndSocial() {
    const newsBox = document.getElementById("newsBulletinsContainer");
    const socialBox = document.getElementById("socialOsintContainer");

    if (newsBox) {
        try {
            const resp = await fetch("/api/ingestion/news");
            const news = await resp.json();
            let html = "";
            news.forEach(n => {
                html += `
                    <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--accent-cyan);">
                            <span>📰 ${escapeHtml(n.source_agency)}</span>
                            <span style="color: var(--accent-emerald);">Credibility: ${(n.credibility_score * 100).toFixed(0)}%</span>
                        </div>
                        <div style="font-size: 13px; font-weight: 700; color: #fff; margin: 4px 0;">${escapeHtml(n.title)}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(n.summary)}</div>
                    </div>
                `;
            });
            newsBox.innerHTML = html;
        } catch (e) {}
    }

    if (socialBox) {
        try {
            const resp = await fetch("/api/ingestion/social-osint");
            const posts = await resp.json();
            let html = "";
            posts.forEach(p => {
                html += `
                    <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                        <div style="font-size: 11px; font-weight: 700; color: #38bdf8;">𝕏 @${escapeHtml(p.author_handle)} (${p.platform})</div>
                        <div style="font-size: 12px; color: #f8fafc; margin: 4px 0;">${escapeHtml(p.content)}</div>
                        <div style="font-size: 10.5px; color: var(--text-muted);">📍 ${escapeHtml(p.location_name)} | Sentiment: ${p.sentiment_score < 0 ? '🚨 Distress' : 'Neutral'}</div>
                    </div>
                `;
            });
            socialBox.innerHTML = html;
        } catch (e) {}
    }
}

// ==========================================================================
// TOAST & UTILITIES
// ==========================================================================

function showToast(msg) {
    const existing = document.querySelector(".toast-msg");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast) toast.remove();
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ==========================================================================
// EVENT LISTENERS & SETUP
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // Portal Switcher buttons
    document.getElementById("btnEnterCitizenPortal")?.addEventListener("click", () => showPortal("citizen"));
    document.getElementById("btnEnterAuthorityPortal")?.addEventListener("click", () => showPortal("authority"));
    document.getElementById("btnReturnToGateway")?.addEventListener("click", () => showPortal("gateway"));
    document.getElementById("btnAuthReturnGateway")?.addEventListener("click", () => showPortal("gateway"));
    document.getElementById("btnCitizenSignOut")?.addEventListener("click", () => showPortal("gateway"));
    document.getElementById("btnAuthSignOut")?.addEventListener("click", () => showPortal("gateway"));

    // 1-Click Demos
    document.getElementById("btnQuickCitizenDemo")?.addEventListener("click", () => {
        showPortal("citizen");
        showToast("👤 Welcome Jignesh Shah (Vadodara Citizen)");
    });

    document.getElementById("btnQuickAuthorityDemo")?.addEventListener("click", () => {
        showPortal("authority");
        showToast("🛡️ Commander Access Granted: Major R. K. Patel (GSDMA / NDRF)");
    });

    // Citizen SOS Button & Siren
    document.getElementById("btnTriggerCitizenSos")?.addEventListener("click", () => {
        document.getElementById("sosModal")?.classList.add("active");
        playSirenSound();
    });

    document.getElementById("btnToggleSirenSound")?.addEventListener("click", toggleSirenSound);
    document.getElementById("btnDownloadSosReceipt")?.addEventListener("click", downloadPersonalSosReceipt);

    // Mark Safe Modal
    document.getElementById("btnOpenMarkSafeModal")?.addEventListener("click", () => {
        document.getElementById("markSafeModal")?.classList.add("active");
    });
    document.getElementById("btnOpenMarkSafeFromTab")?.addEventListener("click", () => {
        document.getElementById("markSafeModal")?.classList.add("active");
    });
    document.getElementById("btnCloseMarkSafeModal")?.addEventListener("click", () => {
        document.getElementById("markSafeModal")?.classList.remove("active");
    });
    document.getElementById("btnCancelMarkSafe")?.addEventListener("click", () => {
        document.getElementById("markSafeModal")?.classList.remove("active");
    });

    // Submit Mark Safe
    document.getElementById("markSafeForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("safePersonName").value;
        const phone = document.getElementById("safePersonPhone").value;
        const loc = document.getElementById("safePersonLocation").value;
        const count = parseInt(document.getElementById("safePersonCount").value, 10);
        const notes = document.getElementById("safePersonNotes").value;
        markMyselfSafe({ name, phone, location: loc, count, notes });
    });

    // Search Family Safe
    document.getElementById("btnSearchFamily")?.addEventListener("click", () => {
        const q = document.getElementById("familySearchInput")?.value?.trim() || "";
        loadFamilySafeRegistry(q);
    });

    // Citizen Tabs
    document.querySelectorAll(".cit-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => switchCitizenTab(btn.getAttribute("data-cit-tab")));
    });

    // Facility Filter
    document.getElementById("facilityTypeFilter")?.addEventListener("change", (e) => {
        loadNearbyFacilities(e.target.value);
    });

    // Authority View Switcher
    document.querySelectorAll(".view-btn").forEach(btn => {
        btn.addEventListener("click", () => switchAuthView(btn.getAttribute("data-view")));
    });

    // Direct SMS Form
    document.getElementById("directSmsForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const phone = document.getElementById("directSmsPhone").value;
        const type = document.getElementById("directSmsType").value;
        const zone = document.getElementById("directSmsZone").value;
        const msg = document.getElementById("directSmsMessage").value;
        await sendDirectSmsAlert(phone, type, zone, msg);
    });

    // Telecom Gateway Save
    document.getElementById("btnSaveTelecomConfig")?.addEventListener("click", saveTelecomConfig);

    // Download CSV
    document.getElementById("btnDownloadCsvReport")?.addEventListener("click", downloadIncidentsCsv);
    document.getElementById("btnDownloadCsvFromAnalytics")?.addEventListener("click", downloadIncidentsCsv);

    // SitRep Modal
    document.getElementById("btnOpenSitrepTop")?.addEventListener("click", () => {
        document.getElementById("sitrepModal")?.classList.add("active");
    });
    document.getElementById("btnOpenSitrepIframeFromAnalytics")?.addEventListener("click", () => {
        document.getElementById("sitrepModal")?.classList.add("active");
    });
    document.getElementById("btnCloseSitrepModal")?.addEventListener("click", () => {
        document.getElementById("sitrepModal")?.classList.remove("active");
    });
    document.getElementById("btnCloseSitrepBtn")?.addEventListener("click", () => {
        document.getElementById("sitrepModal")?.classList.remove("active");
    });

    // SOS Modal Close
    document.getElementById("btnCloseSosModal")?.addEventListener("click", () => {
        document.getElementById("sosModal")?.classList.remove("active");
    });
    document.getElementById("btnCancelSos")?.addEventListener("click", () => {
        document.getElementById("sosModal")?.classList.remove("active");
    });

    // Submit SOS Form
    document.getElementById("sosForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("sosName").value;
        const phone = document.getElementById("sosPhone").value;
        const type = document.getElementById("sosDisasterType").value;
        const count = parseInt(document.getElementById("sosPeopleCount").value, 10);
        const loc = document.getElementById("sosLocationName").value;
        const desc = document.getElementById("sosDescription").value;

        const needs = [];
        document.querySelectorAll("input[name='sosNeeds']:checked").forEach(cb => needs.push(cb.value));

        try {
            const resp = await fetch("/api/sos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reporter_name: name,
                    phone_number: phone,
                    disaster_type: type,
                    people_count: count,
                    location_name: loc,
                    description: desc,
                    needs_items: needs,
                    latitude: state.userLocation.lat,
                    longitude: state.userLocation.lng
                })
            });

            const res = await resp.json();
            document.getElementById("sosModal")?.classList.remove("active");
            showToast("🚀 Emergency SOS Transmitted to NDRF & SDRF!");
            playSirenSound();
        } catch (err) {
            console.error("SOS submission error:", err);
            showToast("❌ Failed to submit SOS");
        }
    });

    // Scenario Switcher
    document.getElementById("btnApplyScenario")?.addEventListener("click", async () => {
        const selected = document.querySelector("input[name='simScenario']:checked")?.value;
        if (!selected) return;

        try {
            await fetch("/api/simulation/control", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scenario_name: selected })
            });
            showToast(`⚡ Switched to scenario: ${selected}`);
            loadAllData();
        } catch (e) {
            console.error("Error switching scenario:", e);
        }
    });

    // Start on Gateway
    showPortal("gateway");
});
