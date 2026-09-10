<!-- converted from DEEPSYNC_PRD.docx -->


DEEPSYNC
Project Description Document
3D Ocean Data Visualization Platform
Problem Statement PS 26067 · Indian National Centre for Ocean Information Services (INCOIS)
Smart India Hackathon 2025
Team BLUEGEN_606 (Team ID 64585)
Document status: Planning stage — no implementation has begun

# 1. Project About
## 1.1 Background
India's vast Exclusive Economic Zone (EEZ) and coastline require continuous, high-resolution monitoring of ocean state variables. INCOIS generates and archives large volumes of ocean model output — three-dimensional fields of temperature, salinity, current vectors, and chlorophyll — alongside real-time and delayed-mode observations from Argo floats and underwater Gliders. No existing tool lets forecasters co-visualize model output and instrument data in a single interactive 3D web environment; today they must switch between disparate, often desktop-bound, 2D-only software packages.
## 1.2 Project Vision
DEEPSYNC is a browser-native, production-grade platform that renders live ocean model fields as an interactive 3D scene, overlays real instrument data (Argo floats, Gliders, CTD, BGC) on that scene, and provides a rich analytical suite of 2D charts, a dedicated 2D geo-map path viewer, and a natural-language AI Assistant — all built on an extensible, plugin-based ingestion architecture so new sensors, variables, and data products can be added without re-engineering the system.
## 1.3 Who Uses It
- Operational forecasters and oceanographers — full analytical Dashboard, correlation and derived-variable charts.
- General public, students, and policymakers — the public Geo Map and AI Assistant, requiring no login.
- Platform administrators — Data Manager (ingestion, user approval) and Profile & Settings (hazard advisories, account management), both role-gated.
## 1.4 Document Status
This document, and the accompanying SRS, describe the fully planned architecture as of the current design pass. No code has been implemented yet — this is the specification that implementation will follow.
# 2. Deliverables
Deliverables are classified by how directly they are stated in the problem statement. Primary items are the PS's own "Core functional requirements"; Secondary items are compliance/outcome layers built on top of them; Tertiary items are value-add extensions the team chose to build beyond the PS's minimum ask.
## 2.1 Primary Deliverables
## 2.2 Secondary Deliverables
## 2.3 Tertiary Deliverables

# 3. Visualization Planned & Required Data
## 3.1 3D Visualizations
- Point-cloud rendering of the live ocean model grid (WebGL / Three.js)
- Isosurface extraction (marching cubes) at a user-chosen threshold
- Full volumetric ray-marched rendering as an alternative to the point cloud
- Animated current streamlines, replacing static vector points
- Float/glider trajectory rendering from historical position fixes
- Hazard zone overlay (tsunami / high-wave / PFZ), inspired by INCOIS's own SARAT tool
- Point-query tool — click open water to interpolate model values with no physical instrument present
- Region-of-interest selection and a time slider with play/pause animation
## 3.2 Variables Required — 3D Layer
## 3.3 2D Analytical Charts
All eight chart types live behind a single ChartTypeSelector in Dashboard's 2D Data Analysis zone.
## 3.4 Geo Map Visualization
A dedicated 2D tile map (pan/zoom) plotting every Argo float and Glider's historical path as a polyline, with color-coded, clickable markers opening an instrument detail panel — reusing the same profile-chart rendering as Dashboard.
## 3.5 AI Assistant Visualization
Natural-language queries are answered with a text summary and, where relevant, an automatically chosen chart from the same eight types listed above, rendered inline in the chat by reusing existing chart components rather than any new rendering logic.

# 4. Tech Stack
# 5. Application Flow
Four flows govern how data and users move through the system: data ingestion (admin), public visitor access, an AI Assistant query, and admin authentication. All flows converge on the same Postgres store, so data ingested once is immediately visible everywhere it is used.


# 6. Database Schema Diagram
Seven entities back the platform. ArgoFloatEntity is the hub of the instrument data model: it owns a one-to-many relationship to both ProfileSampleEntity (depth-resolved readings) and FloatPositionEntity (position fixes over time, added specifically to support trajectory and path-based visualizations). All other entities are independent.


# 7. Web Application Tree & Component Map
The application has seven top-level pages. Two (Data Manager, Profile & Settings) are role-gated to administrators, both server-side (Spring Security) and client-side (route guard).

## 7.1 Page-by-Page Component Breakdown

# 8. Module Structure — Tree View
## 8.1 Backend (Spring Boot)

## 8.2 Frontend (React)
## 8.3 Sidecar / Infrastructure
| Deliverable | Description |
| --- | --- |
| 3D Volumetric Rendering Engine | Depth-slice views, isosurface extraction, full volumetric shading, and time-step animation of live ocean model fields (temperature, salinity, current vectors, chlorophyll). |
| In-Situ Data Visualization Module | Geospatially accurate overlay of Argo float, Glider, CTD, and BGC data with click-to-inspect depth-vs-variable profile charts. |
| Multi-Format Data Ingestion Pipeline | Automated parsers for NetCDF (CF-convention) and delimited ASCII formats, behind a plugin-style registry. |
| Interactive Control Panel | Variable selector, dynamic colorbar editor, layer opacity, vertical exaggeration, and depth-slice controls. |
| Lightweight API Backend | REST backend serving processed data, plus OPeNDAP access to raw files via a THREDDS sidecar. |
| Extensible Plugin Architecture | New parsers, sensor types, and ML-derived products (e.g. Mixed Layer Depth) can be added without touching existing code. |
| Deliverable | Description |
| --- | --- |
| OGC Web Services (WMS/WCS) | Served via a GeoServer sidecar configured against the same model data store. |
| CF Conventions Compliance | Validated at ingestion time before a NetCDF file is accepted. |
| Operational Forecaster Dashboard | The emergent outcome of the Primary components working together — not a separate build. |
| Deliverable | Description |
| --- | --- |
| Public Accessibility | Dashboard, Geo Map, and AI Assistant are open to any visitor without login — realized through the Geo Map path viewer and the AI Assistant chat interface. |
| Deployment Package | Dockerfiles for backend and frontend, orchestrated with Postgres, THREDDS, and GeoServer via Docker Compose. |
| Documentation | Architecture and API reference plus user manuals, tracked as a deliverable rather than a code module. |
| Variable | Unit | Source field | Upstream data source |
| --- | --- | --- | --- |
| Temperature | °C | OceanGridPointEntity.temperatureC | LAS INCOIS, Copernicus Marine |
| Salinity | PSU | OceanGridPointEntity.salinityPsu | LAS INCOIS, Copernicus Marine |
| Current vectors (U, V) | m/s | OceanGridPointEntity.currentU / currentV | LAS INCOIS, Copernicus Marine |
| Chlorophyll | mg/m³ | OceanGridPointEntity.chlorophyll | LAS INCOIS, Copernicus Marine |
| Depth | m | OceanGridPointEntity.depthMeters | All model sources |
| Timestamp | ISO-8601 | OceanGridPointEntity.timestamp | All model sources |
| Hazard zones | type/region/severity | HazardAdvisoryEntity | Admin-entered via Settings |
| Float/glider position history | lat/lon over time | FloatPositionEntity | Argo Global, Glider (Ifremer) |
| Chart | Axes / Encoding | Backing data |
| --- | --- | --- |
| Depth Profile | Depth (Y) vs Temp / Salinity / Current U-V / Chlorophyll / MLD | ProfileSampleEntity |
| Correlation (SST × Chl-a) | Temperature vs Chlorophyll | OceanGridPointEntity |
| Correlation (MLD × SST) | Computed MLD vs Temperature | derived.MldCalculatorService + OceanGridPointEntity |
| T-S Diagram | Salinity (X) vs Temperature (Y), Depth as color | ProfileSampleEntity |
| Distribution / Histogram | Frequency of any variable across the loaded grid | OceanGridPointEntity (client-computed) |
| Time Series | A variable at fixed depth vs Time | ProfileSampleEntity (multi-timestamp history) |
| Hovmöller Diagram | Depth (Y) vs Time (X), color = variable intensity | ProfileSampleEntity (multi-timestamp history) |
| Along-track Section | Distance-along-path (X) vs Depth (Y), color = variable | FloatPositionEntity + ProfileSampleEntity (correlated by service.AlongTrackSectionService) |
| Current Rose | Current direction (radial) vs magnitude, over time | OceanGridPointEntity (point + time history) |
| Layer | Technology |
| --- | --- |
| Backend framework | Spring Boot 3 (Java 17), Maven |
| NetCDF parsing | Unidata netcdf-java (cdm-core) — CF-convention model output reader |
| ASCII/delimited parsing | Apache Commons CSV |
| Database | PostgreSQL via Spring Data JPA (Hibernate) |
| Authentication | JWT (stateless), Spring Security |
| Raw data access | THREDDS Data Server (OPeNDAP) |
| OGC compliance | GeoServer (WMS/WCS) |
| AI / natural language | External LLM API for intent extraction (AI Assistant) |
| API documentation | springdoc-openapi (Swagger UI) |
| Frontend framework | React + Vite |
| 3D rendering | Three.js via @react-three/fiber and @react-three/drei |
| 2D mapping | Web-map tile library (Leaflet-class) for the Geo Map page |
| Charting | Chart.js / react-chartjs-2 |
| State management | Zustand |
| HTTP client | Axios |
| Local dev infrastructure | Docker Compose (Postgres, THREDDS, GeoServer) |
| Page | Access | Key components |
| --- | --- | --- |
| Home | Public | Hero, QuickAccessNav, LiveMetricsPanel, CapabilitiesGrid, MiniOceanPreview, DataSourcesPanel, RecentActivityFeed, Documentation links, Footer |
| Dashboard | Public | Single continuous page in two zones — 3D Volumetric View (scene + all overlays + control panel) and 2D Data Analysis (FloatSelector + 8-chart ChartTypeSelector) |
| Geo Map | Public | MapFilterPanel, 2D tile map, GeoTrajectoryLayer (path polylines), FloatGliderMarkers, InstrumentDetailPanel on click |
| AI Assistant | Public | Chat interface — ChatMessageList, ChatChartRenderer (inline charts), SuggestedQueryChips, ChatInputBar |
| Data Manager | Admin only | PendingApprovalsList, UploadPanel, ParserRegistryList, IngestionStatusLog |
| Profile & Settings | Admin only | Account details + password change, HazardAdvisoryManager (CRUD), Data source status panel |
| Login / Signup | Public | Admin sign-in; signup creates an inactive account pending an existing admin's approval |
| com.deepsync.backend/
├── DeepsyncApplication.java
├── config/
│   ├── CorsConfig.java
│   ├── DataSeeder.java
│   └── OpenApiConfig.java
├── security/
│   ├── SecurityConfig.java
│   ├── JwtService.java
│   └── JwtAuthFilter.java
├── entity/
│   ├── OceanGridPointEntity.java
│   ├── ArgoFloatEntity.java
│   ├── ProfileSampleEntity.java
│   ├── FloatPositionEntity.java
│   ├── UserEntity.java
│   ├── HazardAdvisoryEntity.java
│   └── ChatMessageEntity.java
├── repository/
│   ├── OceanGridPointRepository.java
│   ├── ArgoFloatRepository.java
│   ├── FloatPositionRepository.java
│   ├── UserRepository.java
│   ├── HazardAdvisoryRepository.java
│   └── ChatMessageRepository.java
├── model/                          (response DTOs)
│   ├── OceanGridPoint.java
│   ├── ArgoFloat.java
│   └── dto/
│       ├── LoginRequest.java
│       ├── SignupRequest.java
│       └── AuthResponse.java
├── ingestion/
│   ├── OceanDataParser.java        (interface — the plugin contract)
│   ├── NetCdfOceanDataParser.java
│   ├── AsciiOceanDataParser.java
│   ├── validation/
│   │   └── CfConventionValidator.java
│   └── registry/
│       └── ParserRegistry.java
├── derived/
│   └── MldCalculatorService.java
├── service/
│   ├── AlongTrackSectionService.java
│   ├── UserService.java
│   └── NaturalLanguageQueryService.java
└── controller/
    ├── OceanDataController.java
    ├── ArgoController.java
    ├── HazardAdvisoryController.java
    ├── StatsController.java
    ├── AuthController.java
    ├── ProfileController.java
    ├── AiAssistantController.java
    └── admin/
        ├── AdminParserController.java
        ├── AdminUserController.java
        └── AdminHazardController.java |
| --- |
| frontend/src/
├── main.jsx
├── App.jsx
├── views/
│   ├── HomeView.jsx
│   ├── DashboardView.jsx
│   ├── GeoMapView.jsx
│   ├── AiAssistantView.jsx
│   ├── DataManagerView.jsx
│   ├── ProfileSettingsView.jsx
│   ├── LoginView.jsx
│   └── SignupView.jsx
├── components/
│   ├── home/
│   │   ├── Navbar.jsx
│   │   ├── QuickAccessNav.jsx
│   │   ├── LiveMetricsPanel.jsx
│   │   ├── CapabilitiesGrid.jsx
│   │   ├── MiniOceanPreview.jsx
│   │   ├── DataSourcesPanel.jsx
│   │   ├── RecentActivityFeed.jsx
│   │   └── Footer.jsx
│   ├── dashboard3d/
│   │   ├── OceanScene.jsx
│   │   ├── IsosurfaceLayer.jsx
│   │   ├── VolumetricLayer.jsx
│   │   ├── TrajectoryLayer.jsx
│   │   ├── CurrentStreamlineLayer.jsx
│   │   ├── HazardLayerToggle.jsx
│   │   ├── ArgoMarkers.jsx
│   │   ├── RegionSelector.jsx
│   │   ├── PointQueryTool.jsx
│   │   ├── TimeSlider.jsx
│   │   ├── ControlPanel.jsx
│   │   └── ExportShareControls.jsx
│   ├── dashboard2d/
│   │   ├── FloatSelector.jsx
│   │   ├── ChartTypeSelector.jsx
│   │   ├── ProfileChart.jsx
│   │   ├── CorrelationView.jsx
│   │   ├── TSDiagramChart.jsx
│   │   ├── DistributionHistogramChart.jsx
│   │   ├── TimeSeriesChart.jsx
│   │   ├── HovmollerChart.jsx
│   │   ├── AlongTrackSectionChart.jsx
│   │   └── CurrentRoseChart.jsx
│   ├── geomap/
│   │   ├── MapFilterPanel.jsx
│   │   ├── MapCanvas.jsx
│   │   ├── GeoTrajectoryLayer.jsx
│   │   ├── FloatGliderMarkers.jsx
│   │   └── InstrumentDetailPanel.jsx
│   ├── assistant/
│   │   ├── ChatMessageList.jsx
│   │   ├── ChatChartRenderer.jsx
│   │   ├── SuggestedQueryChips.jsx
│   │   └── ChatInputBar.jsx
│   ├── datamanager/
│   │   ├── PendingApprovalsList.jsx
│   │   ├── UploadPanel.jsx
│   │   ├── ParserRegistryList.jsx
│   │   └── IngestionStatusLog.jsx
│   ├── profilesettings/
│   │   ├── ProfileAccountForm.jsx
│   │   ├── HazardAdvisoryManager.jsx
│   │   └── DataSourceStatusPanel.jsx
│   ├── auth/
│   │   ├── AuthLayout.jsx
│   │   └── AuthForm.jsx
│   └── shared/
│       └── ProtectedRoute.jsx
├── store/
│   ├── useVizStore.js
│   └── useAuthStore.js
├── api/
│   ├── oceanApi.js
│   ├── authApi.js
│   └── assistantApi.js
├── utils/
│   └── colorScale.js
└── styles/
    └── index.css |
| --- |
| Service | Role |
| --- | --- |
| PostgreSQL | Primary datastore for all entities — grid points, floats, positions, profiles, users, advisories, chat history. |
| THREDDS Data Server | Serves raw NetCDF files over OPeNDAP, satisfying the PS's OPeNDAP requirement without reimplementing it. |
| GeoServer | Publishes model grids as OGC WMS/WCS coverages for national/international data-portal interoperability. |
| LLM Query Service (external AI API) | Extracts structured intent (variable, location, instrument, time range, chart type) from the AI Assistant's natural-language input; never generates data values itself. |
| Docker Compose | Orchestrates backend, frontend, Postgres, THREDDS, and GeoServer as one local/deployable stack. |
| Backend & Frontend Dockerfiles | Multi-stage builds producing runnable containers for the Spring Boot API and the Vite-built React app. |