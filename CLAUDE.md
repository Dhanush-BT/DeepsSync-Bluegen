# DEEPSYNC — CLAUDE.md

Guide for Claude Code sessions working on this repository. Read this before writing any code.

## Project Context

**DEEPSYNC** is a web-based 3D ocean data visualization platform developed by Team BLUEGEN_606, addressing **PS 26067** (INCOIS —
"Develop a web-based interactive 3D visualization platform that integrates numerical
ocean model outputs and in-situ observations").

**Current status: planning stage. Nothing has been implemented yet.** This file, the
companion `DEEPSYNC_PRD.docx`, and `DEEPSYNC_SRS.docx` are the full specification.
Treat this repo as starting from zero.

Full documents (read these for anything this file summarizes too briefly):
- `docs/DEEPSYNC_PRD.docx` — deliverables, visualization plan, diagrams, module trees
- `docs/DEEPSYNC_SRS.docx` — numbered functional/non-functional requirements
- `docs/DEEPSYNC_Interactive_Wireframe.html` — clickable wireframe with per-component
  annotations (open in a browser; click the gold pins)

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3 (Java 17), Maven |
| NetCDF parsing | Unidata netcdf-java (`cdm-core`) |
| ASCII parsing | Apache Commons CSV |
| Database | PostgreSQL via Spring Data JPA (Hibernate) |
| Auth | JWT (stateless), Spring Security |
| Raw data access | THREDDS Data Server (OPeNDAP) — sidecar, not custom code |
| OGC compliance | GeoServer (WMS/WCS) — sidecar, not custom code |
| AI / NLP | External LLM API — intent extraction only, never a data source |
| API docs | springdoc-openapi (Swagger UI) |
| Frontend | React + Vite |
| 3D rendering | Three.js via `@react-three/fiber` + `@react-three/drei` |
| 2D mapping | Leaflet-class tile map library (Geo Map page) |
| Charting | Chart.js / `react-chartjs-2` |
| State | Zustand |
| HTTP client | Axios |
| Local infra | Docker Compose (Postgres, THREDDS, GeoServer) |

## Repository Layout (target — build toward this)

```
backend/src/main/java/com/deepsync/backend/
├── DeepsyncApplication.java
├── config/              CorsConfig, DataSeeder, OpenApiConfig
├── security/            SecurityConfig, JwtService, JwtAuthFilter
├── entity/              OceanGridPointEntity, ArgoFloatEntity, ProfileSampleEntity,
│                        FloatPositionEntity, UserEntity, HazardAdvisoryEntity,
│                        ChatMessageEntity
├── repository/          one Spring Data repo per entity above (except ProfileSample,
│                        which is accessed only via ArgoFloatEntity's cascade)
├── model/               response DTOs (OceanGridPoint, ArgoFloat) + model/dto/ for
│                        auth (LoginRequest, SignupRequest, AuthResponse)
├── ingestion/           OceanDataParser (interface), NetCdfOceanDataParser,
│                        AsciiOceanDataParser, ingestion/validation/CfConventionValidator,
│                        ingestion/registry/ParserRegistry
├── derived/             MldCalculatorService
├── service/             AlongTrackSectionService, UserService, NaturalLanguageQueryService
└── controller/          OceanDataController, ArgoController, HazardAdvisoryController,
                         StatsController, AuthController, ProfileController,
                         AiAssistantController, controller/admin/{AdminParserController,
                         AdminUserController, AdminHazardController}

frontend/src/
├── views/               HomeView, DashboardView, GeoMapView, AiAssistantView,
│                        DataManagerView, ProfileSettingsView, LoginView, SignupView
├── components/
│   ├── home/            Navbar, QuickAccessNav, LiveMetricsPanel, CapabilitiesGrid,
│   │                    MiniOceanPreview, DataSourcesPanel, RecentActivityFeed, Footer
│   ├── dashboard3d/     OceanScene, IsosurfaceLayer, VolumetricLayer, TrajectoryLayer,
│   │                    CurrentStreamlineLayer, HazardLayerToggle, ArgoMarkers,
│   │                    RegionSelector, PointQueryTool, TimeSlider, ControlPanel,
│   │                    ExportShareControls
│   ├── dashboard2d/     FloatSelector, ChartTypeSelector, ProfileChart, CorrelationView,
│   │                    TSDiagramChart, DistributionHistogramChart, TimeSeriesChart,
│   │                    HovmollerChart, AlongTrackSectionChart, CurrentRoseChart
│   ├── geomap/          MapFilterPanel, MapCanvas, GeoTrajectoryLayer,
│   │                    FloatGliderMarkers, InstrumentDetailPanel
│   ├── assistant/       ChatMessageList, ChatChartRenderer, SuggestedQueryChips, ChatInputBar
│   ├── datamanager/     PendingApprovalsList, UploadPanel, ParserRegistryList, IngestionStatusLog
│   ├── profilesettings/ ProfileAccountForm, HazardAdvisoryManager, DataSourceStatusPanel
│   ├── auth/            AuthLayout, AuthForm
│   └── shared/          ProtectedRoute
├── store/               useVizStore.js, useAuthStore.js
├── api/                 oceanApi.js, authApi.js, assistantApi.js
└── utils/               colorScale.js
```

## Database Schema (summary — see PRD §6 for the full ERD image)

- **OceanGridPointEntity** — standalone. lat/lon/depth/timestamp + temperature, salinity,
  currentU/V, chlorophyll. Populated by ingestion, read by Dashboard's 3D scene and charts.
- **ArgoFloatEntity** — the relational hub for instrument data. `platformId` (unique),
  `instrumentType`, lat/lon. Owns:
  - **ProfileSampleEntity** (1:many) — depth-resolved readings, each with its own
    `timestamp` — seed *multiple* snapshots per float over time, not just one, to support
    Time Series / Hovmöller charts.
  - **FloatPositionEntity** (1:many) — position fixes over time. This exists specifically
    to back trajectory rendering (Dashboard) and path plotting (Geo Map); don't skip it
    and try to fake a path from a single lat/lon.
- **UserEntity** — `empIdOrEmail` (unique), `passwordHash`, `fullName`, `active` (bool,
  default false), role is always `ADMIN` (no other role exists — see Auth Model below).
- **HazardAdvisoryEntity** — type (TSUNAMI/HIGH_WAVE/PFZ), region, message, severity,
  issuedAt. Feeds Dashboard's `HazardLayerToggle` and Settings' `HazardAdvisoryManager`
  (full CRUD). No public ticker exists on Home — that was tried and removed.
- **ChatMessageEntity** — sessionId, role (user/assistant), text, chartPayload (JSON,
  nullable), timestamp. No FK to User — AI Assistant is public, unauthenticated.

## Auth Model — read this before touching security code

This went through several redesigns; the final shape is deliberately simple:

- **Only two states exist: public, and ADMIN.** There is no "Forecaster" account tier
  distinct from an anonymous visitor. Do not reintroduce role hierarchies, employee
  directories, or designation/grade fields — that richer model was explicitly tried and
  rolled back as unnecessary complexity.
- **Only Data Manager and Profile & Settings are gated.** Home, Dashboard, Geo Map, and
  AI Assistant are 100% public, no login required, ever.
- **Signup is public but always inactive.** `POST /api/auth/signup` creates a `UserEntity`
  with `active=false`. It cannot log in until an *existing* admin approves it via
  `PendingApprovalsList` on Data Manager.
- **The first admin is seeded, not signed up.** `DataSeeder` creates one pre-activated
  admin account from `application.yml` config on first startup — this is what breaks the
  bootstrap problem (there must always be at least one admin able to approve others).
- **Enforce server-side, always.** `SecurityConfig` + `JwtAuthFilter` are the real gate.
  `ProtectedRoute` on the frontend is UX only — never treat it as the security boundary.

## AI Assistant — the one rule that matters

`NaturalLanguageQueryService` sends user text to an LLM **only to extract intent**
(variable, location, instrument, time range, implied chart type). The LLM must never be
the source of a returned value. Every number or chart the AI Assistant shows must trace
back to a real call into `OceanDataController` / `ArgoController` / `StatsController` —
the same endpoints Dashboard uses. `ChatChartRenderer` reuses existing chart components;
do not write new chart-drawing code for the chat UI.

## Extensibility — the pattern to follow for anything new

New ingestion format → implement `OceanDataParser`, register as a `@Component`, done.
`ParserRegistry` auto-collects it. Do not add `if/else` format branching anywhere else.
New derived variable (like MLD) → a `service/` class, not a new entity field, unless it's
raw ingested data.

## Explicitly Out of Scope (don't build these unless asked)

- Automated FTP fetching for Argo/Glider sources — sample files are downloaded manually
  into `backend/src/main/resources/sample-data/` (see PRD §3.2 for the source URLs).
- A native mobile app.
- Custom WMS/WCS or OPeNDAP implementations — GeoServer and THREDDS are sidecars for a
  reason; don't reinvent them in Spring.
- A "Collection of In-situ Data" fourth source was mentioned during planning with no URL
  ever provided. Leave it unresolved until a real link surfaces.

## Recommended Build Order

1. **Backend skeleton** — entities, repositories, `DataSeeder` with realistic mock data
   (multi-timestamp profiles, position history, one seeded admin, a couple of hazard
   advisories). Get this seeding real data before writing a single frontend component.
2. **Core public read endpoints** — `OceanDataController`, `ArgoController`,
   `StatsController`, `HazardAdvisoryController`.
3. **Frontend shell** — routing, `Navbar`, `Home` page (all its sections are static or
   read-only, good first target).
4. **Dashboard 3D zone** — `OceanScene` MVP (point cloud only) before isosurfaces/volumetric/
   streamlines. Get one thing rendering real fetched data before adding overlay toggles.
5. **Dashboard 2D zone** — `FloatSelector` + `ProfileChart` first; the other 7 chart types
   behind `ChartTypeSelector` can follow incrementally.
6. **Auth** — `UserEntity`, `JwtService`, `AuthController` (login + signup), then
   `AdminUserController`'s approval flow.
7. **Data Manager** — `UploadPanel` + `NetCdfOceanDataParser` wired to real sample files.
8. **Geo Map** — reuses `ArgoController` and the position-history data from step 1.
9. **Profile & Settings** — self-service profile, then `HazardAdvisoryManager` CRUD.
10. **AI Assistant** — deliberately last; it depends on every other endpoint existing first.
11. **Sidecars** — Docker Compose wiring for THREDDS and GeoServer; these are configuration-
    heavy, not code-heavy, and can happen in parallel with anything above once the backend
    container exists.

## Local Development

```bash
# Database + sidecars
docker-compose up -d postgres

# Backend (port 8080)
cd backend && ./mvnw spring-boot:run

# Frontend (port 5173, proxies /api to :8080)
cd frontend && npm install && npm run dev
```

## Conventions

- **Java**: package-by-feature as laid out above, not package-by-layer beyond the
  top-level split shown. Keep `ingestion/`, `derived/`, and `service/` distinct — they
  represent different responsibilities (format parsing, computed variables, everything else).
- **React**: components live under the page-folder they belong to
  (`components/dashboard3d/`, `components/geomap/`, etc.), not a flat `components/`
  directory. `shared/` is only for things genuinely used by more than one page area.
- **DTO/Entity pairing**: never return a JPA entity directly from a controller — always
  map to the corresponding `model/` DTO, even when the fields look identical today.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
