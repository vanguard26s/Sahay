# Sahay Command Center

# SAHAY - COMPLETE FRONTEND DEVELOPMENT PROMPT (FINAL)

---

## 📌 INSTRUCTIONS FOR AI

You are an expert React/TypeScript frontend developer. Build **SAHAY** (सहाय), a complete **Multi-Source Disaster Intelligence and Response Support System** for Indian disaster response agencies (NDRF, SDRF, Police, Fire, Medical).

**Core Mission:** Transform overwhelming, unorganized disaster data from social media, news portals, and government APIs into **segregated, categorized, correlated, and actionable intelligence** that enables rapid response.

**Tagline:** *"From Chaos to Command"*

---

## 🔧 TECHNICAL STACK (MANDATORY)

```json
{
  "framework": "React 18+ with TypeScript (strict mode)",
  "buildTool": "Vite",
  "stateManagement": "Redux Toolkit",
  "uiLibrary": "Material-UI (MUI) v5 with Emotion",
  "styling": "Tailwind CSS + MUI Theming",
  "mapping": "Mapbox GL JS (dark theme)",
  "charts": "Recharts",
  "realTime": "Socket.io-client (mock implementation)",
  "apiClient": "Axios",
  "formHandling": "React Hook Form + Zod",
  "testing": "Jest + React Testing Library",
  "icons": "Material-UI Icons + Lucide React",
  "dateHandling": "date-fns",
  "virtualization": "react-window",
  "i18n": "i18next"
}
```

---

## 📁 FOLDER STRUCTURE (MANDATORY - GENERATE ALL)

```
sahay-frontend/
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── incidents.ts
│   │   │   ├── resources.ts
│   │   │   ├── analytics.ts
│   │   │   └── sources.ts
│   │   └── mocks/
│   │       ├── index.ts
│   │       ├── incidents.ts           # 30+ segregated incidents
│   │       ├── resources.ts           # 15+ resources
│   │       ├── sources.ts             # Source correlation data
│   │       ├── analytics.ts
│   │       └── demoScenario.ts        # 10-step demo
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── Cards/
│   │   │   │   ├── IncidentCard.tsx
│   │   │   │   ├── ResourceCard.tsx
│   │   │   │   └── StatsCard.tsx
│   │   │   ├── Charts/
│   │   │   │   ├── IncidentTypeChart.tsx
│   │   │   │   ├── ResponseTimeChart.tsx
│   │   │   │   └── SourceBreakdownChart.tsx
│   │   │   ├── Map/
│   │   │   │   ├── LiveMap.tsx
│   │   │   │   ├── MapMarkers.tsx
│   │   │   │   ├── MapOverlays.tsx
│   │   │   │   └── HeatmapLayer.tsx
│   │   │   ├── Feed/
│   │   │   │   ├── IncidentFeed.tsx
│   │   │   │   ├── FeedFilters.tsx
│   │   │   │   └── SourceBadge.tsx
│   │   │   ├── Segregation/
│   │   │   │   ├── CategoryTabs.tsx
│   │   │   │   ├── SeverityGroup.tsx
│   │   │   │   ├── SourceGroup.tsx
│   │   │   │   └── CorrelationView.tsx
│   │   │   └── UI/
│   │   │       ├── StatusBadge.tsx
│   │   │       ├── ConfidenceMeter.tsx
│   │   │       ├── SeverityIndicator.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── ToastNotification.tsx
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── Login.tsx
│   │       │   ├── ForgotPassword.tsx
│   │       │   └── components/LoginForm.tsx
│   │       ├── dashboard/
│   │       │   ├── Dashboard.tsx
│   │       │   └── components/
│   │       │       ├── StatsWidget.tsx
│   │       │       ├── RecentIncidents.tsx
│   │       │       ├── ResourceSummary.tsx
│   │       │       └── QuickActions.tsx
│   │       ├── incidents/
│   │       │   ├── IncidentList.tsx
│   │       │   ├── IncidentDetail.tsx
│   │       │   └── components/
│   │       │       ├── IncidentFilters.tsx
│   │       │       ├── SourceCorrelation.tsx
│   │       │       ├── ConfidenceTimeline.tsx
│   │       │       └── CorrelationNetwork.tsx
│   │       ├── segregation/
│   │       │   ├── SegregatedDashboard.tsx
│   │       │   └── components/
│   │       │       ├── CategoryDashboard.tsx
│   │       │       ├── SeveritySection.tsx
│   │       │       ├── SourceView.tsx
│   │       │       └── SourceSpecificFeed.tsx
│   │       ├── map/
│   │       │   ├── IncidentMap.tsx
│   │       │   └── components/
│   │       │       ├── MapControls.tsx
│   │       │       └── MapLegend.tsx
│   │       ├── resources/
│   │       │   ├── ResourceDashboard.tsx
│   │       │   ├── ResourceDetail.tsx
│   │       │   └── components/
│   │       │       ├── ResourceFilters.tsx
│   │       │       ├── AIRecommendation.tsx
│   │       │       └── DeploymentModal.tsx
│   │       ├── dispatch/
│   │       │   ├── DispatchConsole.tsx
│   │       │   └── components/
│   │       │       ├── CommandInput.tsx
│   │       │       ├── CommandHistory.tsx
│   │       │       ├── VoiceCommand.tsx
│   │       │       └── ConfirmationDialog.tsx
│   │       ├── analytics/
│   │       │   ├── AnalyticsDashboard.tsx
│   │       │   └── components/
│   │       │       ├── AnalyticsFilters.tsx
│   │       │       ├── KeyInsights.tsx
│   │       │       └── ReportExport.tsx
│   │       └── demo/
│   │           ├── DemoShowcase.tsx
│   │           └── components/
│   │               ├── DemoProgress.tsx
│   │               ├── DemoStep.tsx
│   │               └── DemoComplete.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useIncidents.ts
│   │   ├── useResources.ts
│   │   ├── useMap.ts
│   │   ├── useWebSocket.ts
│   │   ├── useDemo.ts
│   │   ├── useSegregation.ts
│   │   └── useLocalStorage.ts
│   ├── store/
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── incidentSlice.ts
│   │       ├── resourceSlice.ts
│   │       ├── mapSlice.ts
│   │       ├── demoSlice.ts
│   │       ├── segregationSlice.ts
│   │       └── uiSlice.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── incident.types.ts
│   │   ├── resource.types.ts
│   │   ├── map.types.ts
│   │   ├── analytics.types.ts
│   │   ├── demo.types.ts
│   │   ├── segregation.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   ├── colors.ts
│   │   └── segregation.ts
│   ├── theme/
│   │   ├── index.ts
│   │   ├── darkTheme.ts
│   │   └── lightTheme.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── hi.json
│   ├── routes/
│   │   └── index.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── index.html
├── tests/
│   ├── setup.ts
│   └── mocks/server.ts
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🎨 UI/UX DESIGN SPECIFICATIONS

### Color Palette (Dark Mode - Default)

```css
:root {
  /* Primary - Indian Theme */
  --primary-saffron: #FF9933;
  --primary-saffron-dark: #E68200;
  --primary-navy: #1A2A6C;
  --primary-green: #138808;
  
  /* Background */
  --bg-primary: #0A0E17;
  --bg-secondary: #141B2D;
  --bg-card: #1A2236;
  --bg-hover: #24304A;
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  
  /* Status */
  --status-critical: #EF4444;
  --status-high: #F97316;
  --status-medium: #EAB308;
  --status-low: #22C55E;
  --status-resolved: #3B82F6;
  
  /* Disaster Types */
  --flood: #3B82F6;
  --fire: #EF4444;
  --cyclone: #8B5CF6;
  --earthquake: #F97316;
  --landslide: #92400E;
  --drought: #EAB308;
  --industrial: #6B7280;
  --epidemic: #EC4899;
  
  /* Sources */
  --source-twitter: #1DA1F2;
  --source-news: #FF6B35;
  --source-citizen: #4CAF50;
  --source-govt: #FF9933;
  --source-iot: #00BCD4;
  
  /* Border & Shadow */
  --border-color: #2A3A5C;
  --shadow-color: rgba(0, 0, 0, 0.5);
}
```

### Typography

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing System (8px grid)
```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### Border Radius
```
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-2xl: 24px
--radius-full: 9999px
```

---

## 📋 COMPLETE FEATURE REQUIREMENTS

---

### FEATURE 1: AUTHENTICATION (MUST HAVE)

**File:** `src/features/auth/Login.tsx`

**UI Requirements:**
- Sahay logo with tagline "From Chaos to Command"
- Dark gradient background with subtle Indian flag tricolor accents
- Email input with validation
- Password input with show/hide toggle
- "Remember Me" checkbox
- Agency dropdown: NDRF, SDRF, Police, Fire, Medical, Admin
- Login button with loading state
- "Forgot Password?" link
- Language switcher (Hindi/English)
- Version number in footer

**Mock Credentials:**
```javascript
// Accept any valid email format
// Password: Any 8+ characters
// Demo accounts:
admin@sahay.gov.in / Admin@123
commander@sahay.gov.in / Commander@123
analyst@sahay.gov.in / Analyst@123
field@sahay.gov.in / Field@123
```

**Validation Schema:**
```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  agency: z.string().min(1, 'Please select your agency'),
  rememberMe: z.boolean().optional()
});
```

---

### FEATURE 2: DASHBOARD (MUST HAVE)

**File:** `src/features/dashboard/Dashboard.tsx`

**Layout:** 4-Quadrant Grid

**Quadrant 1: Stats Widget**
```typescript
interface DashboardStats {
  activeIncidents: number;
  criticalIncidents: number;
  highIncidents: number;
  mediumIncidents: number;
  lowIncidents: number;
  totalResources: number;
  availableResources: number;
  deployedResources: number;
  averageResponseTime: string;
  affectedPopulation: number;
  sourceCount: {
    twitter: number;
    news: number;
    citizen: number;
    govt: number;
    iot: number;
  };
}
```

**Quadrant 2: Incident Type Chart**
- Donut chart showing distribution by disaster type
- Colors: Flood=Blue, Fire=Red, Cyclone=Purple, Earthquake=Orange, Landslide=Brown, etc.
- Click on segment → Filter feed by that type

**Quadrant 3: Recent Incident Feed**
- 5 most recent incidents
- Clickable cards opening detail view
- Status badges with colors
- "View All" link to Incident List

**Quadrant 4: Resource Summary & Quick Actions**
- Available vs Deployed resources
- Quick action buttons:
  - 🚨 Create Incident
  - 🚁 Dispatch Resources
  - 📢 Send Public Alert
  - 📄 Generate Report

**NEW: Category Quick-View Bar**
- Row showing counts: 🔴 Critical (12) | 🟠 High (28) | 🟡 Medium (45) | 🔵 Low (156)
- Click any → Navigate to Segregated Dashboard with that filter

**Real-time Updates:**
- Stats update every 5 seconds via mock WebSocket
- New incidents appear with bounce animation
- Toast notification for critical incidents

---

### FEATURE 3: SEGREGATED DASHBOARD (MUST HAVE - NEW)

**File:** `src/features/segregation/SegregatedDashboard.tsx`

**Purpose:** Display all information segregated by category for easy agency consumption.

**Layout:**
```
+=================================================================+
| 📂 SEGREGATED INTELLIGENCE - 247 total items                   |
| [Search: ______] [Filter: All ▼] [Date: ______]               |
+=================================================================+
| Category Tabs:                                                  |
| [ALL 247] [CRITICAL 12] [HIGH 28] [MEDIUM 45] [LOW 156]       |
| [NEWS 23] [SOCIAL 890] [GOVT 12] [CITIZEN 87] [IoT 189]       |
+=================================================================+
|                                                                 |
| 🔴 CRITICAL INCIDENTS (12)                                     |
| [─────────────────────────────────────────────────────────────] |
| | INC-104 | FLOOD | Sector 4, Ahmedabad | 94% | 2 mins ago | |
| | INC-105 | CYCLONE | Coastal Gujarat   | 92% | 5 mins ago | |
| | INC-106 | EARTHQUAKE | Kutch, Gujarat | 88% | 12 mins ago | |
| └─────────────────────────────────────────────────────────────┘ |
| [ View All Critical → ]                                         |
|                                                                 |
| 🟠 HIGH SEVERITY (28)                                          |
| [─────────────────────────────────────────────────────────────] |
| | INC-107 | FIRE | Mumbai Suburbs | 78% | 15 mins ago       | |
| | INC-108 | LANDSLIDE | Himachal | 75% | 22 mins ago        | |
| └─────────────────────────────────────────────────────────────┘ |
| [ View All High → ]                                             |
|                                                                 |
| 🟡 MEDIUM SEVERITY (45)                                        |
| ...                                                            |
|                                                                 |
| 🔵 LOW SEVERITY (156)                                          |
| ...                                                            |
+=================================================================+
| 📊 Source Breakdown: Twitter 45% | News 20% | Citizen 15% |    |
| Govt API 12% | IoT 8%                                          |
+=================================================================+
```

**Components:**
1. **CategoryTabs** - Toggle between views (All, Critical, High, Medium, Low, News, Social, Govt, Citizen, IoT)
2. **SeverityGroup** - Collapsible sections for each severity level
3. **SourceGroup** - View incidents by source type
4. **SearchBar** - Full-text search across all incidents
5. **DateFilter** - Filter by date range

---

### FEATURE 4: INCIDENT MANAGEMENT (MUST HAVE)

**Files:**
- `src/features/incidents/IncidentList.tsx`
- `src/features/incidents/IncidentDetail.tsx`

#### A. Incident Types
```typescript
type DisasterType = 
  | 'FLOOD' 
  | 'FIRE' 
  | 'CYCLONE' 
  | 'EARTHQUAKE' 
  | 'LANDSLIDE' 
  | 'DROUGHT' 
  | 'INDUSTRIAL' 
  | 'EPIDEMIC';

type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type IncidentStatus = 'REPORTED' | 'VERIFIED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED' | 'FALSE_ALARM';
type SourceType = 'TWITTER' | 'NEWS' | 'CITIZEN' | 'GOVT_API' | 'IOT';
```

#### B. Incident Data Model
```typescript
interface Incident {
  id: string;
  title: string;
  type: DisasterType;
  severity: SeverityLevel;
  status: IncidentStatus;
  confidence: number; // 0-100
  sourceCount: number;
  sources: Source[];
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
    state: string;
    district: string;
  };
  summary: string; // AI-generated
  timestamp: string;
  affectedPopulation?: number;
  resourcesDeployed?: string[];
  images?: string[];
  correlationData?: CorrelationData;
}

interface Source {
  id: string;
  type: SourceType;
  content: string;
  url?: string;
  credibility: number; // 0-100
  timestamp: string;
  metadata?: {
    author?: string;
    location?: string;
    media?: string[];
  };
}

interface CorrelationData {
  incidentId: string;
  sources: {
    id: string;
    type: SourceType;
    content: string;
    confidence: number;
    connections: string[]; // Source IDs it correlates with
  }[];
  overallConfidence: number;
  timeline: {
    step: number;
    source: string;
    action: string;
    timestamp: string;
  }[];
}
```

#### C. Incident Feed Features
- **Virtualized List** using `react-window` for performance
- **Two Views:** Table View (compact) and Card View (visual)
- **Real-time updates** via mock WebSocket
- **Infinite scroll** with pagination

#### D. Filters
```typescript
interface IncidentFilters {
  types: DisasterType[];
  severities: SeverityLevel[];
  sources: SourceType[];
  statuses: IncidentStatus[];
  states: string[];
  districts: string[];
  dateRange: { start: Date | null; end: Date | null };
  confidenceRange: { min: number; max: number };
  keyword: string;
  sortBy: 'timestamp' | 'confidence' | 'severity';
  sortOrder: 'asc' | 'desc';
}
```

#### E. Incident Detail Modal
- AI-generated summary
- **Source Correlation Timeline** - Visual timeline showing how each source was added
- **Confidence Score Breakdown** - Show confidence growth over time
- **Correlation Network Graph** - Visual network connecting all sources
- **Map View** - Location on map
- **Status Flow** - Click to update status (Reported → Verified → En-Route → On-Scene → Resolved)
- **Dispatch Resources** - Button to open resource deployment
- **Source Previews** - Expandable source cards with credibility scores

---

### FEATURE 5: SOURCE CORRELATION & VERIFICATION (MUST HAVE - NEW)

**File:** `src/features/incidents/components/CorrelationNetwork.tsx`

**Purpose:** Visually show how multiple sources correlate to form a verified incident.

**UI:**
```
+=================================================================+
| 🔗 SOURCE CORRELATION - INCIDENT #104                         |
| 94% CONFIDENCE | FLOOD | SECTOR 4, AHMEDABAD                 |
+=================================================================+
|                                                                 |
|   🌊 IMD ALERT         📰 TIMES OF INDIA    🐦 TWEET (x3)    |
|   [10:30 AM]           [10:32 AM]           [10:35 AM]        |
|   Govt API             News Article          Social Media     |
|   (100% trust)         (85% trust)          (65% trust)      |
|         \                    |                   /             |
|          \                   |                  /              |
|           \     🧠 AI CORRELATION ENGINE     /               |
|            \         (94% Confidence)        /                |
|             \              |                /                 |
|              \             |               /                  |
|               👤 CITIZEN REPORT  📡 IoT SENSOR                |
|               [10:38 AM]        [10:40 AM]                    |
|               Photo Upload      Water Level: CRITICAL        |
|               (75% trust)       (95% trust)                   |
|                                                                 |
|   ✅ ALL 4 SOURCES CORRELATE → VERIFIED INCIDENT             |
|   📍 Location: Sector 4, Ahmedabad                           |
|   🚨 Action Required: Dispatch rescue team                   |
|                                                                 |
|   [ VERIFY INCIDENT ] [ DISPATCH RESOURCES ] [ CLOSE ]       |
+=================================================================+
```

**Features:**
- Visual network graph connecting all sources
- Source cards with content previews
- Credibility scores for each source
- Confidence score animation
- Timeline of source addition
- One-click verification

---

### FEATURE 6: SOURCE-SPECIFIC VIEWS (MUST HAVE - NEW)

**File:** `src/features/segregation/components/SourceView.tsx`

**Purpose:** Allow agencies to view information by source type.

**Layout:**
```
+=================================================================+
| 📰 NEWS ARTICLES (23 articles)                                 |
| 🔍 Search: [flood]    📅 Filter: [Last 24h]                   |
+=================================================================+
| 📰 Times of India - "Severe flooding in Gujarat"              |
|    Published: 10:32 AM | Trust: 85%                          |
|    Summary: Gujarat faces worst floods in 50 years...         |
|    Matches: Incident INC-104 (94% confidence)                 |
|    [ VIEW DETAIL ] [ MARK AS SOURCE ]                         |
+-----------------------------------------------------------------+
| 📰 NDTV - "Cyclone alert for coastal Maharashtra"             |
|    Published: 10:15 AM | Trust: 82%                          |
|    Summary: Cyclone 'Biparjoy' to make landfall...            |
|    Matches: Incident INC-105 (88% confidence)                 |
|    [ VIEW DETAIL ] [ MARK AS SOURCE ]                         |
+-----------------------------------------------------------------+
| 📰 The Hindu - "Earthquake tremors felt in Delhi-NCR"         |
|    Published: 9:45 AM | Trust: 80%                           |
|    Summary: 4.2 magnitude earthquake...                       |
|    Matches: Incident INC-106 (72% confidence)                 |
|    [ VIEW DETAIL ] [ MARK AS SOURCE ]                         |
+-----------------------------------------------------------------+
```

**Source Types:**
1. **News Articles** - Aggregated from NDTV, TOI, The Hindu, Google News
2. **Social Media** - Twitter/X, Facebook, Instagram
3. **Government Alerts** - IMD, INCOIS, NDMA
4. **Citizen Reports** - Geo-tagged submissions with photos
5. **IoT Sensors** - Water level, seismic, weather sensors

---

### FEATURE 7: LIVE DISASTER MAP (MUST HAVE)

**File:** `src/features/map/IncidentMap.tsx`

**Map Configuration:**
- Library: Mapbox GL JS (dark theme)
- Default center: 20.5937, 78.9629 (India)
- Zoom: 5 (country view)
- Min zoom: 4, Max zoom: 15

**Map Layers:**
1. **Base Layer** - Dark map
2. **Incident Markers** - Custom SVG by type (Flood=Blue droplet, Fire=Red flame, Cyclone=Purple, Earthquake=Orange)
3. **Resource Markers** - Boat=⛵, Ambulance=🚑, Fire Truck=🚒, Drone=🛸
4. **Heatmap Layer** - Social media activity density
5. **Blocked Roads** - Red dashed lines from NHAI data
6. **Relief Camps** - Green tent icons
7. **Flood Zones** - Semi-transparent blue overlay
8. **Cyclone Path** - Animated dotted line
9. **Safe Routes** - Green highlighted paths

**Filter by Category on Map:**
- Toggle visibility of incident types
- Toggle visibility of severity levels
- Toggle visibility of sources

**Marker Interactions:**
- Click → Popup with incident preview
- Click popup → Open Incident Detail
- Hover → Tooltip with type/severity
- Cluster markers at zoom < 10

**Map Controls:**
- Zoom in/out
- Current location
- Fullscreen toggle
- Layer toggle panel
- Legend
- Search by location/pincode
- Screenshot

---

### FEATURE 8: RESOURCE CENTER (MUST HAVE)

**Files:**
- `src/features/resources/ResourceDashboard.tsx`
- `src/features/resources/ResourceDetail.tsx`

#### A. Resource Data Model
```typescript
interface Resource {
  id: string;
  name: string;
  type: 'BOAT' | 'AMBULANCE' | 'FIRE_TRUCK' | 'RESCUE_VEHICLE' | 'DRONE' | 'HELICOPTER' | 'PERSONNEL';
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'OFFLINE' | 'MAINTENANCE';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  agency: 'NDRF' | 'SDRF' | 'POLICE' | 'FIRE' | 'MEDICAL';
  capacity?: number;
  equipment?: string[];
  distanceToNearestIncident?: string;
  deployedTo?: string;
  contactNumber?: string;
  lastMaintenance?: string;
}
```

#### B. Resource Dashboard
- Grid view of resource cards
- Filter by type, status, agency
- Search by name/ID
- **NEW: Resources segregated by type and availability**

#### C. AI Recommendation Widget
```typescript
interface Recommendation {
  incidentId: string;
  incidentType: string;
  incidentLocation: string;
  resources: {
    type: ResourceType;
    count: number;
    suggestedIds: string[];
    distance: string;
    reason: string;
    confidence: number;
  }[];
  rationale: string;
}
```

#### D. Deployment Flow
1. Select resources (manual or AI recommended)
2. Click "Dispatch"
3. Confirmation modal appears
4. Confirm → Resources status changes to EN_ROUTE
5. ETA displayed on map
6. Real-time status updates

---

### FEATURE 9: AI DISPATCH CONSOLE (MUST HAVE)

**File:** `src/features/dispatch/DispatchConsole.tsx`

**Layout:**
```
+===============================================================+
| 🤖 AI COMMAND CENTER                    🎤 Voice | Clear | Export |
+===============================================================+
| [Command History - Scrollable]                               |
|                                                               |
| Officer: "Show me all flood incidents in Gujarat"           |
| AI: 🔍 Found 3 flood incidents in Gujarat:                 |
|     • INC-104: Sector 4, Ahmedabad (CRITICAL)              |
|     • INC-105: Sector 7, Surat (HIGH)                      |
|     • INC-106: Sector 2, Vadodara (MEDIUM)                |
|                                                               |
| Officer: "Dispatch 2 boats to Sector 4"                    |
| AI: 🤔 Parsing command...                                  |
|     ✅ Confirmed: Dispatch 2 RESCUE BOATS to INC-104      |
|     📍 Sector 4, Ahmedabad                                |
|     🚤 Boat-07 (1.2 km), Boat-12 (2.1 km)               |
|     ⏱️ ETA: 8 minutes                                    |
|                                                               |
| [ ✅ CONFIRM ]  [ ❌ CANCEL ]  [ ✏️ MODIFY ]                |
|                                                               |
| Officer: "Confirm"                                           |
| AI: ✅ 2 boats dispatched!                                 |
|     Boat-07: EN-ROUTE (ETA: 8 mins)                       |
|     Boat-12: EN-ROUTE (ETA: 10 mins)                      |
|                                                               |
+===============================================================+
| [ Type a command... ]                        [ Send ] 🎤   |
+===============================================================+
```

**Supported Commands:**
```typescript
"DISPATCH <count> <resource_type> to <location/incident>"
"SHOW <filter> incidents in <location>"
"UPDATE incident <id> to <status>"
"WHAT resources are available in <location>?"
"CREATE new incident in <location> - <description>"
"CANCEL dispatch <id>"
"RESOLVE incident <id>"
```

**Voice Command:**
- Microphone button with Web Speech API
- Real-time speech-to-text
- Visual feedback during recording
- Fallback to text input

---

### FEATURE 10: ANALYTICS DASHBOARD (MUST HAVE)

**File:** `src/features/analytics/AnalyticsDashboard.tsx`

**Layout:**
```
+=================================================================+
| 📈 ANALYTICS DASHBOARD                                         |
| [📅 Oct 1-31, 2024] [📊 Export PDF] [📋 Export Excel]         |
+=================================================================+
| 📊 INCIDENT BY TYPE & SEVERITY (Stacked Bar Chart)            |
| 📈 RESPONSE TIME TREND (Line Chart with target)               |
| 📊 SOURCE BREAKDOWN (Donut Chart)                             |
| 📈 RESOURCE UTILIZATION (Horizontal Bar Chart)                |
| 🔥 INCIDENT DENSITY MAP (Map with heatmap)                    |
| 📋 KEY INSIGHTS                                               |
| ✅ 85% of incidents verified within 3 minutes                |
| 🔴 Twitter had 40% false reports - needs filtering           |
| 🟢 94% affected population reached within 4 hours            |
+=================================================================+
```

**NEW - Segregation Analytics:**
- Source breakdown by category
- Category trends over time
- Response time by severity
- Resource utilization by type

**Report Export:**
- PDF generation (jsPDF + html2canvas)
- Excel export (SheetJS/xlsx)
- Report templates: Standard, Executive, Detailed

---

### FEATURE 11: DEMO SHOWCASE (MUST HAVE)

**File:** `src/features/demo/DemoShowcase.tsx`

**Demo Button:** "🎯 Start Demo" in header

**10-Step Scripted Scenario:**
```typescript
const DEMO_STEPS = [
  { step: 1, title: "Extreme Rainfall Detected", 
    description: "IMD API detects 120mm/hr rainfall near Sector 4",
    icon: "🌧️", duration: 3000 },
  { step: 2, title: "Citizen Report Received", 
    description: "Citizen reports rising water at Sector 4 bridge",
    icon: "📱", duration: 3000 },
  { step: 3, title: "IoT Sensor Confirms", 
    description: "Water level sensor WL-07 reports CRITICAL",
    icon: "📡", duration: 3000 },
  { step: 4, title: "AI Correlates Sources", 
    description: "3 sources correlated → 94% confidence",
    icon: "🧠", duration: 3000 },
  { step: 5, title: "Critical Incident Created", 
    description: "System auto-creates flood incident INC-104",
    icon: "📋", duration: 3000 },
  { step: 6, title: "Incident on Live Map", 
    description: "Critical marker appears at Sector 4",
    icon: "🗺️", duration: 3000 },
  { step: 7, title: "AI Recommends Resources", 
    description: "2 Rescue Boats + 1 Ambulance recommended",
    icon: "🚤", duration: 3000 },
  { step: 8, title: "Officer Confirms Dispatch", 
    description: "Dispatch officer confirms recommendation",
    icon: "✅", duration: 3000 },
  { step: 9, title: "Resources En-Route", 
    description: "2 boats and 1 ambulance dispatched",
    icon: "🚁", duration: 3000 },
  { step: 10, title: "Incident Resolved", 
    description: "All resources on scene, resolved successfully!",
    icon: "🎯", duration: 3000 }
];
```

**Demo Features:**
- Progress bar with step counter
- Auto-advancing with animations
- Real-time UI updates (feed, map, console, confidence)
- Pause/Resume button
- Restart button
- Completion celebration (confetti)

---

### FEATURE 12: MULTI-LANGUAGE SUPPORT (MUST HAVE)

**Languages:**
- 🇬🇧 English (default)
- 🇮🇳 Hindi (हिंदी)
- 🇮🇳 Tamil (தமிழ்)
- 🇮🇳 Telugu (తెలుగు)
- 🇮🇳 Bengali (বাংলা)
- 🇮🇳 Marathi (मराठी)

**Implementation:**
- i18next for internationalization
- Language switcher in header
- Translation files for all UI text
- AI-generated content translation support

---

## 🗃️ MOCK DATA REQUIREMENTS

### Mock Incidents (30+)
Generate incidents covering all types, severities, statuses, and states.

**Distribution:**
- Critical: 5
- High: 8
- Medium: 10
- Low: 12
- False Alarms: 2

**Types Distribution:**
- Flood: 8
- Fire: 5
- Cyclone: 4
- Earthquake: 3
- Landslide: 3
- Drought: 3
- Industrial: 2
- Epidemic: 2

**States:** Delhi, Maharashtra, Gujarat, Tamil Nadu, Karnataka, UP, West Bengal, Rajasthan, Kerala, Bihar

### Mock Resources (15+)
- Boats: 4
- Ambulances: 4
- Fire Trucks: 3
- Rescue Vehicles: 2
- Drones: 2
- Helicopters: 1
- Personnel: 2

### Mock Sources
- Twitter: 100+ tweets with varying credibility (50-80%)
- News: 20+ articles (80-90%)
- Citizen: 30+ reports (70-85%)
- Govt APIs: 10+ alerts (100%)
- IoT: 15+ sensor readings (90-95%)

### Demo Scenario Data
Complete 10-step script with all data pre-generated for seamless demo.

---

## 🎯 PERFORMANCE REQUIREMENTS

### Targets
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1

### Optimization Strategies
- Code splitting with `React.lazy()` and `Suspense`
- Virtualized lists with `react-window`
- Image optimization (lazy loading, WebP)
- Memoization (`useMemo`, `useCallback`)
- Debouncing search inputs
- Throttling real-time updates

---

## ♿ ACCESSIBILITY REQUIREMENTS

- **WCAG 2.1 AA Compliance**
- Minimum 4.5:1 color contrast
- Keyboard navigation support
- ARIA labels on all interactive elements
- Focus indicators on all interactive elements
- Screen reader support
- `prefers-reduced-motion` support

---

## 📦 DELIVERABLES

### Complete Codebase (MUST PROVIDE)
- [ ] All source code in `src/` folder
- [ ] Complete TypeScript types
- [ ] Mock data and API service
- [ ] Unit tests (20%+ coverage)
- [ ] README.md with setup instructions

### Configuration Files
- [ ] `package.json` with dependencies
- [ ] `vite.config.ts`
- [ ] `tsconfig.json`
- [ ] `tailwind.config.js`
- [ ] `.eslintrc.js`
- [ ] `.prettierrc`

### Environment Variables
```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_APP_NAME=Sahay
VITE_APP_ENV=development
```

### README.md
```markdown
# Sahay - Multi-Source Disaster Intelligence & Response Support System

## Setup
1. Clone repository
2. npm install
3. npm run dev
4. Open http://localhost:5173

## Features
- Authentication with agency roles
- Segregated intelligence dashboard
- Incident management with source correlation
- Live disaster map
- Resource management with AI recommendations
- AI Dispatch Console with voice commands
- Analytics with report export
- 30-second demo showcase

## Tech Stack
- React 18 + TypeScript
- Redux Toolkit
- Material-UI v5
- Mapbox GL JS
- Recharts
```

---

## 🎯 FINAL SUMMARY

Build **SAHAY** - a complete, production-ready disaster intelligence dashboard with:

1. **Aggregation** - Pull data from Twitter, News, Citizen Reports, Govt APIs, IoT
2. **Segregation** - Organize by disaster type, severity, source, status, geography, time
3. **Correlation** - Connect sources, build confidence scores, verify incidents
4. **Visualization** - Dashboard, Map, Feed, Charts, Network Graphs
5. **Action** - Dispatch resources, send alerts, update status, generate reports
6. **Demo** - 30-second showcase demonstrating end-to-end workflow

**Design:** Dark theme, tactical, professional, responsive, accessible

**Deliverables:** Complete React/TypeScript application with all features, mock data, and comprehensive documentation

---

*Build SAHAY - Where information becomes intelligence, and intelligence becomes action.*

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sahay-command-center.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3e3d042b-ff49-4114-8abb-af192c10a7a8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
