<!-- converted from DEEPSYNC_SRS.docx -->


DEEPSYNC
Software Requirements Specification
3D Ocean Data Visualization Platform
Problem Statement PS 26067 · INCOIS
Smart India Hackathon 2025 · Team BLUEGEN_606 (Team ID 64585)
Version 1.0 — Planning-stage specification, no implementation has begun

# 1. Introduction
## 1.1 Purpose
This Software Requirements Specification defines the functional and non-functional requirements for DEEPSYNC, a web-based 3D ocean data visualization platform built for Smart India Hackathon 2025 (Problem Statement PS 26067, issued by INCOIS). It is intended for the development team, evaluators, and any future maintainer of the system.
## 1.2 Scope
DEEPSYNC integrates numerical ocean model output with in-situ instrument observations in a single interactive web application. In scope: 3D volumetric visualization, an 8-type 2D analytical chart suite, a 2D geo-map path viewer, an AI-assisted natural-language query interface, role-gated administrative data management, and OGC/OPeNDAP interoperability. Out of scope for the current planning pass: automated FTP fetching of upstream data (files are downloaded manually for the demo), and any mobile-native application.
## 1.3 Definitions, Acronyms, and Abbreviations
## 1.4 References
- Problem Statement PS 26067 (Smart India Hackathon 2025, INCOIS).
- DEEPSYNC Project Description Document (companion document to this SRS).
- CF Conventions for NetCDF (cfconventions.org).
- OGC Web Map Service / Web Coverage Service specifications.

# 2. Overall Description
## 2.1 Product Perspective
DEEPSYNC is a new, standalone system. It consumes external data from LAS INCOIS, Copernicus Marine, and the Argo/Glider (Ifremer) archives, and depends on two data-serving sidecars (THREDDS, GeoServer) and one AI sidecar (an external LLM API). It has no dependency on any prior INCOIS software system.
## 2.2 Product Functions
At a high level, the system: renders ocean model and instrument data in 3D; provides depth-profile and correlation-style 2D analytics; plots instrument paths on a 2D map; answers natural-language questions about the data; and lets an administrator ingest new data files and manage hazard advisories. The full functional breakdown is in Section 3.1.
## 2.3 User Classes and Characteristics
Note: the system does not currently distinguish a 'Forecaster' account tier from an anonymous Public Visitor — both reach the same public pages with the same capabilities. This was a deliberate simplification (see design history: authentication was scoped down to gate only the two admin pages) and should be revisited if forecaster-specific features (e.g. saved views) are added later.
## 2.4 Operating Environment
- Backend: Spring Boot 3 / Java 17, containerized, deployable on any Docker-capable host.
- Frontend: modern evergreen browsers with WebGL support (required for the 3D scene).
- Database: PostgreSQL 16.
- Sidecars: THREDDS Data Server, GeoServer, both containerized alongside the application.
## 2.5 Design and Implementation Constraints
- Argo and Glider source data is fetched manually (FTP) rather than via an automated pipeline, for hackathon scope reasons.
- The AI Assistant's LLM must only extract query intent — it must never fabricate a data value; all values returned to the user must trace back to an existing controller/repository call.
- All admin-only functionality must be enforced server-side (Spring Security), independent of any client-side route guard.
## 2.6 Assumptions and Dependencies
- Upstream data sources (LAS INCOIS, Copernicus Marine) remain available and their NetCDF schema remains compatible with the CF-convention parser.
- An external LLM API is reachable from the backend for AI Assistant functionality; if unreachable, the Assistant should degrade to an explicit error rather than a silent failure.

# 3. Specific Requirements
## 3.1 Functional Requirements

## 3.2 Non-Functional Requirements
## 3.3 External Interface Requirements
### 3.3.1 User Interfaces
Seven pages, detailed in the companion Project Description Document (Section 7): Home, Dashboard, Geo Map, AI Assistant, Data Manager, Profile & Settings, and Login/Signup.
### 3.3.2 Software Interfaces
### 3.3.3 Communication Interfaces
All frontend-backend communication is over REST/JSON, secured with JWT bearer tokens for admin-only endpoints. Public endpoints require no authentication header.

# 4. System Models
## 4.1 Use Case Overview
Four primary use-case flows exist in the system: data ingestion by an administrator, general data exploration by a public visitor, a natural-language query via the AI Assistant, and the admin authentication lifecycle (signup → approval → login). All four converge on the same PostgreSQL data store.

## 4.2 Site / Navigation Model
The site is flat — no page is nested more than one level below Home. Two pages (Data Manager; Profile & Settings) are visible and reachable only to an authenticated administrator, enforced both in the navigation UI and at the API layer.

## 4.3 Data Model
See the companion Project Description Document, Section 6, for the full entity-relationship diagram. In summary: ArgoFloatEntity is the relational hub for instrument data, owning both ProfileSampleEntity (depth-resolved readings) and FloatPositionEntity (position history for trajectory/path rendering). OceanGridPointEntity, UserEntity, HazardAdvisoryEntity, and ChatMessageEntity are independent tables.

# 5. Appendix
## 5.1 Traceability Note
Every functional requirement in Section 3.1 traces to a Primary, Secondary, or Tertiary deliverable defined in the Project Description Document (Section 2), and to a concrete backend/frontend module in that document's Section 8. No functional requirement in this SRS lacks a corresponding module in the module structure.
## 5.2 Open Items
- Forecaster-specific account tier (distinct from Public Visitor) — not currently planned; noted in Section 2.3 as a possible future addition.
- Automated FTP ingestion for Argo/Glider sources — currently manual; would require a dedicated fetcher module if automated.
- A fourth in-situ data source mentioned during planning ('Collection of In-situ Data') had no URL provided and remains unresolved.
| Term | Meaning |
| --- | --- |
| PS | Problem Statement |
| INCOIS | Indian National Centre for Ocean Information Services |
| EEZ | Exclusive Economic Zone |
| CF Conventions | Climate and Forecast metadata conventions for NetCDF files |
| OGC WMS/WCS | Open Geospatial Consortium Web Map Service / Web Coverage Service |
| OPeNDAP | Open-source Project for a Network Data Access Protocol |
| MLD | Mixed Layer Depth (a derived oceanographic variable) |
| SST / SSS | Sea Surface Temperature / Sea Surface Salinity |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| Actor | Description |
| --- | --- |
| Public Visitor | Views Home, Dashboard, Geo Map, and AI Assistant. No account required. Cannot access Data Manager or Profile & Settings. |
| Forecaster / Researcher | Same access as Public Visitor; uses Dashboard's analytical suite for operational or research purposes. No distinct account tier from Public Visitor in the current design — see Section 2.3. |
| Administrator | Authenticated via JWT after signup + existing-admin approval. Full access to Data Manager (ingestion, user approval) and Profile & Settings (hazard advisories, own account). |
| External Systems | LAS INCOIS, Copernicus Marine, Argo Global, and Glider (Ifremer) as upstream data sources; an external LLM API for the AI Assistant; THREDDS and GeoServer as data-serving sidecars. |
| ID | Title | Requirement |
| --- | --- | --- |
| FR-1 | 3D Volumetric Rendering | The system shall render live ocean model grid data (temperature, salinity, current, chlorophyll) as an interactive WebGL 3D scene with orbit, zoom, and pan controls. |
| FR-2 | Isosurface Extraction | The system shall compute and display an isosurface for the active variable at a user-selected threshold. |
| FR-3 | Volumetric Shading | The system shall provide a ray-marched volumetric rendering mode as an alternative to point-cloud rendering. |
| FR-4 | Depth-Slice & Time Control | The system shall allow filtering the 3D scene to a single depth level or the full water column, and shall provide a time slider with play/pause animation across available model timestamps. |
| FR-5 | Instrument Overlay | The system shall display Argo float, Glider, CTD, and BGC instrument positions on the 3D scene and 2D Geo Map, and shall open a detail view showing that instrument's data when clicked. |
| FR-6 | Trajectory & Path Rendering | The system shall render each instrument's historical position history as a connected path, in both the 3D scene and the 2D Geo Map. |
| FR-7 | Point Query | The system shall allow a user to click any location in open water and receive an interpolated model value at that point, depth, and time. |
| FR-8 | Data Ingestion | The system shall accept NetCDF and delimited ASCII file uploads from an authenticated administrator, validate CF-convention compliance where applicable, and parse them via a registered, pluggable parser. |
| FR-9 | Extensible Parser Registry | The system shall allow a new data-format parser to be added by implementing a defined interface, without modifying existing parsers or controllers. |
| FR-10 | 2D Analytical Charts | The system shall provide eight selectable chart types — Depth Profile, Correlation, T-S Diagram, Distribution, Time Series, Hovmöller, Along-track Section, and Current Rose — for the data of a selected instrument or grid region. |
| FR-11 | Derived Variables | The system shall compute Mixed Layer Depth (MLD) from a float's temperature profile without requiring it as raw ingested data. |
| FR-12 | Hazard Advisories | The system shall allow an administrator to create, edit, and delete hazard advisories (tsunami, high wave, PFZ), and shall display active advisories as a Dashboard map overlay. |
| FR-13 | AI Assistant | The system shall accept natural-language questions, extract query intent via an LLM, retrieve the corresponding data from existing endpoints, and respond with text and, where applicable, an inline chart. |
| FR-14 | Admin Authentication | The system shall require JWT-based authentication for all Data Manager and Profile & Settings operations; new admin accounts shall remain inactive until approved by an existing administrator. |
| FR-15 | Self-Service Profile | The system shall allow an authenticated administrator to view their own account details and change their own password. |
| FR-16 | OGC & OPeNDAP Access | The system shall expose model data as OGC WMS/WCS coverages and as raw NetCDF over OPeNDAP, via dedicated sidecar services rather than custom endpoints. |
| FR-17 | Export & Sharing | The system shall allow the current chart or grid selection to be exported as CSV and the current view state to be copied as a shareable link. |
| Category | Requirement |
| --- | --- |
| Performance | 3D scene shall load and render an initial grid fetch within a demo-representative time; volumetric slice interactions shall remain responsive (sub-100ms target, matching the PS's own stated benchmark) for typical grid sizes. |
| Security | All admin-only routes (Data Manager, Profile & Settings, and their backing APIs) shall be enforced server-side via Spring Security regardless of what the frontend displays. Passwords shall be hashed, never stored or logged in plaintext. |
| Availability | The AI Assistant and public pages (Home, Dashboard, Geo Map) shall remain usable even if the LLM Query Service or an upstream data source is temporarily unavailable, degrading gracefully rather than failing the whole page. |
| Scalability | The ingestion pipeline shall support new parsers and new instrument types without modification to existing controllers or the database schema for unrelated entities. |
| Usability | The public-facing pages (Home, Dashboard, Geo Map, AI Assistant) shall require no login and no oceanography-specific training to produce a meaningful result. |
| Compliance | NetCDF ingestion shall validate CF Convention metadata before acceptance; WMS/WCS output shall conform to OGC standards for interoperability with national/international ocean data portals. |
| Maintainability | Frontend components shall be organized by page/feature area (see Module Structure) so a new contributor can locate the code for any single feature without searching the whole codebase. |
| Portability | The full stack (backend, frontend, Postgres, THREDDS, GeoServer) shall be containerized and orchestrated via Docker Compose for consistent deployment across environments. |
| Interface | Purpose |
| --- | --- |
| LAS INCOIS / Copernicus Marine | Upstream NetCDF ocean model data, ingested via NetCdfOceanDataParser. |
| Argo Global / Glider (Ifremer, FTP) | Upstream instrument profile and position data, downloaded manually for demo scope. |
| THREDDS Data Server | OPeNDAP access to raw NetCDF files. |
| GeoServer | OGC WMS/WCS coverage publishing. |
| External LLM API | Natural-language intent extraction for the AI Assistant. |