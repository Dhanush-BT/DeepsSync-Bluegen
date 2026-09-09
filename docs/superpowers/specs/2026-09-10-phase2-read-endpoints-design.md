# Phase 2 — Core Public Read Endpoints

Date: 2026-09-10
Status: approved, ready for implementation planning

## Purpose

Expose the data seeded in Phase 1 over HTTP so the frontend (Phase 3 onward) has
something real to render. This phase creates DEEPSYNC's entire REST surface and the
DTO conventions every later phase copies.

Every endpoint here is public and read-only. Authentication arrives in Phase 6 and
must not be anticipated by this work.

## Constraints

- Spring Boot 4.1.1, Java 17, Maven.
- `spring-boot-starter-web`, `-data-jpa`, `-validation` already on the classpath.
- springdoc is **not** on the classpath and is deliberately not added here (see Deferrals).
- No JPA entity may be returned from a controller (CLAUDE.md convention).
- Postgres runs in Docker on host port **5433**, not 5432 — a native `postgresql-x64-18`
  service owns 5432 on the development machine.

## Data available

Seeded and verified in Postgres on 2026-09-09:

| Table | Rows | Notes |
|---|---|---|
| `ocean_grid_point` | 384 | lat -10..25, lon 60..95, 6 depths, **1 timestamp** |
| `argo_float` | 5 | 3 `ARGO_FLOAT`, 2 `GLIDER` |
| `profile_sample` | 150 | 30 per float, 6 distinct timestamps each |
| `float_position` | 30 | 6 per float |
| `hazard_advisory` | 3 | TSUNAMI/SEVERE, HIGH_WAVE/MODERATE, PFZ/LOW |

The grid's single timestamp is a known seeding gap. `/api/ocean-data/axes` will
correctly report one entry; no endpoint should assume more than one.

## Decisions

Four choices were made explicitly, each over named alternatives.

1. **Filtering is bounding-box + depth + time on a single endpoint**, with all
   parameters optional and omission meaning unbounded. Rejected: returning the whole
   grid for client-side filtering (hard-codes an assumption that the grid stays small,
   which real INCOIS data breaks), and splitting into depth-slice and point-query
   routes (multiplies endpoints before there is a consumer).

2. **Argo data is exposed as sub-resources**, not one fat resource. `FloatSelector`
   populating a dropdown must not drag 36 child rows per float. Both `@OneToMany`
   collections are `LAZY`; sub-resources let each endpoint touch only the tables it
   needs. Rejected: a fat resource, and a fat resource with an `include=` parameter
   (a query language in disguise, with a DTO shape that varies by request).

3. **Stats is split** into `/api/stats/summary` (constant corpus counters for Home's
   `LiveMetricsPanel`) and `/api/stats/variables` (filtered aggregates for the AI
   Assistant and `colorScale.js`). They have different shapes and different cache
   characteristics; folding them together makes Home pay for aggregate math it never
   renders.

4. **Responses are bare JSON arrays**, not a `{data, meta}` envelope. Chart.js and the
   Three.js layers consume arrays directly, and corpus metadata already has a home in
   `/api/stats`.

## DTO layer — `model/`

Java records, each with a static `from(Entity)` factory.

```
OceanGridPoint      latitude, longitude, depthMeters, timestamp, temperatureC,
                    salinityPsu, currentU, currentV, chlorophyll
ArgoFloat           platformId, instrumentType, latitude, longitude,
                    profileCount, positionCount, firstObservedAt, lastObservedAt
ProfileSample       timestamp, depthMeters, temperatureC, salinityPsu,
                    currentU, currentV, chlorophyll
FloatPosition       timestamp, latitude, longitude
HazardAdvisory      id, type, region, message, severity, issuedAt
CorpusSummary       gridPointCount, floatCountByInstrumentType, depthRange,
                    latRange, lonRange, timeRange, activeHazardCount
VariableStatistics  per-variable {min, max, mean, count} for temperature, salinity
                    and chlorophyll, plus the echoed filter
OceanDataAxes       depths[], timestamps[]
```

`ArgoFloat`'s `profileCount`, `positionCount`, `firstObservedAt` and `lastObservedAt`
come from a repository projection query. They must **not** be computed by loading the
collections — that would defeat the reason sub-resources were chosen.

`HazardAdvisory` reuses the existing `HazardAdvisoryEntity.HazardType` and
`.Severity` enums rather than redeclaring them; they serialize as strings.

## The shared filter

```
model/OceanDataFilter(Double minLat, Double maxLat,
                      Double minLon, Double maxLon,
                      Double depthMeters, Instant timestamp)
```

Bound as a `@ModelAttribute`. All fields optional. Validation returns 400 when:

- `minLat > maxLat` or `minLon > maxLon`
- latitude outside [-90, 90]
- longitude outside [-180, 180]

`/api/ocean-data` and `/api/stats/variables` take the same filter and share one
null-guard `WHERE` clause on `OceanGridPointRepository`:

```
(:minLat is null or p.latitude >= :minLat) and ...
```

JPQL null-guards were chosen over JPA Specifications because Specifications do not
compose cleanly onto the aggregate projection `/api/stats/variables` needs, and one
filter idiom is better than two.

## Endpoints

| Method | Path | Returns | Notes |
|---|---|---|---|
| GET | `/api/ocean-data` | `OceanGridPoint[]` | takes the filter |
| GET | `/api/ocean-data/axes` | `OceanDataAxes` | distinct depths + timestamps |
| GET | `/api/floats` | `ArgoFloat[]` | optional `?instrumentType=` |
| GET | `/api/floats/{platformId}` | `ArgoFloat` | 404 when absent |
| GET | `/api/floats/{platformId}/profiles` | `ProfileSample[]` | optional `?timestamp=`; 404 when float absent |
| GET | `/api/floats/{platformId}/track` | `FloatPosition[]` | ordered by timestamp |
| GET | `/api/stats/summary` | `CorpusSummary` | |
| GET | `/api/stats/variables` | `VariableStatistics` | takes the filter |
| GET | `/api/hazards` | `HazardAdvisory[]` | optional `?type=`, `?severity=` |

Hazard CRUD is Phase 9 and is out of scope here.

## Error handling

One `@RestControllerAdvice` producing a consistent body:

```json
{ "timestamp": "...", "status": 404, "error": "Not Found",
  "message": "No float with platformId 9999999", "path": "/api/floats/9999999" }
```

- 404 for an unknown `platformId`
- 400 for filter validation failures and unparseable `Instant` / enum values

## Testing

Test-driven, two slices:

- `@WebMvcTest` per controller with a mocked service — routing, JSON shape, 404 and
  400 paths. Fast, no database.
- `@DataJpaTest` against a **Testcontainers Postgres** for the filter JPQL and the
  `ArgoFloat` projection query. Postgres is used rather than H2 because the null-guard
  parameters have dialect-specific type inference that H2 would not exercise.

## Deferrals

Both are deliberate, and neither is silent:

- **springdoc / Swagger UI.** CLAUDE.md calls for it, but springdoc 2.x targets Boot
  3.x while this project is on Boot 4.1.1. Landing the endpoints first, then resolving
  the version question in a focused task, avoids a dependency fight blocking Phase 2.
- **`CorsConfig`.** Vite proxies `/api` to :8080, so nothing needs CORS until the
  frontend exists in Phase 3.

## Known risks

- Hibernate may need an explicit `cast(:minLat as Double)` on Postgres to infer
  null-guard parameter types. Mechanical to fix; not a design change.
- Spring Boot 4.1.1 is very new. If `@WebMvcTest` or `@DataJpaTest` slice behaviour
  differs from the Boot 3.x documentation, prefer the Boot 4 reference over habit.

## Out of scope

Authentication, hazard CRUD, ingestion endpoints, the AI Assistant, and any frontend
work. Those are Phases 6, 9, 7 and 10 respectively.
