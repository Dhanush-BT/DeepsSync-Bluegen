# Graph Report - DEEPSYNC-APP  (2026-09-10)

## Corpus Check
- 124 files · ~309,477 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 872 nodes · 1675 edges · 64 communities (45 shown, 16 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 246 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a849f97`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OceanDataService
- graphify Build Pipeline
- package.json
- HazardAdvisoryEntity
- ArgoService
- UserEntity
- OceanGridPointEntity
- useAppStore
- DEEPSYNC Project Description Document (PRD)
- ProfileSampleEntity
- ChatMessageEntity
- netcdf-ingestion-reviewer Agent
- DEEPSYNC CLAUDE.md Project Guide
- FloatPositionEntity
- Icons SVG sprite sheet (6 <symbol> definitions)
- GlobalExceptionHandler.java
- ArgoFloatEntity
- jakarta.persistence.Entity
- Components
- NaturalLanguageQueryService
- mvnw
- OceanGridPointRepository
- Deliverable: 3D Volumetric Rendering Engine (Primary)
- MldCalculatorService
- Public Signup, Always Inactive Until Approved
- OceanDataFilter
- .oxlintrc.json
- Docker Compose stack orchestration
- App.jsx
- StatsService.java
- React Logo (SVG asset)
- DataSeeder.java
- Deliverable: Public Accessibility (Tertiary)
- org.springframework.web.bind.annotation.GetMapping
- Explicitly Out of Scope (No Custom OPeNDAP/WMS, No FTP Fetch)
- OceanDataParser (plugin contract interface)
- Isometric Stacked Rounded-Square Layer Mark
- ChartTypeSelector (single gate for all 8 chart types)
- DeepsyncAppApplication
- frontend-lint.cjs
- java-compile-check.cjs
- GET /api/admin/profile, PUT /api/admin/profile/password
- FR-4 Depth-Slice & Time Control
- FR-14 Admin Authentication (JWT + approval gate)
- FalkorDB Cypher Export and Push
- SVG and GraphML Exports
- Shared 'Selected Float' State Across Pages
- ExportShareControls (CSV export + shareable view link)
- DataSourcesPanel (public)
- Deliverable: CF Conventions Compliance (Secondary)
- Deliverable: In-Situ Data Visualization Module (Primary)
- FR-15 Self-Service Profile
- .mcp.json
- SuggestedQueryChips
- NFR Security (server-side enforcement, hashed passwords)
- com.BLUEGEN:DEEPSYNC-APP
- org.junit.jupiter.api.Test
- Page: Data Manager (admin only)
- NaturalLanguageQueryService (intent extraction only)
- MldCalculatorService (derived Mixed Layer Depth)
- Postgres 16 Compose Service (deepsync-postgres)

## God Nodes (most connected - your core abstractions)
1. `OceanGridPointEntity` - 42 edges
2. `ProfileSampleEntity` - 40 edges
3. `useAppStore` - 38 edges
4. `ArgoFloatEntity` - 33 edges
5. `FloatPositionEntity` - 32 edges
6. `HazardAdvisoryEntity` - 30 edges
7. `react` - 22 edges
8. `DataSeeder` - 20 edges
9. `ChatMessageEntity` - 20 edges
10. `UserEntity` - 20 edges

## Surprising Connections (you probably didn't know these)
- `ProtectedRoute()` --semantically_similar_to--> `SecurityConfig (server-side admin gate)`  [INFERRED] [semantically similar]
  frontend/src/components/shared/ProtectedRoute.jsx → graphify-out/converted/DEEPSYNC_PRD_6512e276.md
- `OceanScene()` --implements--> `Three.js via @react-three/fiber and drei`  [INFERRED]
  frontend/src/components/dashboard3d/OceanScene.jsx → graphify-out/converted/DEEPSYNC_PRD_6512e276.md
- `StatsController` --shares_data_with--> `Page: Home (public)`  [INFERRED]
  src/main/java/com/bluegen/deepsyncapp/controller/StatsController.java → graphify-out/converted/DEEPSYNC_PRD_6512e276.md
- `NaturalLanguageQueryService (intent extraction only)` --shares_data_with--> `ChatMessageEntity`  [INFERRED]
  graphify-out/converted/DEEPSYNC_PRD_6512e276.md → src/main/java/com/bluegen/deepsyncapp/entity/ChatMessageEntity.java
- `FloatPositionEntity` --shares_data_with--> `GeoTrajectoryLayer (path polylines on Geo Map)`  [EXTRACTED]
  src/main/java/com/bluegen/deepsyncapp/entity/FloatPositionEntity.java → graphify-out/converted/DEEPSYNC_PRD_6512e276.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Instrument Trajectory Rendering Chain (3D and 2D)** — src_main_java_com_bluegen_deepsyncapp_entity_floatpositionentity, src_main_java_com_bluegen_deepsyncapp_entity_argofloatentity, src_main_java_com_bluegen_deepsyncapp_controller_argocontroller, frontend_src_components_dashboard3d_trajectorylayer, frontend_src_components_geomap_geotrajectorylayer, docs_deepsync_interactive_wireframe_api_instruments_argo [EXTRACTED 0.95]
- **Plugin Ingestion Pipeline (Upload to Grid Store)** — frontend_src_components_datamanager_uploadpanel, src_main_java_com_bluegen_deepsyncapp_ingestion_oceandataparser, src_main_java_com_bluegen_deepsyncapp_ingestion_netcdfoceandataparser, src_main_java_com_bluegen_deepsyncapp_ingestion_asciioceandataparser, src_main_java_com_bluegen_deepsyncapp_ingestion_validation_cfconventionvalidator, src_main_java_com_bluegen_deepsyncapp_ingestion_registry_parserregistry, src_main_java_com_bluegen_deepsyncapp_entity_oceangridpointentity [EXTRACTED 0.95]
- **Admin Signup / Approval / Bootstrap Flow** — claude_md_inactive_signup_policy, claude_md_seeded_first_admin, src_main_java_com_bluegen_deepsyncapp_config_dataseeder, src_main_java_com_bluegen_deepsyncapp_controller_authcontroller, src_main_java_com_bluegen_deepsyncapp_controller_admin_adminusercontroller, frontend_src_components_datamanager_pendingapprovalslist, src_main_java_com_bluegen_deepsyncapp_entity_userentity [EXTRACTED 1.00]
- **AI Assistant grounded-answer flow (intent extraction → real endpoint → reused chart)** — src_main_java_com_bluegen_deepsyncapp_controller_aiassistantcontroller_aiassistantcontroller, src_main_java_com_bluegen_deepsyncapp_service_naturallanguagequeryservice_naturallanguagequeryservice, graphify_out_converted_deepsync_prd_6512e276_llm_query_service, src_main_java_com_bluegen_deepsyncapp_controller_oceandatacontroller_oceandatacontroller, frontend_src_components_assistant_chatchartrenderer_chatchartrenderer, graphify_out_converted_deepsync_srs_63128d15_llm_intent_only_constraint [EXTRACTED 1.00]
- **Argo float sub-resource read path (list, profiles, track) avoiding LAZY collection loads** — src_main_java_com_bluegen_deepsyncapp_controller_argocontroller_argocontroller, src_main_java_com_bluegen_deepsyncapp_service_argoservice_argoservice, src_main_java_com_bluegen_deepsyncapp_repository_argofloatrepository_argofloatrepository, src_main_java_com_bluegen_deepsyncapp_repository_profilesamplerepository_profilesamplerepository, src_main_java_com_bluegen_deepsyncapp_repository_floatpositionrepository_floatpositionrepository, docs_superpowers_specs_2026_09_10_phase2_read_endpoints_design_argo_sub_resources_decision [EXTRACTED 1.00]
- **DEEPSYNC-APP Backend Scaffolding Convention Set** — _claude_skills_new_ocean_resource_skill_five_file_vertical_slice, _claude_skills_new_ocean_resource_skill_package_per_layer_convention, _claude_skills_new_ocean_resource_skill_constructor_injection_rule, _claude_skills_new_ocean_resource_skill_rest_path_plural_kebab_case, _claude_skills_new_ocean_resource_skill_minimal_scaffold_principle [EXTRACTED 1.00]
- **CF-Convention Ingestion Correctness Checklist Participants** — _claude_skills_cf_convention_check_skill_standard_name_lookup, _claude_skills_cf_convention_check_skill_fill_value_handling, _claude_skills_cf_convention_check_skill_dimension_order, _claude_skills_cf_convention_check_skill_coordinate_system_resolution, _claude_skills_cf_convention_check_skill_calendar_date_unit_time_decoding, _claude_agents_netcdf_ingestion_reviewer_agent [EXTRACTED 1.00]
- **Consistent 400/404 error body via one RestControllerAdvice** — src_main_java_com_bluegen_deepsyncapp_controller_globalexceptionhandler_globalexceptionhandler, src_main_java_com_bluegen_deepsyncapp_model_apierror_apierror, src_main_java_com_bluegen_deepsyncapp_service_notfoundexception_notfoundexception, src_main_java_com_bluegen_deepsyncapp_model_oceandatafilter_oceandatafilter [EXTRACTED 1.00]
- **Eight-Chart 2D Analysis Suite Behind One Selector** — frontend_src_components_dashboard2d_charttypeselector, frontend_src_components_dashboard2d_profilechart, frontend_src_components_dashboard2d_correlationview, frontend_src_components_dashboard2d_tsdiagramchart, frontend_src_components_dashboard2d_distributionhistogramchart, frontend_src_components_dashboard2d_timeserieschart, frontend_src_components_dashboard2d_hovmollerchart, frontend_src_components_dashboard2d_alongtracksectionchart, frontend_src_components_dashboard2d_currentrosechart, docs_deepsync_prd_eight_chart_suite [EXTRACTED 1.00]
- **Detect to Merge Extraction Flow** — _claude_skills_graphify_skill_file_detection, _claude_skills_graphify_skill_structural_extraction, _claude_skills_graphify_skill_semantic_extraction, _claude_skills_graphify_skill_extraction_cache, _claude_skills_graphify_skill_extraction_merge [EXTRACTED 1.00]
- **Query, Answer, and Self-Improving Feedback Loop** — _claude_skills_graphify_references_query_vocab_expansion, _claude_skills_graphify_references_query_bfs_traversal, _claude_skills_graphify_references_query_token_budget, _claude_skills_graphify_references_query_save_result_feedback, _claude_skills_graphify_references_query_work_memory_lessons [EXTRACTED 1.00]
- **Grounded AI Assistant Query Pipeline** — claude_md_llm_intent_only_rule, src_main_java_com_bluegen_deepsyncapp_service_naturallanguagequeryservice, src_main_java_com_bluegen_deepsyncapp_controller_aiassistantcontroller, src_main_java_com_bluegen_deepsyncapp_entity_chatmessageentity, frontend_src_components_assistant_chatchartrenderer, frontend_src_components_assistant_chatmessagelist [EXTRACTED 1.00]
- **Hazard Advisory Lifecycle (Admin CRUD to 3D Overlay)** — frontend_src_components_profilesettings_hazardadvisorymanager, src_main_java_com_bluegen_deepsyncapp_controller_admin_adminhazardcontroller, src_main_java_com_bluegen_deepsyncapp_entity_hazardadvisoryentity, src_main_java_com_bluegen_deepsyncapp_controller_hazardadvisorycontroller, frontend_src_components_dashboard3d_hazardlayertoggle, claude_md_no_public_hazard_ticker [EXTRACTED 1.00]
- **Pluggable multi-format ingestion pipeline (contract, implementations, validation, registry)** — src_main_java_com_bluegen_deepsyncapp_ingestion_oceandataparser_oceandataparser, src_main_java_com_bluegen_deepsyncapp_ingestion_netcdfoceandataparser_netcdfoceandataparser, src_main_java_com_bluegen_deepsyncapp_ingestion_asciioceandataparser_asciioceandataparser, src_main_java_com_bluegen_deepsyncapp_ingestion_validation_cfconventionvalidator_cfconventionvalidator, src_main_java_com_bluegen_deepsyncapp_ingestion_registry_parserregistry_parserregistry, graphify_out_converted_deepsync_srs_63128d15_fr_9_extensible_parser_registry [EXTRACTED 1.00]
- **Shared filter flows from controller binding through service to one JPQL null-guard clause** — src_main_java_com_bluegen_deepsyncapp_model_oceandatafilter_oceandatafilter, src_main_java_com_bluegen_deepsyncapp_controller_oceandatacontroller_oceandatacontroller, src_main_java_com_bluegen_deepsyncapp_controller_statscontroller_statscontroller, src_main_java_com_bluegen_deepsyncapp_repository_oceangridpointrepository_oceangridpointrepository, docs_superpowers_specs_2026_09_10_phase2_read_endpoints_design_jpql_null_guard_filter_idiom [EXTRACTED 1.00]
- **Trajectory/path rendering chain (position history entity → 3D + Geo Map layers → along-track section)** — src_main_java_com_bluegen_deepsyncapp_entity_floatpositionentity_floatpositionentity, src_main_java_com_bluegen_deepsyncapp_entity_argofloatentity_argofloatentity, graphify_out_converted_deepsync_prd_6512e276_trajectory_rendering, frontend_src_components_geomap_geotrajectorylayer_geotrajectorylayer, graphify_out_converted_deepsync_prd_6512e276_chart_along_track_section, graphify_out_converted_deepsync_srs_63128d15_fr_6_trajectory_and_path_rendering [EXTRACTED 1.00]
- **Graph Integrity and Data-Loss Guards** — _claude_skills_graphify_skill_graph_health_check, _claude_skills_graphify_skill_shrink_guard, _claude_skills_graphify_skill_manifest_stamping, _claude_skills_graphify_references_update_prune_sources, _claude_skills_graphify_references_update_replace_on_reextract [INFERRED 0.85]
- **Sidecar Infrastructure Stack (Postgres, THREDDS, GeoServer)** — docker_compose_postgres_service, docker_compose_sidecars_absent, docs_deepsync_prd_opendap_thredds, docs_deepsync_prd_ogc_wms_wcs, docs_deepsync_prd_deployment_package, claude_md_out_of_scope [INFERRED 0.85]

## Communities (64 total, 16 thin omitted)

### Community 0 - "OceanDataService"
Cohesion: 0.15
Nodes (11): Never Return JPA Entities From Controllers, DTO record with static from(Entity) factory convention, Phase 1 seeded corpus (384 grid points, 5 floats, 150 samples, 30 positions, 3 advisories), ExportShareControls, Deliverable: Lightweight API Backend (Primary), org.springframework.stereotype.Service, OceanDataController, OceanDataAxes (+3 more)

### Community 1 - "graphify Build Pipeline"
Cohesion: 0.05
Nodes (51): Watch Debounce Window, Folder Watcher Auto-Rebuild, URL Ingestion into Corpus (graphify add), Graphify MCP stdio Server, Token Reduction Benchmark, Agent-Crawlable Wiki Export, Discrete Confidence Score Rubric, Hyperedge Emission Rules (+43 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (44): dependencies, axios, chart.js, leaflet, react, react-chartjs-2, react-dom, react-leaflet (+36 more)

### Community 3 - "HazardAdvisoryEntity"
Cohesion: 0.10
Nodes (18): Hazard zone overlay (tsunami / high-wave / PFZ), INCOIS SARAT tool (design inspiration), FR-12 Hazard Advisories, AdminHazardController, HazardAdvisoryController, HazardAdvisoryEntity, HazardType, HIGH_WAVE (+10 more)

### Community 4 - "ArgoService"
Cohesion: 0.05
Nodes (28): GET /api/instruments/argo (+ /{id}, /{id}/path, /{id}/profile-history), Phase 2 Core Read Endpoints Implementation Plan, Read-only ProfileSampleRepository exception to CLAUDE.md, Decision: Argo data exposed as sub-resources, Decision: bare JSON array responses, no data/meta envelope, Deferral: CorsConfig, Phase 2 — Core Public Read Endpoints (Design Spec), Public read-only REST surface (auth deferred to Phase 6) (+20 more)

### Community 5 - "UserEntity"
Cohesion: 0.18
Nodes (3): AuthController, UserEntity, UserRepository

### Community 6 - "OceanGridPointEntity"
Cohesion: 0.08
Nodes (16): Postgres on host port 5433, Testcontainers Postgres over H2 for repository tests, Animated current streamlines, Chart: Correlation (SST × Chl-a), Chart: Current Rose, Chart: Distribution / Histogram, Point-query interpolation tool, Data source: Copernicus Marine (+8 more)

### Community 7 - "useAppStore"
Cohesion: 0.06
Nodes (58): GET /api/ocean/grid, GET /api/ocean/point and /api/ocean/point-history, Chart Component Reuse Across Dashboard, Geo Map and Chat, Geo Map Is a Path Viewer, Not a Simplified 3D Tour, Client-Side Recompute Instead of Refetch, Eight-Chart 2D Analytical Suite, Indian Exclusive Economic Zone (EEZ), Potential Fishing Zone / Fishery-Advisory Use Case (+50 more)

### Community 8 - "DEEPSYNC Project Description Document (PRD)"
Cohesion: 0.07
Nodes (30): DEEPSYNC Project Description Document (PRD), Deliverable: Documentation (Tertiary), Deliverable: Extensible Plugin Architecture (Primary), Deliverable: Multi-Format Data Ingestion Pipeline (Primary), Deliverable: OGC Web Services WMS/WCS (Secondary), GeoServer sidecar (WMS/WCS), INCOIS (Indian National Centre for Ocean Information Services), Indian EEZ high-resolution monitoring need (+22 more)

### Community 9 - "ProfileSampleEntity"
Cohesion: 0.24
Nodes (3): Chart: Time Series, Chart: T-S Diagram, ProfileSampleEntity

### Community 10 - "ChatMessageEntity"
Cohesion: 0.13
Nodes (5): ChatMessageEntity, ChatRole, ASSISTANT, USER, ChatMessageRepository

### Community 11 - "netcdf-ingestion-reviewer Agent"
Cohesion: 0.14
Nodes (19): netcdf-ingestion-reviewer Agent, NetcdfFile/NetcdfDataset Handle Closing Requirement, Blocking / Should-fix / Notes Review Report Format, Graphify Skill Directive (project .claude), CalendarDateUnit Time Decoding, CF Convention Check Skill, NetcdfDataset / CoordinateSystem Coordinate Resolution, Deliverable #7 CF-Convention Compliance Requirement (+11 more)

### Community 12 - "DEEPSYNC CLAUDE.md Project Guide"
Cohesion: 0.15
Nodes (14): DEEPSYNC CLAUDE.md Project Guide, docs/CLAUDE.md (Duplicate Project Guide Copy), DEEPSYNC Interactive Wireframe (Annotated Clickable Mock), POST/PUT/DELETE /api/admin/hazards, GET /api/hazards/active, DEEPSYNC PRD (Project Description Document), No Existing Tool Co-Visualizes Model Output With Instrument Data, INCOIS (Indian National Centre for Ocean Information Services) (+6 more)

### Community 13 - "FloatPositionEntity"
Cohesion: 0.14
Nodes (9): Chart: Along-track Section, Data source: Argo Global, Data source: Glider (Ifremer), Float/glider trajectory rendering from position fixes, FR-6 Trajectory & Path Rendering, Constraint: Argo/Glider source data fetched manually (no automated FTP), Open item: unresolved 'Collection of In-situ Data' fourth source, FloatPositionEntity (+1 more)

### Community 14 - "Icons SVG sprite sheet (6 <symbol> definitions)"
Cohesion: 0.16
Nodes (18): Favicon SVG — purple zigzag bolt mark, Alpha-mask + feGaussianBlur layering technique, Downward zigzag bolt/arrow glyph (48x46 viewBox), display-p3 color() with hex fallback for wide-gamut fidelity, Masked blurred-ellipse glow mesh (violet #7e14ff, lavender #ede6ff, cyan #47bfff), Purple/violet brand identity (#863bff primary), Third-party template asset provenance (non-ocean branding, Figma-exported ids), Icons SVG sprite sheet (6 <symbol> definitions) (+10 more)

### Community 15 - "GlobalExceptionHandler.java"
Cohesion: 0.29
Nodes (10): jakarta.servlet.http.HttpServletRequest, org.springframework.http.HttpStatus, org.springframework.http.ResponseEntity, org.springframework.validation.BindException, org.springframework.validation.ObjectError, org.springframework.web.bind.annotation.ExceptionHandler, org.springframework.web.bind.annotation.RestControllerAdvice, org.springframework.web.method.annotation.MethodArgumentTypeMismatchException (+2 more)

### Community 17 - "jakarta.persistence.Entity"
Cohesion: 0.19
Nodes (10): Two-State Auth Model (Public vs ADMIN), Seed Multiple Profile Snapshots Per Float, No Public Hazard Ticker on Home, Home / Dashboard / Geo Map / AI Assistant Are Fully Public, Public Accessibility Deliverable, jakarta.persistence.Entity, jakarta.persistence.Table, SecurityConfig (+2 more)

### Community 18 - "Components"
Cohesion: 0.09
Nodes (21): Brand & Style, Breakpoints & Responsive Adaptation, Buttons, Cards & Analytical Modules, Checkboxes & Radios, Chips & Parameter Tags, Colors, Components (+13 more)

### Community 19 - "NaturalLanguageQueryService"
Cohesion: 0.22
Nodes (9): Recommended Build Order (Backend Seed First, AI Last), LLM Extracts Intent Only, Never Data, THREDDS/GeoServer Sidecars Not Yet in Compose, GET /api/assistant/history, No Separate /about Route (Documentation Section Replaces It), Deployment Package (Dockerfiles + Compose Orchestration), ChatMessageList, AiAssistantController (+1 more)

### Community 20 - "mvnw"
Cohesion: 0.38
Nodes (8): mvnw script, clean(), die(), exec_maven(), hash_string(), set_java_home(), trim(), verbose()

### Community 21 - "OceanGridPointRepository"
Cohesion: 0.17
Nodes (6): JPQL null-guard filter idiom, org.springframework.data.jpa.repository.Query, GridExtent, VariableStatsRow, OceanGridPointRepository, OceanGridPointRepositoryTest

### Community 22 - "Deliverable: 3D Volumetric Rendering Engine (Primary)"
Cohesion: 0.33
Nodes (7): Deliverable: 3D Volumetric Rendering Engine (Primary), Isosurface extraction (marching cubes), Point-cloud rendering of ocean model grid, Volumetric ray-marched rendering, FR-1 3D Volumetric Rendering, FR-2 Isosurface Extraction, FR-3 Volumetric Shading

### Community 23 - "MldCalculatorService"
Cohesion: 0.50
Nodes (4): Derived Variables Live in service/, Not Entity Fields, Package-by-Feature Layout Convention, Mixed Layer Depth (MLD) Derived Variable, MldCalculatorService

### Community 24 - "Public Signup, Always Inactive Until Approved"
Cohesion: 0.40
Nodes (6): Public Signup, Always Inactive Until Approved, Seeded First Admin Bootstrap, GET /api/admin/users/pending, POST .../approve, POST .../reject, PendingApprovalsList, AdminUserController, AuthController

### Community 25 - "OceanDataFilter"
Cohesion: 0.22
Nodes (7): jakarta.validation.constraints.AssertTrue, org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest, org.springframework.test.web.servlet.MockMvc, OceanDataFilter, VariableStatistics, VariableSummary, StatsControllerTest

### Community 26 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 27 - "Docker Compose stack orchestration"
Cohesion: 0.33
Nodes (6): Deliverable: Deployment Package (Tertiary), Docker Compose stack orchestration, PostgreSQL primary datastore (convergence point of all flows), NFR Portability (fully containerized stack), Operating environment (Java 17, PostgreSQL 16, WebGL browsers), Four use-case flows converging on one Postgres store

### Community 28 - "App.jsx"
Cohesion: 0.11
Nodes (20): Server-Side Auth Enforcement Only, App(), Navbar(), Layout(), ProtectedRoute(), useAuthStore, AiAssistant(), DataManager() (+12 more)

### Community 29 - "StatsService.java"
Cohesion: 0.38
Nodes (4): activeHazardCount equals total advisory count, CorpusSummary, DoubleRange, TimeRange

### Community 30 - "React Logo (SVG asset)"
Cohesion: 0.60
Nodes (5): React (frontend UI framework), React Logo (SVG asset), Vite (build tool / dev server), Vite Logo (SVG asset), Vite + React Starter Scaffolding Assets

### Community 31 - "DataSeeder.java"
Cohesion: 0.25
Nodes (9): org.slf4j.Logger, org.springframework.boot.CommandLineRunner, org.springframework.data.jpa.repository.JpaRepository, org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder, org.springframework.stereotype.Component, Override, DataSeeder, ArgoFloatRepository (+1 more)

### Community 32 - "Deliverable: Public Accessibility (Tertiary)"
Cohesion: 0.40
Nodes (5): Deliverable: Public Accessibility (Tertiary), Actor: Forecaster / Researcher, Actor: Public Visitor, NFR Usability (no login, no oceanography training required), Decision: no separate Forecaster account tier

### Community 33 - "org.springframework.web.bind.annotation.GetMapping"
Cohesion: 0.20
Nodes (11): GET /api/stats/summary and /api/activity/recent, LiveMetricsPanel, RecentActivityFeed, Page: Home (public), Flat site / navigation model, org.springframework.web.bind.annotation.GetMapping, org.springframework.web.bind.annotation.RequestMapping, org.springframework.web.bind.annotation.RestController (+3 more)

### Community 34 - "Explicitly Out of Scope (No Custom OPeNDAP/WMS, No FTP Fetch)"
Cohesion: 0.67
Nodes (4): Explicitly Out of Scope (No Custom OPeNDAP/WMS, No FTP Fetch), OGC WMS/WCS Publication via GeoServer, OPeNDAP Raw Data Access via THREDDS Data Server, Upstream Data Sources (LAS INCOIS, Copernicus Marine, Argo, Gliders)

### Community 35 - "OceanDataParser (plugin contract interface)"
Cohesion: 0.20
Nodes (12): Parser Plugin Extensibility Pattern, POST /api/admin/ingest, GET /api/admin/parsers, GET /api/admin/ingestions, CF Conventions Compliance (Validated at Ingestion Time), IngestionStatusLog, ParserRegistryList, UploadPanel, AdminParserController, AsciiOceanDataParser (+4 more)

### Community 36 - "Isometric Stacked Rounded-Square Layer Mark"
Cohesion: 0.50
Nodes (4): AMBIGUOUS: Depth/Stacked Data Layer Metaphor (ocean depth slices), Hero Brand Asset (hero.png), Violet/Purple Gradient Accent on Transparent Background, Isometric Stacked Rounded-Square Layer Mark

### Community 37 - "ChartTypeSelector (single gate for all 8 chart types)"
Cohesion: 0.18
Nodes (12): ChatChartRenderer (reuses existing chart components inline in chat), ChartTypeSelector (single gate for all 8 chart types), GeoTrajectoryLayer (path polylines on Geo Map), InstrumentDetailPanel (reuses Dashboard profile-chart rendering), Chart: Depth Profile, Chart: Hovmöller Diagram, Deliverable: Operational Forecaster Dashboard (Secondary, emergent), Page: AI Assistant (public chat) (+4 more)

### Community 41 - "GET /api/admin/profile, PUT /api/admin/profile/password"
Cohesion: 0.67
Nodes (3): GET /api/admin/profile, PUT /api/admin/profile/password, ProfileAccountForm, ProfileController

### Community 42 - "FR-4 Depth-Slice & Time Control"
Cohesion: 0.67
Nodes (3): Deliverable: Interactive Control Panel (Primary), Region-of-interest selection and time slider animation, FR-4 Depth-Slice & Time Control

### Community 43 - "FR-14 Admin Authentication (JWT + approval gate)"
Cohesion: 0.67
Nodes (3): Page: Login / Signup (public, inactive-on-signup), FR-14 Admin Authentication (JWT + approval gate), REST/JSON with JWT bearer tokens for admin endpoints

### Community 57 - "org.junit.jupiter.api.Test"
Cohesion: 0.27
Nodes (5): @MockitoBean replaces @MockBean under Spring Boot 4, org.junit.jupiter.api.Test, org.springframework.boot.test.context.SpringBootTest, OceanDataControllerTest, DeepsyncAppApplicationTests

### Community 58 - "Page: Data Manager (admin only)"
Cohesion: 0.22
Nodes (9): PendingApprovalsList (admin approval of inactive signups), UploadPanel (NetCDF / ASCII file upload), HazardAdvisoryManager (advisory CRUD), Page: Data Manager (admin only), Page: Profile & Settings (admin only), Actor: Administrator, AdminParserController, AdminUserController (+1 more)

### Community 59 - "NaturalLanguageQueryService (intent extraction only)"
Cohesion: 0.40
Nodes (5): LLM Query Service (external AI API), Constraint: LLM extracts intent only, never fabricates values, NFR Availability — graceful degradation when LLM/upstream down, AiAssistantController, NaturalLanguageQueryService (intent extraction only)

### Community 60 - "MldCalculatorService (derived Mixed Layer Depth)"
Cohesion: 0.50
Nodes (4): Chart: Correlation (MLD × SST), FR-11 Derived Variables (MLD), Mixed Layer Depth (MLD) derived variable, MldCalculatorService (derived Mixed Layer Depth)

### Community 61 - "Postgres 16 Compose Service (deepsync-postgres)"
Cohesion: 0.67
Nodes (3): Local Development Workflow (Compose + Maven + Vite), Postgres 16 Compose Service (deepsync-postgres), All Four Application Flows Converge on One Postgres Store

## Ambiguous Edges - Review These
- `Graphify Skill Directive (project .claude)` → `CF Convention Check Skill`  [AMBIGUOUS]
  .claude/CLAUDE.md · relation: conceptually_related_to
- `Favicon SVG — purple zigzag bolt mark` → `Third-party template asset provenance (non-ocean branding, Figma-exported ids)`  [AMBIGUOUS]
  frontend/public/favicon.svg · relation: rationale_for
- `Icons SVG sprite sheet (6 <symbol> definitions)` → `Third-party template asset provenance (non-ocean branding, Figma-exported ids)`  [AMBIGUOUS]
  frontend/public/icons.svg · relation: rationale_for
- `Deployment Package (Dockerfiles + Compose Orchestration)` → `No Separate /about Route (Documentation Section Replaces It)`  [AMBIGUOUS]
  docs/DEEPSYNC_Interactive_Wireframe.html · relation: conceptually_related_to
- `Isometric Stacked Rounded-Square Layer Mark` → `AMBIGUOUS: Depth/Stacked Data Layer Metaphor (ocean depth slices)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to
- `Data source: Argo Global` → `Open item: unresolved 'Collection of In-situ Data' fourth source`  [AMBIGUOUS]
  graphify-out/converted/DEEPSYNC_SRS_63128d15.md · relation: conceptually_related_to
- `Eight-Chart 2D Analytical Suite` → `Planning-Stage Document Status (No Implementation Begun)`  [AMBIGUOUS]
  docs/DEEPSYNC_PRD.md · relation: conceptually_related_to

## Knowledge Gaps
- **190 isolated node(s):** `{ spawnSync }`, `path`, `{ spawnSync }`, `path`, `context7` (+185 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 267 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Graphify Skill Directive (project .claude)` and `CF Convention Check Skill`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Favicon SVG — purple zigzag bolt mark` and `Third-party template asset provenance (non-ocean branding, Figma-exported ids)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **What is the exact relationship between `Icons SVG sprite sheet (6 <symbol> definitions)` and `Third-party template asset provenance (non-ocean branding, Figma-exported ids)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **What is the exact relationship between `Deployment Package (Dockerfiles + Compose Orchestration)` and `No Separate /about Route (Documentation Section Replaces It)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Isometric Stacked Rounded-Square Layer Mark` and `AMBIGUOUS: Depth/Stacked Data Layer Metaphor (ocean depth slices)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Data source: Argo Global` and `Open item: unresolved 'Collection of In-situ Data' fourth source`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Eight-Chart 2D Analytical Suite` and `Planning-Stage Document Status (No Implementation Begun)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._