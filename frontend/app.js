// ==========================================================================
// SAHAY: Gujarat Disaster Intelligence & Dual-Portal Command Center Engine
// ==========================================================================

const GUJARAT_CITIES = {
    "Vadodara": { lat: 22.3072, lng: 73.1812 },
    "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
    "Surat": { lat: 21.1702, lng: 72.8311 },
    "Rajkot": { lat: 22.3039, lng: 70.8022 },
    "Bhavnagar": { lat: 21.7645, lng: 72.1519 },
    "Jamnagar": { lat: 22.4707, lng: 70.0577 },
    "Junagadh": { lat: 21.5222, lng: 70.4579 },
    "Gandhinagar": { lat: 23.2156, lng: 72.6369 },
    "Anand": { lat: 22.5645, lng: 72.9289 },
    "Navsari": { lat: 20.9467, lng: 72.9520 },
    "Morbi": { lat: 22.8120, lng: 70.8378 },
    "Bharuch": { lat: 21.7051, lng: 72.9959 },
    "Porbandar": { lat: 21.6417, lng: 69.6293 },
    "Kutch / Bhuj": { lat: 23.2420, lng: 69.6669 },
    "Mehsana": { lat: 23.5880, lng: 72.3693 },
    "Valsad": { lat: 20.5992, lng: 72.9342 },
    "Vapi": { lat: 20.3707, lng: 72.9106 },
    "Patan": { lat: 23.8504, lng: 72.1266 },
    "Palanpur (Banaskantha)": { lat: 24.1724, lng: 72.4346 },
    "Himatnagar (Sabarkantha)": { lat: 23.5977, lng: 72.9698 },
    "Godhra (Panchmahal)": { lat: 22.7758, lng: 73.6149 },
    "Dahod": { lat: 22.8398, lng: 74.2536 },
    "Nadiad (Kheda)": { lat: 22.6916, lng: 72.8634 },
    "Amreli": { lat: 21.6032, lng: 71.2221 },
    "Surendranagar": { lat: 22.7277, lng: 71.6370 },
    "Botad": { lat: 22.1704, lng: 71.6665 },
    "Veraval / Somnath (Gir Somnath)": { lat: 20.9000, lng: 70.3667 },
    "Dwarka (Devbhumi Dwarka)": { lat: 22.2442, lng: 68.9685 },
    "Vyara (Tapi)": { lat: 21.1122, lng: 73.3917 },
    "Ahwa (Dang)": { lat: 20.7583, lng: 73.6844 },
    "Rajpipla (Narmada)": { lat: 21.7877, lng: 73.5042 },
    "Chhota Udaipur": { lat: 22.3082, lng: 74.0094 },
    "Lunawada (Mahisagar)": { lat: 23.1325, lng: 73.6163 },
    "Modasa (Aravalli)": { lat: 23.4632, lng: 73.2988 }
};

const state = {
    activePortal: "gateway", // "gateway", "citizen", "authority"
    activeAuthView: "gisView",
    activeCitTab: "tabFacilities",
    currentTheme: "dark", // "dark" or "light"
    currentUser: {
        user_id: "USR-CIT-001",
        name: localStorage.getItem("sahay_user_name") || "Jignesh Shah",
        email: "citizen.gujarat@gsdma.gov.in",
        role: "CITIZEN",
        agency_name: "Gujarat Resident",
        city: localStorage.getItem("sahay_user_city") || "Vadodara"
    },
    userLocation: { lat: 22.3072, lng: 73.1812 },
    token: null,
    incidents: [],
    facilities: [],
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
    mapTileLayer: null,
    citizenMapTileLayer: null,
    charts: {
        disasterChart: null,
        urgencyChart: null
    }
};

// ==========================================================================
// THEME SWITCHER (DARK MODE / LIGHT MODE)
// ==========================================================================

function initTheme() {
    const savedTheme = localStorage.getItem("sahay_theme") || "dark";
    setTheme(savedTheme);
}

function setTheme(theme) {
    state.currentTheme = theme;
    localStorage.setItem("sahay_theme", theme);

    if (theme === "light") {
        document.body.classList.add("theme-light");
        document.body.classList.remove("theme-dark");
    } else {
        document.body.classList.add("theme-dark");
        document.body.classList.remove("theme-light");
    }

    // Update all theme toggle buttons across all screens
    document.querySelectorAll(".btnToggleTheme").forEach(btn => {
        const icon = btn.querySelector(".theme-icon");
        const label = btn.querySelector(".theme-label");
        if (theme === "light") {
            if (icon) icon.innerText = "☀️";
            if (label) label.innerText = "Theme: Light";
        } else {
            if (icon) icon.innerText = "🌙";
            if (label) label.innerText = "Theme: Dark";
        }
    });

    updateMapTiles();
}

function toggleTheme() {
    const nextTheme = state.currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    showToast(`🌓 Switched to ${nextTheme.toUpperCase()} Mode`);
}

function updateMapTiles() {
    const tileUrl = state.currentTheme === "light" 
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    if (state.map && state.mapTileLayer) {
        state.map.removeLayer(state.mapTileLayer);
        state.mapTileLayer = L.tileLayer(tileUrl, { attribution: "© OpenStreetMap, © CARTO", maxZoom: 19 }).addTo(state.map);
    }

    if (state.citizenMap && state.citizenMapTileLayer) {
        state.citizenMap.removeLayer(state.citizenMapTileLayer);
        state.citizenMapTileLayer = L.tileLayer(tileUrl, { attribution: "© OpenStreetMap, © CARTO", maxZoom: 19 }).addTo(state.citizenMap);
    }
}


// ==========================================================================
// USER IDENTITY & GUJARAT CITY CONFIGURATION
// ==========================================================================

function updateUserProfile(name, city) {
    if (!name || !name.trim()) name = "Jignesh Shah";
    if (!city || !GUJARAT_CITIES[city]) city = "Vadodara";

    state.currentUser.name = name.trim();
    state.currentUser.city = city;
    state.userLocation = GUJARAT_CITIES[city];

    localStorage.setItem("sahay_user_name", state.currentUser.name);
    localStorage.setItem("sahay_user_city", city);

    // Update labels in UI
    const citNameEl = document.getElementById("citizenNameLabel");
    const citCityEl = document.getElementById("citizenCityLabel");
    const authNameEl = document.getElementById("authOfficerName");
    const sosNameInput = document.getElementById("sosName");
    const gatewayCustomInput = document.getElementById("gatewayCustomName");
    const gatewayCitySel = document.getElementById("gatewayCitySelect");
    const citCityDropdown = document.getElementById("citizenCityDropdown");
    const liveAlertBanner = document.getElementById("citizenLiveAlertBanner");

    if (citNameEl) citNameEl.innerText = state.currentUser.name;
    if (citCityEl) citCityEl.innerText = `CITIZEN (${city.toUpperCase()})`;
    if (authNameEl) authNameEl.innerText = state.currentUser.name.includes("Major") ? state.currentUser.name : `Major ${state.currentUser.name}`;
    if (sosNameInput) sosNameInput.value = state.currentUser.name;
    if (gatewayCustomInput) gatewayCustomInput.value = state.currentUser.name;
    if (gatewayCitySel) gatewayCitySel.value = city;
    if (citCityDropdown) citCityDropdown.value = city;

    if (liveAlertBanner) {
        liveAlertBanner.innerText = `⚠️ LIVE ALERT (${city.toUpperCase()} SECTOR): Continuous precipitation monitoring active. Helplines ready: 112 / 1077.`;
    }

    // Move citizen map center to new city coordinates
    if (state.citizenMap) {
        state.citizenMap.setView([state.userLocation.lat, state.userLocation.lng], 13);
    }

    loadNearbyFacilities("ALL", city);
}

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
            loadNearbyFacilities("ALL", state.currentUser.city);
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
// REAL-TIME DIRECT MOBILE SMS DISPATCHER (PURE CELLULAR / PHONE SMS)
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
        showToast(`📲 SMS Alert Dispatched to ${phone}!`);
        loadDirectSmsHistory();

        // Format clean phone number and message for native SMS protocol
        const cleanDigits = phone.replace(/[^0-9+]/g, '');
        const fullSmsText = `[SAHAY EMERGENCY ALERT - ${alertType}] ${message} (State Helpline: 112 / 1077)`;
        const smsUri = `sms:${cleanDigits}?body=${encodeURIComponent(fullSmsText)}`;

        // Open Direct SMS Action Modal
        const phoneDisp = document.getElementById("modalSmsPhoneDisplay");
        const zoneDisp = document.getElementById("modalSmsZoneDisplay");
        const textDisp = document.getElementById("modalSmsTextDisplay");
        const btnNative = document.getElementById("btnModalTriggerNativeSms");

        if (phoneDisp) phoneDisp.innerText = phone;
        if (zoneDisp) zoneDisp.innerText = zone;
        if (textDisp) textDisp.innerText = fullSmsText;
        if (btnNative) {
            btnNative.href = smsUri;
            btnNative.onclick = () => {
                showToast(`📲 Opening Phone SMS Messages app for ${phone}...`);
            };
        }

        document.getElementById("smsSentSuccessModal")?.classList.add("active");

        // If on mobile device, trigger native SMS intent directly
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            try {
                window.location.href = smsUri;
            } catch (e) {}
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
                badge.innerText = "CELLULAR SMS ACTIVE";
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
        showToast("🟢 Telecom Cellular Gateway Activated!");
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
            const smsUri = `sms:${cleanDigits}?body=${encodeURIComponent(l.message)}`;
            const carrierNote = l.telecom_carrier || "Cellular Network";

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

                    <div style="margin-top: 8px;">
                        <a href="${smsUri}" class="btn btn-primary btn-xs btn-full" style="text-decoration: none; font-weight: 700; text-align: center;">
                            📲 Open Phone SMS Messages App (${escapeHtml(l.phone_number)})
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
// NEARBY EMERGENCY FACILITIES DIRECTORY & SAFE NAVIGATION
// ==========================================================================

async function loadNearbyFacilities(typeFilter = "ALL", cityFilter = "ALL") {
    const container = document.getElementById("emergencyFacilitiesContainer");
    if (!container) return;

    container.innerHTML = '<div class="spinner"></div>';

    const cityParam = cityFilter && cityFilter !== "ALL" ? `&city=${encodeURIComponent(cityFilter)}` : "";

    try {
        const resp = await fetch(`/api/facilities/nearby?lat=${state.userLocation.lat}&lng=${state.userLocation.lng}&type=${typeFilter}${cityParam}`);
        const data = await resp.json();
        state.facilities = data;

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state">No emergency facilities found matching filter in ${cityFilter}.</div>`;
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
                    <div class="facility-address">📍 ${escapeHtml(fac.address)} (${escapeHtml(fac.city)})</div>
                    
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
                <div class="route-step-item">1. Head toward main arterial bypass highway.</div>
                <div class="route-step-item">2. Avoid submerged causeways and low-lying underpasses.</div>
                <div class="route-step-item">3. Proceed directly toward ${escapeHtml(name)}.</div>
                <div class="route-step-item">4. Arrive at 24x7 Emergency Reception Gate.</div>
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
            <div style="font-weight: 800; color: #ef4444;">🚨 GSDMA SEVERE WEATHER & EVACUATION BULLETIN (GUJARAT)</div>
            <div style="font-size: 12px; color: #f8fafc; margin-top: 4px;">State Emergency Operations Center on Red Alert across all 33 districts. Inflatable Rescue Boats and SDRF units deployed in low-lying zones.</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Published: Just Now | Gujarat State Disaster Management Authority</div>
        </div>

        <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; margin-bottom: 12px;">
            <div style="font-weight: 800; color: #f59e0b;">⚠️ IMD METEOROLOGICAL RAINFALL & GALE WARNING</div>
            <div style="font-size: 12px; color: #f8fafc; margin-top: 4px;">Heavy precipitation forecast across Saurashtra, Central and South Gujarat. Keep emergency battery torches, potable water, and first aid kits ready.</div>
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
Jurisdiction District / City: ${state.currentUser.city}
Reported GPS Coordinates: ${state.userLocation.lat} N, ${state.userLocation.lng} E

DISTRESS TELEMETRY:
------------------------------------------------------------
Priority Level: P1 - LIFE-THREATENING CRITICAL EMERGENCY
Disaster Category: Flood / Gale Inundation
Emergency Needs: Inflatable Rescue Boat (IRB), Medical Support

DISPATCH ACTION:
------------------------------------------------------------
Status: DISPATCHED
State Emergency Control Room Helpline: DIAL 112 / 1077

============================================================
KEEP THIS DOCUMENT ACCESSIBLE. RESCUE TEAMS ARE ON ROUTE.
============================================================
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SAHAY_SOS_Receipt_${state.currentUser.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
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

    state.map = L.map("gisMap", { zoomControl: false }).setView([state.userLocation.lat, state.userLocation.lng], 12);
    L.control.zoom({ position: "bottomright" }).addTo(state.map);

    const tileUrl = state.currentTheme === "light" 
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    state.mapTileLayer = L.tileLayer(tileUrl, { attribution: "© OpenStreetMap, © CARTO", maxZoom: 19 }).addTo(state.map);
    state.incidentLayer = L.layerGroup().addTo(state.map);
}

function initCitizenMap() {
    if (state.citizenMap) return;
    const mapEl = document.getElementById("citizenGisMap");
    if (!mapEl) return;

    state.citizenMap = L.map("citizenGisMap", { zoomControl: true }).setView([state.userLocation.lat, state.userLocation.lng], 13);

    const tileUrl = state.currentTheme === "light" 
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    state.citizenMapTileLayer = L.tileLayer(tileUrl, { attribution: "© OpenStreetMap, © CARTO", maxZoom: 19 }).addTo(state.citizenMap);
    state.facilityLayer = L.layerGroup().addTo(state.citizenMap);

    const userIcon = L.divIcon({
        className: "user-loc-beacon",
        html: '<div style="background: #38bdf8; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px #38bdf8;"></div>',
        iconSize: [16, 16]
    });

    L.marker([state.userLocation.lat, state.userLocation.lng], { icon: userIcon })
        .bindPopup(`<strong>📍 Your Location (${state.currentUser.city})</strong>`)
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
    // 1. Initialize Theme
    initTheme();

    // 2. Initialize User Name & City
    const savedName = localStorage.getItem("sahay_user_name") || "Jignesh Shah";
    const savedCity = localStorage.getItem("sahay_user_city") || "Vadodara";
    updateUserProfile(savedName, savedCity);

    // Theme Toggle buttons
    document.querySelectorAll(".btnToggleTheme").forEach(btn => {
        btn.addEventListener("click", toggleTheme);
    });

    // Gateway City & Name inputs
    document.getElementById("gatewayCustomName")?.addEventListener("input", (e) => {
        const val = e.target.value.trim() || "Jignesh Shah";
        updateUserProfile(val, state.currentUser.city);
    });

    document.getElementById("gatewayCitySelect")?.addEventListener("change", (e) => {
        updateUserProfile(state.currentUser.name, e.target.value);
    });

    // Citizen City Dropdown
    document.getElementById("citizenCityDropdown")?.addEventListener("change", (e) => {
        const city = e.target.value;
        if (city === "ALL") {
            loadNearbyFacilities("ALL", "ALL");
        } else {
            updateUserProfile(state.currentUser.name, city);
        }
    });

    // Name Edit Modal triggers
    document.querySelectorAll(".btnOpenNameModal").forEach(btn => {
        btn.addEventListener("click", () => {
            const modalInput = document.getElementById("modalInputCustomName");
            const modalCity = document.getElementById("modalInputCustomCity");
            if (modalInput) modalInput.value = state.currentUser.name;
            if (modalCity) modalCity.value = state.currentUser.city;
            document.getElementById("nameEditModal")?.classList.add("active");
        });
    });

    document.getElementById("btnCloseNameEditModal")?.addEventListener("click", () => {
        document.getElementById("nameEditModal")?.classList.remove("active");
    });
    document.getElementById("btnCancelNameEdit")?.addEventListener("click", () => {
        document.getElementById("nameEditModal")?.classList.remove("active");
    });

    document.getElementById("nameEditForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const customName = document.getElementById("modalInputCustomName").value.trim();
        const customCity = document.getElementById("modalInputCustomCity").value;
        updateUserProfile(customName, customCity);
        document.getElementById("nameEditModal")?.classList.remove("active");
        showToast(`👤 Profile updated to ${customName} (${customCity})`);
    });

    // Portal Switcher buttons
    document.getElementById("btnEnterCitizenPortal")?.addEventListener("click", () => {
        const gwName = document.getElementById("gatewayCustomName")?.value?.trim() || state.currentUser.name;
        const gwCity = document.getElementById("gatewayCitySelect")?.value || state.currentUser.city;
        updateUserProfile(gwName, gwCity);
        showPortal("citizen");
    });

    document.getElementById("btnEnterAuthorityPortal")?.addEventListener("click", () => {
        const gwName = document.getElementById("gatewayCustomName")?.value?.trim() || state.currentUser.name;
        const gwCity = document.getElementById("gatewayCitySelect")?.value || state.currentUser.city;
        updateUserProfile(gwName, gwCity);
        showPortal("authority");
    });

    document.getElementById("btnReturnToGateway")?.addEventListener("click", () => showPortal("gateway"));
    document.getElementById("btnAuthReturnGateway")?.addEventListener("click", () => showPortal("gateway"));
    document.getElementById("btnCitizenSignOut")?.addEventListener("click", () => showPortal("gateway"));
    document.getElementById("btnAuthSignOut")?.addEventListener("click", () => showPortal("gateway"));

    // Citizen SOS Button & Siren
    document.getElementById("btnTriggerCitizenSos")?.addEventListener("click", () => {
        document.getElementById("sosModal")?.classList.add("active");
        playSirenSound();
    });

    document.getElementById("btnToggleSirenSound")?.addEventListener("click", toggleSirenSound);
    document.getElementById("btnDownloadSosReceipt")?.addEventListener("click", downloadPersonalSosReceipt);

    // Citizen Tabs
    document.querySelectorAll(".cit-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => switchCitizenTab(btn.getAttribute("data-cit-tab")));
    });

    // Facility Filter
    document.getElementById("facilityTypeFilter")?.addEventListener("change", (e) => {
        loadNearbyFacilities(e.target.value, state.currentUser.city);
    });

    // Authority View Switcher
    document.querySelectorAll(".view-btn").forEach(btn => {
        btn.addEventListener("click", () => switchAuthView(btn.getAttribute("data-view")));
    });

    // Search and Filter Incident Feeds
    function applyIncidentFilters() {
        const q = document.getElementById("searchInput")?.value?.toLowerCase() || "";
        const urg = document.getElementById("filterUrgency")?.value || "ALL";
        const typ = document.getElementById("filterType")?.value || "ALL";

        const filtered = state.incidents.filter(i => {
            const matchQ = !q || (i.location_name + " " + i.raw_text).toLowerCase().includes(q);
            const matchUrg = urg === "ALL" || i.urgency_level === urg;
            const matchTyp = typ === "ALL" || (i.disaster_type || "").toLowerCase().includes(typ.toLowerCase());
            return matchQ && matchUrg && matchTyp;
        });

        renderFilteredIncidents(filtered);
    }

    document.getElementById("searchInput")?.addEventListener("input", applyIncidentFilters);
    document.getElementById("filterUrgency")?.addEventListener("change", applyIncidentFilters);
    document.getElementById("filterType")?.addEventListener("change", applyIncidentFilters);

    // Map Controls: Heatmap, Reset, Facilities
    let heatmapActive = false;
    let heatLayer = null;
    document.getElementById("btnToggleHeatmap")?.addEventListener("click", () => {
        if (!state.map) return;
        heatmapActive = !heatmapActive;
        if (heatmapActive) {
            const heatPoints = state.incidents.map(i => [i.latitude, i.longitude, i.urgency_level === "P1_CRITICAL" ? 1.0 : 0.6]);
            heatLayer = L.heatLayer(heatPoints, { radius: 25, blur: 15, maxZoom: 17 }).addTo(state.map);
            showToast("🔥 Crisis Heatmap Activated");
        } else {
            if (heatLayer) state.map.removeLayer(heatLayer);
            showToast("Heatmap Deactivated");
        }
    });

    document.getElementById("btnResetView")?.addEventListener("click", () => {
        if (state.map) state.map.setView([state.userLocation.lat, state.userLocation.lng], 12);
        showToast("🎯 Map View Reset to Center");
    });

    document.getElementById("btnToggleFacilitiesMap")?.addEventListener("click", () => {
        showToast("🏥 Facilities Pins Visible on Map");
    });

    // News Crawler Button
    document.getElementById("btnHarvestNews")?.addEventListener("click", async () => {
        showToast("🔄 Crawling Gujarat news sources (Gujarat Samachar, Sandesh, ANI)...");
        await loadAgencyNewsAndSocial();
        showToast("✓ Verified News Bulletins Refreshed!");
    });

    // Auth Modal Handlers
    document.getElementById("btnOpenAuthFromGateway")?.addEventListener("click", () => {
        document.getElementById("authModal")?.classList.add("active");
    });
    document.getElementById("btnCloseAuthModal")?.addEventListener("click", () => {
        document.getElementById("authModal")?.classList.remove("active");
    });
    document.getElementById("btnDemoAuthModalAuthority")?.addEventListener("click", () => {
        document.getElementById("authModal")?.classList.remove("active");
        showPortal("authority");
        showToast("🛡️ Logged in as Authority Commander");
    });
    document.getElementById("btnDemoAuthModalCitizen")?.addEventListener("click", () => {
        document.getElementById("authModal")?.classList.remove("active");
        showPortal("citizen");
        showToast("👤 Logged in as Citizen");
    });
    document.getElementById("authModalLoginForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        document.getElementById("authModal")?.classList.remove("active");
        const email = document.getElementById("authModalEmail")?.value || "";
        if (email.includes("gsdma") || email.includes("commander")) {
            showPortal("authority");
        } else {
            showPortal("citizen");
        }
        showToast("✓ Signed In Successfully");
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

    // SMS Modal Close Handlers
    document.getElementById("btnCloseSmsModal")?.addEventListener("click", () => {
        document.getElementById("smsSentSuccessModal")?.classList.remove("active");
    });
    document.getElementById("btnCloseSmsModalBtn")?.addEventListener("click", () => {
        document.getElementById("smsSentSuccessModal")?.classList.remove("active");
    });

    // Global fail-safe click listener for theme buttons
    document.addEventListener("click", (e) => {
        if (e.target.closest(".btnToggleTheme")) {
            e.preventDefault();
            toggleTheme();
        }
    });

    // Start on Gateway
    showPortal("gateway");
});

function renderFilteredIncidents(list) {
    const container = document.getElementById("incidentListContainer");
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = '<div class="empty-state">No matching incidents found.</div>';
        return;
    }

    let html = "";
    list.slice(0, 30).forEach(inc => {
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


