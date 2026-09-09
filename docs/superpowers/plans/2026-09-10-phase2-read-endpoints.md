# Phase 2 Core Read Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the Phase 1 seeded ocean data over nine public, read-only REST endpoints so the Phase 3 frontend has real data to render.

**Architecture:** Controllers stay thin and map JPA entities to `model/` records via static `from(...)` factories — no entity ever leaves a controller. A single `OceanDataFilter` record (bounding box + depth + time, all optional) is shared by `/api/ocean-data` and `/api/stats/variables`, backed by one null-guard JPQL `WHERE` clause. Argo data is exposed as sub-resources so a float list never drags its 36 child rows.

**Tech Stack:** Spring Boot 4.1.1, Java 17, Spring Data JPA / Hibernate 6, PostgreSQL 16, JUnit 5, Testcontainers, Maven.

**Spec:** `docs/superpowers/specs/2026-09-10-phase2-read-endpoints-design.md`

## Global Constraints

- Java **17**, Spring Boot **4.1.1**. Prefer the Boot 4 reference over Boot 3.x habits.
- Postgres runs in Docker on host port **5433** (a native `postgresql-x64-18` service owns 5432). Start it with `docker compose up -d postgres` from the repo root.
- **Never return a JPA entity from a controller** — always map to the `model/` record.
- Every endpoint in this plan is **public and read-only**. Do not add security annotations; auth is Phase 6.
- Package root is `com.bluegen.deepsyncapp`.
- In `@WebMvcTest`, use **`@MockitoBean`** (`org.springframework.test.context.bean.override.mockito.MockitoBean`). `@MockBean` is removed in Boot 4.
- The repo is on branch `master`. **Before the first commit**, create a branch: `git checkout -b feat/phase2-read-endpoints`.
- Do **not** add springdoc/OpenAPI or `CorsConfig` in this plan — both are deliberately deferred by the spec.
- Full test run: `./mvnw test`. Single test: `./mvnw test -Dtest=ClassName#methodName`.

---

### Task 1: Testcontainers baseline and the filtered grid query

**Files:**
- Modify: `pom.xml` (add three test dependencies)
- Modify: `src/main/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepository.java`
- Create: `src/test/java/com/bluegen/deepsyncapp/AbstractPostgresTest.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepositoryTest.java`

**Interfaces:**
- Consumes: `OceanGridPointEntity` (fields `latitude`, `longitude`, `depthMeters`, `timestamp`, `temperatureC`, `salinityPsu`, `currentU`, `currentV`, `chlorophyll`).
- Produces: `AbstractPostgresTest` (base class for all `@DataJpaTest`s) and `OceanGridPointRepository.findFiltered(Double minLat, Double maxLat, Double minLon, Double maxLon, Double depthMeters, Instant timestamp) -> List<OceanGridPointEntity>`.

- [ ] **Step 1: Add the test dependencies**

In `pom.xml`, inside `<dependencies>`, next to `spring-boot-starter-test`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-testcontainers</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

No `<version>` tags — `spring-boot-starter-parent` manages Testcontainers versions.

- [ ] **Step 2: Create the shared Postgres test base class**

Create `src/test/java/com/bluegen/deepsyncapp/AbstractPostgresTest.java`:

```java
package com.bluegen.deepsyncapp;

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base for repository tests. Runs against a real PostgreSQL 16 container rather than
 * H2 because the null-guard filter queries rely on Postgres parameter type inference,
 * which H2 does not reproduce.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
public abstract class AbstractPostgresTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16");
}
```

- [ ] **Step 3: Write the failing repository test**

Create `src/test/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepositoryTest.java`:

```java
package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.AbstractPostgresTest;
import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OceanGridPointRepositoryTest extends AbstractPostgresTest {

    private static final Instant T1 = Instant.parse("2026-09-01T00:00:00Z");
    private static final Instant T2 = Instant.parse("2026-09-02T00:00:00Z");

    @Autowired
    private OceanGridPointRepository repository;

    @BeforeEach
    void seed() {
        repository.deleteAll();
        repository.saveAll(List.of(
                point(10.0, 70.0, 0.0, T1),
                point(10.0, 70.0, 100.0, T1),
                point(20.0, 80.0, 0.0, T1),
                point(20.0, 80.0, 0.0, T2)));
    }

    private OceanGridPointEntity point(double lat, double lon, double depth, Instant at) {
        OceanGridPointEntity p = new OceanGridPointEntity();
        p.setLatitude(lat);
        p.setLongitude(lon);
        p.setDepthMeters(depth);
        p.setTimestamp(at);
        p.setTemperatureC(25.0);
        p.setSalinityPsu(35.0);
        p.setCurrentU(0.1);
        p.setCurrentV(0.2);
        p.setChlorophyll(0.5);
        return p;
    }

    @Test
    void allNullParametersReturnEverything() {
        List<OceanGridPointEntity> found =
                repository.findFiltered(null, null, null, null, null, null);

        assertThat(found).hasSize(4);
    }

    @Test
    void boundingBoxExcludesPointsOutsideIt() {
        List<OceanGridPointEntity> found =
                repository.findFiltered(5.0, 15.0, 65.0, 75.0, null, null);

        assertThat(found).hasSize(2);
        assertThat(found).allSatisfy(p -> assertThat(p.getLatitude()).isEqualTo(10.0));
    }

    @Test
    void depthAndTimestampNarrowFurther() {
        List<OceanGridPointEntity> found =
                repository.findFiltered(null, null, null, null, 0.0, T2);

        assertThat(found).hasSize(1);
        assertThat(found.get(0).getLongitude()).isEqualTo(80.0);
    }

    @Test
    void resultsAreOrderedByDepthThenLatitudeThenLongitude() {
        List<OceanGridPointEntity> found =
                repository.findFiltered(null, null, null, null, null, T1);

        assertThat(found).extracting(OceanGridPointEntity::getDepthMeters)
                .containsExactly(0.0, 0.0, 100.0);
        assertThat(found.get(0).getLatitude()).isEqualTo(10.0);
    }
}
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `./mvnw test -Dtest=OceanGridPointRepositoryTest`
Expected: FAIL — compilation error, `findFiltered` is not defined on `OceanGridPointRepository`.

- [ ] **Step 5: Add the filter query**

Replace `src/main/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepository.java` with:

```java
package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface OceanGridPointRepository extends JpaRepository<OceanGridPointEntity, Long> {

    /**
     * Every parameter is optional; a null means "unbounded on this axis". Shared verbatim
     * by the ocean-data endpoint and the variable-statistics endpoint so both agree on
     * what a filter means.
     */
    @Query("""
            select p from OceanGridPointEntity p
            where (:minLat is null or p.latitude >= :minLat)
              and (:maxLat is null or p.latitude <= :maxLat)
              and (:minLon is null or p.longitude >= :minLon)
              and (:maxLon is null or p.longitude <= :maxLon)
              and (:depthMeters is null or p.depthMeters = :depthMeters)
              and (:timestamp is null or p.timestamp = :timestamp)
            order by p.depthMeters asc, p.latitude asc, p.longitude asc
            """)
    List<OceanGridPointEntity> findFiltered(@Param("minLat") Double minLat,
                                            @Param("maxLat") Double maxLat,
                                            @Param("minLon") Double minLon,
                                            @Param("maxLon") Double maxLon,
                                            @Param("depthMeters") Double depthMeters,
                                            @Param("timestamp") Instant timestamp);
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `./mvnw test -Dtest=OceanGridPointRepositoryTest`
Expected: PASS, 4 tests.

If Hibernate reports it cannot determine a parameter type, wrap each guard as
`(cast(:minLat as Double) is null or ...)`. This is the known risk recorded in the spec.

- [ ] **Step 7: Commit**

```bash
git checkout -b feat/phase2-read-endpoints
git add pom.xml src/test/java/com/bluegen/deepsyncapp/AbstractPostgresTest.java src/test/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepositoryTest.java src/main/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepository.java
git commit -m "feat: add filtered ocean grid query with Testcontainers coverage"
```

---

### Task 2: GET /api/ocean-data with the shared filter and error handling

**Files:**
- Create: `src/main/java/com/bluegen/deepsyncapp/model/OceanGridPoint.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/OceanDataFilter.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/ApiError.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/controller/GlobalExceptionHandler.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/service/OceanDataService.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/controller/OceanDataController.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/controller/OceanDataControllerTest.java`

**Interfaces:**
- Consumes: `OceanGridPointRepository.findFiltered(...)` from Task 1.
- Produces: `OceanDataFilter` (record, used again by Task 7), `OceanGridPoint.from(OceanGridPointEntity)`, `OceanDataService.findPoints(OceanDataFilter) -> List<OceanGridPoint>`, and `GlobalExceptionHandler` which later tasks extend for 404s.

- [ ] **Step 1: Write the failing controller test**

Create `src/test/java/com/bluegen/deepsyncapp/controller/OceanDataControllerTest.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.OceanGridPoint;
import com.bluegen.deepsyncapp.service.OceanDataService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OceanDataController.class)
class OceanDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OceanDataService oceanDataService;

    @Test
    void returnsGridPointsAsAJsonArray() throws Exception {
        when(oceanDataService.findPoints(any())).thenReturn(List.of(
                new OceanGridPoint(10.0, 70.0, 0.0, Instant.parse("2026-09-01T00:00:00Z"),
                        27.5, 34.6, 0.1, 0.2, 0.5)));

        mockMvc.perform(get("/api/ocean-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].latitude").value(10.0))
                .andExpect(jsonPath("$[0].temperatureC").value(27.5))
                .andExpect(jsonPath("$[0].timestamp").value("2026-09-01T00:00:00Z"));
    }

    @Test
    void bindsAllFilterParameters() throws Exception {
        when(oceanDataService.findPoints(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/ocean-data")
                        .param("minLat", "5").param("maxLat", "15")
                        .param("minLon", "65").param("maxLon", "75")
                        .param("depthMeters", "100")
                        .param("timestamp", "2026-09-01T00:00:00Z"))
                .andExpect(status().isOk());

        ArgumentCaptor<OceanDataFilter> captor = ArgumentCaptor.forClass(OceanDataFilter.class);
        verify(oceanDataService).findPoints(captor.capture());
        OceanDataFilter filter = captor.getValue();
        assertThat(filter.minLat()).isEqualTo(5.0);
        assertThat(filter.depthMeters()).isEqualTo(100.0);
        assertThat(filter.timestamp()).isEqualTo(Instant.parse("2026-09-01T00:00:00Z"));
    }

    @Test
    void rejectsInvertedLatitudeRangeWith400() throws Exception {
        mockMvc.perform(get("/api/ocean-data").param("minLat", "20").param("maxLat", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.path").value("/api/ocean-data"));
    }

    @Test
    void rejectsOutOfRangeLatitudeWith400() throws Exception {
        mockMvc.perform(get("/api/ocean-data").param("minLat", "-200"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsUnparseableTimestampWith400() throws Exception {
        mockMvc.perform(get("/api/ocean-data").param("timestamp", "yesterday"))
                .andExpect(status().isBadRequest());
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./mvnw test -Dtest=OceanDataControllerTest`
Expected: FAIL — compilation error, none of `OceanDataController`, `OceanDataService`, `OceanGridPoint` or `OceanDataFilter` exist.

- [ ] **Step 3: Create the DTO record**

Create `src/main/java/com/bluegen/deepsyncapp/model/OceanGridPoint.java`:

```java
package com.bluegen.deepsyncapp.model;

import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;

import java.time.Instant;

public record OceanGridPoint(Double latitude,
                             Double longitude,
                             Double depthMeters,
                             Instant timestamp,
                             Double temperatureC,
                             Double salinityPsu,
                             Double currentU,
                             Double currentV,
                             Double chlorophyll) {

    public static OceanGridPoint from(OceanGridPointEntity entity) {
        return new OceanGridPoint(
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getDepthMeters(),
                entity.getTimestamp(),
                entity.getTemperatureC(),
                entity.getSalinityPsu(),
                entity.getCurrentU(),
                entity.getCurrentV(),
                entity.getChlorophyll());
    }
}
```

- [ ] **Step 4: Create the shared filter record**

Create `src/main/java/com/bluegen/deepsyncapp/model/OceanDataFilter.java`:

```java
package com.bluegen.deepsyncapp.model;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import java.time.Instant;

/**
 * Bounding box plus depth and time. Every field is optional; null means unbounded on
 * that axis. Shared by /api/ocean-data and /api/stats/variables.
 */
public record OceanDataFilter(
        @DecimalMin("-90") @DecimalMax("90") Double minLat,
        @DecimalMin("-90") @DecimalMax("90") Double maxLat,
        @DecimalMin("-180") @DecimalMax("180") Double minLon,
        @DecimalMin("-180") @DecimalMax("180") Double maxLon,
        Double depthMeters,
        Instant timestamp) {

    @AssertTrue(message = "minLat must be less than or equal to maxLat")
    public boolean isLatitudeRangeOrdered() {
        return minLat == null || maxLat == null || minLat <= maxLat;
    }

    @AssertTrue(message = "minLon must be less than or equal to maxLon")
    public boolean isLongitudeRangeOrdered() {
        return minLon == null || maxLon == null || minLon <= maxLon;
    }
}
```

- [ ] **Step 5: Create the error body and handler**

Create `src/main/java/com/bluegen/deepsyncapp/model/ApiError.java`:

```java
package com.bluegen.deepsyncapp.model;

import java.time.Instant;

public record ApiError(Instant timestamp, int status, String error, String message, String path) {
}
```

Create `src/main/java/com/bluegen/deepsyncapp/controller/GlobalExceptionHandler.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBindException(BindException exception,
                                                        HttpServletRequest request) {
        String message = exception.getBindingResult().getAllErrors().stream()
                .map(this::describe)
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException exception,
                                                       HttpServletRequest request) {
        String message = "Parameter '%s' has an unusable value: %s"
                .formatted(exception.getName(), exception.getValue());
        return build(HttpStatus.BAD_REQUEST, message, request);
    }

    private String describe(ObjectError error) {
        if (error instanceof FieldError fieldError) {
            return "%s %s".formatted(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return error.getDefaultMessage();
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message,
                                           HttpServletRequest request) {
        ApiError body = new ApiError(Instant.now(), status.value(),
                status.getReasonPhrase(), message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
```

- [ ] **Step 6: Create the service and controller**

Create `src/main/java/com/bluegen/deepsyncapp/service/OceanDataService.java`:

```java
package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.OceanGridPoint;
import com.bluegen.deepsyncapp.repository.OceanGridPointRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OceanDataService {

    private final OceanGridPointRepository repository;

    public OceanDataService(OceanGridPointRepository repository) {
        this.repository = repository;
    }

    public List<OceanGridPoint> findPoints(OceanDataFilter filter) {
        return repository.findFiltered(
                        filter.minLat(), filter.maxLat(),
                        filter.minLon(), filter.maxLon(),
                        filter.depthMeters(), filter.timestamp())
                .stream()
                .map(OceanGridPoint::from)
                .toList();
    }
}
```

Create `src/main/java/com/bluegen/deepsyncapp/controller/OceanDataController.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.OceanGridPoint;
import com.bluegen.deepsyncapp.service.OceanDataService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ocean-data")
public class OceanDataController {

    private final OceanDataService oceanDataService;

    public OceanDataController(OceanDataService oceanDataService) {
        this.oceanDataService = oceanDataService;
    }

    @GetMapping
    public List<OceanGridPoint> gridPoints(@Valid @ModelAttribute OceanDataFilter filter) {
        return oceanDataService.findPoints(filter);
    }
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `./mvnw test -Dtest=OceanDataControllerTest`
Expected: PASS, 5 tests.

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/bluegen/deepsyncapp src/test/java/com/bluegen/deepsyncapp
git commit -m "feat: add GET /api/ocean-data with shared filter and error handling"
```

---

### Task 3: GET /api/ocean-data/axes

**Files:**
- Modify: `src/main/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepository.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/OceanDataAxes.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/service/OceanDataService.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/controller/OceanDataController.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/controller/OceanDataControllerTest.java` (add a test)

**Interfaces:**
- Consumes: `OceanDataService` and `OceanDataController` from Task 2.
- Produces: `OceanDataService.findAxes() -> OceanDataAxes`, where `OceanDataAxes(List<Double> depths, List<Instant> timestamps)`.

**Note:** the seeded grid currently has exactly **one** timestamp. A single-element `timestamps` array is the correct, expected result — not a bug.

- [ ] **Step 1: Write the failing test**

Append this test to `OceanDataControllerTest`, and add the import
`com.bluegen.deepsyncapp.model.OceanDataAxes`:

```java
    @Test
    void exposesTheDistinctDepthAndTimeAxes() throws Exception {
        when(oceanDataService.findAxes()).thenReturn(new OceanDataAxes(
                List.of(0.0, 50.0, 100.0),
                List.of(Instant.parse("2026-09-01T00:00:00Z"))));

        mockMvc.perform(get("/api/ocean-data/axes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.depths.length()").value(3))
                .andExpect(jsonPath("$.depths[0]").value(0.0))
                .andExpect(jsonPath("$.timestamps.length()").value(1))
                .andExpect(jsonPath("$.timestamps[0]").value("2026-09-01T00:00:00Z"));
    }
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./mvnw test -Dtest=OceanDataControllerTest#exposesTheDistinctDepthAndTimeAxes`
Expected: FAIL — `OceanDataAxes` does not exist.

- [ ] **Step 3: Add the axis queries**

Add to `OceanGridPointRepository`, keeping `findFiltered` as it is:

```java
    @Query("select distinct p.depthMeters from OceanGridPointEntity p order by p.depthMeters asc")
    List<Double> findDistinctDepths();

    @Query("select distinct p.timestamp from OceanGridPointEntity p order by p.timestamp asc")
    List<Instant> findDistinctTimestamps();
```

- [ ] **Step 4: Add the DTO, service method and route**

Create `src/main/java/com/bluegen/deepsyncapp/model/OceanDataAxes.java`:

```java
package com.bluegen.deepsyncapp.model;

import java.time.Instant;
import java.util.List;

/** The discrete depth and time steps present in the grid, for TimeSlider and depth pickers. */
public record OceanDataAxes(List<Double> depths, List<Instant> timestamps) {
}
```

Add to `OceanDataService`:

```java
    public OceanDataAxes findAxes() {
        return new OceanDataAxes(repository.findDistinctDepths(), repository.findDistinctTimestamps());
    }
```

Add to `OceanDataController`:

```java
    @GetMapping("/axes")
    public OceanDataAxes axes() {
        return oceanDataService.findAxes();
    }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `./mvnw test -Dtest=OceanDataControllerTest`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/bluegen/deepsyncapp src/test/java/com/bluegen/deepsyncapp
git commit -m "feat: add GET /api/ocean-data/axes"
```

---

### Task 4: GET /api/floats and /api/floats/{platformId}

**Files:**
- Create: `src/main/java/com/bluegen/deepsyncapp/model/ArgoFloat.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/service/NotFoundException.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/controller/GlobalExceptionHandler.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/repository/ArgoFloatRepository.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/service/ArgoService.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/controller/ArgoController.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/repository/ArgoFloatRepositoryTest.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/controller/ArgoControllerTest.java`

**Interfaces:**
- Consumes: `AbstractPostgresTest` (Task 1), `GlobalExceptionHandler` (Task 2).
- Produces: `ArgoFloat(String platformId, String instrumentType, Double latitude, Double longitude, Long profileCount, Long positionCount, Instant firstObservedAt, Instant lastObservedAt)`, `NotFoundException`, `ArgoService.findFloats(String instrumentType) -> List<ArgoFloat>`, `ArgoService.findFloat(String platformId) -> ArgoFloat`.

- [ ] **Step 1: Write the failing repository test**

Create `src/test/java/com/bluegen/deepsyncapp/repository/ArgoFloatRepositoryTest.java`:

```java
package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.AbstractPostgresTest;
import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import com.bluegen.deepsyncapp.model.ArgoFloat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ArgoFloatRepositoryTest extends AbstractPostgresTest {

    private static final Instant T1 = Instant.parse("2026-09-01T00:00:00Z");
    private static final Instant T2 = Instant.parse("2026-09-05T00:00:00Z");

    @Autowired
    private ArgoFloatRepository repository;

    @BeforeEach
    void seed() {
        repository.deleteAll();

        ArgoFloatEntity floaty = new ArgoFloatEntity();
        floaty.setPlatformId("1111111");
        floaty.setInstrumentType("ARGO_FLOAT");
        floaty.setLatitude(12.0);
        floaty.setLongitude(72.0);
        floaty.addProfileSample(sample(T1, 0.0));
        floaty.addProfileSample(sample(T2, 0.0));
        floaty.addPosition(position(T1, 12.0, 72.0));

        ArgoFloatEntity glider = new ArgoFloatEntity();
        glider.setPlatformId("2222222");
        glider.setInstrumentType("GLIDER");
        glider.setLatitude(15.0);
        glider.setLongitude(75.0);

        repository.saveAll(List.of(floaty, glider));
    }

    private ProfileSampleEntity sample(Instant at, Double depth) {
        ProfileSampleEntity s = new ProfileSampleEntity();
        s.setTimestamp(at);
        s.setDepthMeters(depth);
        s.setTemperatureC(27.0);
        s.setSalinityPsu(34.5);
        return s;
    }

    private FloatPositionEntity position(Instant at, Double lat, Double lon) {
        FloatPositionEntity p = new FloatPositionEntity();
        p.setTimestamp(at);
        p.setLatitude(lat);
        p.setLongitude(lon);
        return p;
    }

    @Test
    void projectsChildCountsWithoutLoadingCollections() {
        List<ArgoFloat> floats = repository.findProjectedFloats(null);

        assertThat(floats).hasSize(2);
        ArgoFloat first = floats.get(0);
        assertThat(first.platformId()).isEqualTo("1111111");
        assertThat(first.profileCount()).isEqualTo(2L);
        assertThat(first.positionCount()).isEqualTo(1L);
        assertThat(first.firstObservedAt()).isEqualTo(T1);
        assertThat(first.lastObservedAt()).isEqualTo(T2);
    }

    @Test
    void reportsZeroCountsForAFloatWithNoChildren() {
        List<ArgoFloat> floats = repository.findProjectedFloats("GLIDER");

        assertThat(floats).hasSize(1);
        assertThat(floats.get(0).profileCount()).isZero();
        assertThat(floats.get(0).firstObservedAt()).isNull();
    }

    @Test
    void filtersByInstrumentType() {
        assertThat(repository.findProjectedFloats("ARGO_FLOAT"))
                .extracting(ArgoFloat::platformId)
                .containsExactly("1111111");
    }

    @Test
    void findsASingleFloatByPlatformId() {
        assertThat(repository.findProjectedFloat("2222222")).isPresent();
        assertThat(repository.findProjectedFloat("9999999")).isEmpty();
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./mvnw test -Dtest=ArgoFloatRepositoryTest`
Expected: FAIL — `ArgoFloat` and `findProjectedFloats` do not exist.

- [ ] **Step 3: Create the ArgoFloat DTO**

Create `src/main/java/com/bluegen/deepsyncapp/model/ArgoFloat.java`:

```java
package com.bluegen.deepsyncapp.model;

import java.time.Instant;

/**
 * Summary view of an instrument. The four aggregate fields come from a projection query,
 * never from walking the LAZY child collections - that is the point of exposing profiles
 * and track as separate sub-resources.
 */
public record ArgoFloat(String platformId,
                        String instrumentType,
                        Double latitude,
                        Double longitude,
                        Long profileCount,
                        Long positionCount,
                        Instant firstObservedAt,
                        Instant lastObservedAt) {
}
```

- [ ] **Step 4: Add the projection queries**

Replace `src/main/java/com/bluegen/deepsyncapp/repository/ArgoFloatRepository.java` with:

```java
package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.model.ArgoFloat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArgoFloatRepository extends JpaRepository<ArgoFloatEntity, Long> {

    Optional<ArgoFloatEntity> findByPlatformId(String platformId);

    @Query("""
            select new com.bluegen.deepsyncapp.model.ArgoFloat(
                f.platformId, f.instrumentType, f.latitude, f.longitude,
                count(distinct s.id), count(distinct p.id),
                min(s.timestamp), max(s.timestamp))
            from ArgoFloatEntity f
            left join f.profileSamples s
            left join f.positions p
            where (:instrumentType is null or f.instrumentType = :instrumentType)
            group by f.id, f.platformId, f.instrumentType, f.latitude, f.longitude
            order by f.platformId asc
            """)
    List<ArgoFloat> findProjectedFloats(@Param("instrumentType") String instrumentType);

    @Query("""
            select new com.bluegen.deepsyncapp.model.ArgoFloat(
                f.platformId, f.instrumentType, f.latitude, f.longitude,
                count(distinct s.id), count(distinct p.id),
                min(s.timestamp), max(s.timestamp))
            from ArgoFloatEntity f
            left join f.profileSamples s
            left join f.positions p
            where f.platformId = :platformId
            group by f.id, f.platformId, f.instrumentType, f.latitude, f.longitude
            """)
    Optional<ArgoFloat> findProjectedFloat(@Param("platformId") String platformId);
}
```

- [ ] **Step 5: Run the repository test to verify it passes**

Run: `./mvnw test -Dtest=ArgoFloatRepositoryTest`
Expected: PASS, 4 tests.

- [ ] **Step 6: Write the failing controller test**

Create `src/test/java/com/bluegen/deepsyncapp/controller/ArgoControllerTest.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.service.ArgoService;
import com.bluegen.deepsyncapp.service.NotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArgoController.class)
class ArgoControllerTest {

    private static final ArgoFloat FLOAT = new ArgoFloat("2900226", "ARGO_FLOAT", 12.0, 72.0,
            30L, 6L, Instant.parse("2026-09-01T00:00:00Z"), Instant.parse("2026-09-06T00:00:00Z"));

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArgoService argoService;

    @Test
    void listsFloats() throws Exception {
        when(argoService.findFloats(null)).thenReturn(List.of(FLOAT));

        mockMvc.perform(get("/api/floats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].platformId").value("2900226"))
                .andExpect(jsonPath("$[0].profileCount").value(30));
    }

    @Test
    void passesInstrumentTypeThrough() throws Exception {
        when(argoService.findFloats("GLIDER")).thenReturn(List.of());

        mockMvc.perform(get("/api/floats").param("instrumentType", "GLIDER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void returnsASingleFloat() throws Exception {
        when(argoService.findFloat("2900226")).thenReturn(FLOAT);

        mockMvc.perform(get("/api/floats/2900226"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instrumentType").value("ARGO_FLOAT"));
    }

    @Test
    void returns404ForAnUnknownPlatformId() throws Exception {
        when(argoService.findFloat("9999999"))
                .thenThrow(new NotFoundException("No float with platformId 9999999"));

        mockMvc.perform(get("/api/floats/9999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("No float with platformId 9999999"))
                .andExpect(jsonPath("$.path").value("/api/floats/9999999"));
    }
}
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `./mvnw test -Dtest=ArgoControllerTest`
Expected: FAIL — `ArgoController`, `ArgoService` and `NotFoundException` do not exist.

- [ ] **Step 8: Add NotFoundException and the 404 handler**

Create `src/main/java/com/bluegen/deepsyncapp/service/NotFoundException.java`:

```java
package com.bluegen.deepsyncapp.service;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
```

Add to `GlobalExceptionHandler`, importing `com.bluegen.deepsyncapp.service.NotFoundException`:

```java
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException exception,
                                                   HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }
```

- [ ] **Step 9: Create the service and controller**

Create `src/main/java/com/bluegen/deepsyncapp/service/ArgoService.java`:

```java
package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArgoService {

    private final ArgoFloatRepository argoFloatRepository;

    public ArgoService(ArgoFloatRepository argoFloatRepository) {
        this.argoFloatRepository = argoFloatRepository;
    }

    public List<ArgoFloat> findFloats(String instrumentType) {
        return argoFloatRepository.findProjectedFloats(instrumentType);
    }

    public ArgoFloat findFloat(String platformId) {
        return argoFloatRepository.findProjectedFloat(platformId)
                .orElseThrow(() -> new NotFoundException(
                        "No float with platformId " + platformId));
    }
}
```

Create `src/main/java/com/bluegen/deepsyncapp/controller/ArgoController.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.service.ArgoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/floats")
public class ArgoController {

    private final ArgoService argoService;

    public ArgoController(ArgoService argoService) {
        this.argoService = argoService;
    }

    @GetMapping
    public List<ArgoFloat> floats(@RequestParam(required = false) String instrumentType) {
        return argoService.findFloats(instrumentType);
    }

    @GetMapping("/{platformId}")
    public ArgoFloat floatByPlatformId(@PathVariable String platformId) {
        return argoService.findFloat(platformId);
    }
}
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `./mvnw test -Dtest=ArgoControllerTest`
Expected: PASS, 4 tests.

- [ ] **Step 11: Commit**

```bash
git add src/main/java/com/bluegen/deepsyncapp src/test/java/com/bluegen/deepsyncapp
git commit -m "feat: add float list and detail endpoints with 404 handling"
```

---

### Task 5: Float sub-resources — profiles and track

**Files:**
- Create: `src/main/java/com/bluegen/deepsyncapp/model/ProfileSample.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/FloatPosition.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/repository/ProfileSampleRepository.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/repository/FloatPositionRepository.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/service/ArgoService.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/controller/ArgoController.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/controller/ArgoControllerTest.java` (add tests)

**Interfaces:**
- Consumes: `ArgoService`, `ArgoController`, `NotFoundException` from Task 4.
- Produces: `ArgoService.findProfiles(String platformId, Instant timestamp) -> List<ProfileSample>` and `ArgoService.findTrack(String platformId) -> List<FloatPosition>`.

**Note on `ProfileSampleRepository`:** CLAUDE.md says `ProfileSampleEntity` is reached through `ArgoFloatEntity`'s cascade and lists no repository for it. That holds for *writes* — the cascade still owns persistence. A read-only query repository is needed here because the whole point of the sub-resource decision is fetching samples without loading the parent's collection. This is a deliberate, narrow exception; do not add save or delete usage.

- [ ] **Step 1: Write the failing tests**

Append these four tests to `ArgoControllerTest`, adding the imports
`com.bluegen.deepsyncapp.model.ProfileSample` and `com.bluegen.deepsyncapp.model.FloatPosition`:

```java
    @Test
    void returnsProfileSamplesForAFloat() throws Exception {
        when(argoService.findProfiles("2900226", null)).thenReturn(List.of(
                new ProfileSample(Instant.parse("2026-09-01T00:00:00Z"), 0.0,
                        27.09, 34.46, 0.1, 0.2, 0.5)));

        mockMvc.perform(get("/api/floats/2900226/profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].depthMeters").value(0.0))
                .andExpect(jsonPath("$[0].temperatureC").value(27.09));
    }

    @Test
    void filtersProfileSamplesByTimestamp() throws Exception {
        Instant at = Instant.parse("2026-09-03T00:00:00Z");
        when(argoService.findProfiles("2900226", at)).thenReturn(List.of());

        mockMvc.perform(get("/api/floats/2900226/profiles")
                        .param("timestamp", "2026-09-03T00:00:00Z"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void returns404WhenProfilesRequestedForUnknownFloat() throws Exception {
        when(argoService.findProfiles("9999999", null))
                .thenThrow(new NotFoundException("No float with platformId 9999999"));

        mockMvc.perform(get("/api/floats/9999999/profiles"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returnsTheTrackOrderedByTime() throws Exception {
        when(argoService.findTrack("2900226")).thenReturn(List.of(
                new FloatPosition(Instant.parse("2026-09-01T00:00:00Z"), 12.0, 72.0),
                new FloatPosition(Instant.parse("2026-09-02T00:00:00Z"), 12.5, 72.5)));

        mockMvc.perform(get("/api/floats/2900226/track"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].latitude").value(12.5));
    }
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `./mvnw test -Dtest=ArgoControllerTest`
Expected: FAIL — `ProfileSample` and `FloatPosition` do not exist.

- [ ] **Step 3: Create the two DTOs**

Create `src/main/java/com/bluegen/deepsyncapp/model/ProfileSample.java`:

```java
package com.bluegen.deepsyncapp.model;

import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;

import java.time.Instant;

public record ProfileSample(Instant timestamp,
                            Double depthMeters,
                            Double temperatureC,
                            Double salinityPsu,
                            Double currentU,
                            Double currentV,
                            Double chlorophyll) {

    public static ProfileSample from(ProfileSampleEntity entity) {
        return new ProfileSample(
                entity.getTimestamp(),
                entity.getDepthMeters(),
                entity.getTemperatureC(),
                entity.getSalinityPsu(),
                entity.getCurrentU(),
                entity.getCurrentV(),
                entity.getChlorophyll());
    }
}
```

Create `src/main/java/com/bluegen/deepsyncapp/model/FloatPosition.java`:

```java
package com.bluegen.deepsyncapp.model;

import com.bluegen.deepsyncapp.entity.FloatPositionEntity;

import java.time.Instant;

public record FloatPosition(Instant timestamp, Double latitude, Double longitude) {

    public static FloatPosition from(FloatPositionEntity entity) {
        return new FloatPosition(entity.getTimestamp(), entity.getLatitude(),
                entity.getLongitude());
    }
}
```

- [ ] **Step 4: Add the read repositories**

Create `src/main/java/com/bluegen/deepsyncapp/repository/ProfileSampleRepository.java`:

```java
package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

/**
 * Read-only. Writes go through ArgoFloatEntity's cascade; this exists so the profiles
 * sub-resource can query samples without loading the parent's LAZY collection.
 */
public interface ProfileSampleRepository extends JpaRepository<ProfileSampleEntity, Long> {

    @Query("""
            select s from ProfileSampleEntity s
            where s.argoFloat.platformId = :platformId
              and (:timestamp is null or s.timestamp = :timestamp)
            order by s.timestamp asc, s.depthMeters asc
            """)
    List<ProfileSampleEntity> findByPlatformId(@Param("platformId") String platformId,
                                               @Param("timestamp") Instant timestamp);
}
```

Replace `src/main/java/com/bluegen/deepsyncapp/repository/FloatPositionRepository.java` with:

```java
package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FloatPositionRepository extends JpaRepository<FloatPositionEntity, Long> {

    List<FloatPositionEntity> findByArgoFloatIdOrderByTimestampAsc(Long argoFloatId);

    @Query("""
            select p from FloatPositionEntity p
            where p.argoFloat.platformId = :platformId
            order by p.timestamp asc
            """)
    List<FloatPositionEntity> findByPlatformIdOrderByTimestampAsc(
            @Param("platformId") String platformId);
}
```

- [ ] **Step 5: Extend the service**

In `ArgoService`, add the two repositories to the constructor and add both methods.
Add imports for `ProfileSample`, `FloatPosition`, `ProfileSampleRepository`,
`FloatPositionRepository` and `java.time.Instant`:

```java
    private final ProfileSampleRepository profileSampleRepository;
    private final FloatPositionRepository floatPositionRepository;

    public ArgoService(ArgoFloatRepository argoFloatRepository,
                       ProfileSampleRepository profileSampleRepository,
                       FloatPositionRepository floatPositionRepository) {
        this.argoFloatRepository = argoFloatRepository;
        this.profileSampleRepository = profileSampleRepository;
        this.floatPositionRepository = floatPositionRepository;
    }

    public List<ProfileSample> findProfiles(String platformId, Instant timestamp) {
        requireFloat(platformId);
        return profileSampleRepository.findByPlatformId(platformId, timestamp)
                .stream().map(ProfileSample::from).toList();
    }

    public List<FloatPosition> findTrack(String platformId) {
        requireFloat(platformId);
        return floatPositionRepository.findByPlatformIdOrderByTimestampAsc(platformId)
                .stream().map(FloatPosition::from).toList();
    }

    private void requireFloat(String platformId) {
        if (argoFloatRepository.findByPlatformId(platformId).isEmpty()) {
            throw new NotFoundException("No float with platformId " + platformId);
        }
    }
```

- [ ] **Step 6: Add the two routes**

Add to `ArgoController`, importing `ProfileSample`, `FloatPosition`, `java.time.Instant`
and `org.springframework.format.annotation.DateTimeFormat`:

```java
    @GetMapping("/{platformId}/profiles")
    public List<ProfileSample> profiles(
            @PathVariable String platformId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant timestamp) {
        return argoService.findProfiles(platformId, timestamp);
    }

    @GetMapping("/{platformId}/track")
    public List<FloatPosition> track(@PathVariable String platformId) {
        return argoService.findTrack(platformId);
    }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `./mvnw test -Dtest=ArgoControllerTest`
Expected: PASS, 8 tests.

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/bluegen/deepsyncapp src/test/java/com/bluegen/deepsyncapp
git commit -m "feat: add float profiles and track sub-resources"
```

---

### Task 6: GET /api/stats/summary

**Files:**
- Create: `src/main/java/com/bluegen/deepsyncapp/model/DoubleRange.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/TimeRange.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/GridExtent.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/CorpusSummary.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepository.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/repository/ArgoFloatRepository.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/service/StatsService.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/controller/StatsController.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/controller/StatsControllerTest.java`

**Interfaces:**
- Consumes: `OceanGridPointRepository`, `ArgoFloatRepository`, `HazardAdvisoryRepository`.
- Produces: `StatsService.summary() -> CorpusSummary`.

**Note:** `HazardAdvisoryEntity` has no expiry field, so `activeHazardCount` is simply the
total advisory count. Do not invent an expiry column.

- [ ] **Step 1: Write the failing test**

Create `src/test/java/com/bluegen/deepsyncapp/controller/StatsControllerTest.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.CorpusSummary;
import com.bluegen.deepsyncapp.model.DoubleRange;
import com.bluegen.deepsyncapp.model.TimeRange;
import com.bluegen.deepsyncapp.service.StatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StatsController.class)
class StatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StatsService statsService;

    @Test
    void reportsTheCorpusSummary() throws Exception {
        when(statsService.summary()).thenReturn(new CorpusSummary(
                384L,
                Map.of("ARGO_FLOAT", 3L, "GLIDER", 2L),
                new DoubleRange(0.0, 1000.0),
                new DoubleRange(-10.0, 25.0),
                new DoubleRange(60.0, 95.0),
                new TimeRange(Instant.parse("2026-09-01T00:00:00Z"),
                        Instant.parse("2026-09-01T00:00:00Z")),
                3L));

        mockMvc.perform(get("/api/stats/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gridPointCount").value(384))
                .andExpect(jsonPath("$.floatCountByInstrumentType.ARGO_FLOAT").value(3))
                .andExpect(jsonPath("$.depthRange.max").value(1000.0))
                .andExpect(jsonPath("$.latRange.min").value(-10.0))
                .andExpect(jsonPath("$.activeHazardCount").value(3));
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./mvnw test -Dtest=StatsControllerTest`
Expected: FAIL — `StatsController`, `StatsService` and the summary records do not exist.

- [ ] **Step 3: Create the summary records**

Create `src/main/java/com/bluegen/deepsyncapp/model/DoubleRange.java`:

```java
package com.bluegen.deepsyncapp.model;

public record DoubleRange(Double min, Double max) {
}
```

Create `src/main/java/com/bluegen/deepsyncapp/model/TimeRange.java`:

```java
package com.bluegen.deepsyncapp.model;

import java.time.Instant;

public record TimeRange(Instant min, Instant max) {
}
```

Create `src/main/java/com/bluegen/deepsyncapp/model/GridExtent.java`:

```java
package com.bluegen.deepsyncapp.model;

import java.time.Instant;

/** Flat projection target for the grid extent query; assembled into CorpusSummary. */
public record GridExtent(Long count,
                         Double minDepth, Double maxDepth,
                         Double minLat, Double maxLat,
                         Double minLon, Double maxLon,
                         Instant earliest, Instant latest) {
}
```

Create `src/main/java/com/bluegen/deepsyncapp/model/CorpusSummary.java`:

```java
package com.bluegen.deepsyncapp.model;

import java.util.Map;

public record CorpusSummary(Long gridPointCount,
                            Map<String, Long> floatCountByInstrumentType,
                            DoubleRange depthRange,
                            DoubleRange latRange,
                            DoubleRange lonRange,
                            TimeRange timeRange,
                            Long activeHazardCount) {
}
```

- [ ] **Step 4: Add the aggregate queries**

Add to `OceanGridPointRepository`, importing `com.bluegen.deepsyncapp.model.GridExtent`:

```java
    @Query("""
            select new com.bluegen.deepsyncapp.model.GridExtent(
                count(p),
                min(p.depthMeters), max(p.depthMeters),
                min(p.latitude), max(p.latitude),
                min(p.longitude), max(p.longitude),
                min(p.timestamp), max(p.timestamp))
            from OceanGridPointEntity p
            """)
    GridExtent findGridExtent();
```

Add to `ArgoFloatRepository`:

```java
    @Query("select f.instrumentType, count(f) from ArgoFloatEntity f group by f.instrumentType")
    List<Object[]> countByInstrumentType();
```

- [ ] **Step 5: Create the service and controller**

Create `src/main/java/com/bluegen/deepsyncapp/service/StatsService.java`:

```java
package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.model.CorpusSummary;
import com.bluegen.deepsyncapp.model.DoubleRange;
import com.bluegen.deepsyncapp.model.GridExtent;
import com.bluegen.deepsyncapp.model.TimeRange;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import com.bluegen.deepsyncapp.repository.HazardAdvisoryRepository;
import com.bluegen.deepsyncapp.repository.OceanGridPointRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class StatsService {

    private final OceanGridPointRepository gridRepository;
    private final ArgoFloatRepository argoFloatRepository;
    private final HazardAdvisoryRepository hazardAdvisoryRepository;

    public StatsService(OceanGridPointRepository gridRepository,
                        ArgoFloatRepository argoFloatRepository,
                        HazardAdvisoryRepository hazardAdvisoryRepository) {
        this.gridRepository = gridRepository;
        this.argoFloatRepository = argoFloatRepository;
        this.hazardAdvisoryRepository = hazardAdvisoryRepository;
    }

    public CorpusSummary summary() {
        GridExtent extent = gridRepository.findGridExtent();

        Map<String, Long> byType = new LinkedHashMap<>();
        for (Object[] row : argoFloatRepository.countByInstrumentType()) {
            byType.put((String) row[0], (Long) row[1]);
        }

        return new CorpusSummary(
                extent.count(),
                byType,
                new DoubleRange(extent.minDepth(), extent.maxDepth()),
                new DoubleRange(extent.minLat(), extent.maxLat()),
                new DoubleRange(extent.minLon(), extent.maxLon()),
                new TimeRange(extent.earliest(), extent.latest()),
                hazardAdvisoryRepository.count());
    }
}
```

Create `src/main/java/com/bluegen/deepsyncapp/controller/StatsController.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.CorpusSummary;
import com.bluegen.deepsyncapp.service.StatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/summary")
    public CorpusSummary summary() {
        return statsService.summary();
    }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `./mvnw test -Dtest=StatsControllerTest`
Expected: PASS, 1 test.

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/bluegen/deepsyncapp src/test/java/com/bluegen/deepsyncapp
git commit -m "feat: add GET /api/stats/summary"
```

---

### Task 7: GET /api/stats/variables

**Files:**
- Create: `src/main/java/com/bluegen/deepsyncapp/model/VariableSummary.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/VariableStatsRow.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/model/VariableStatistics.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepository.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/service/StatsService.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/controller/StatsController.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/controller/StatsControllerTest.java` (add tests)
- Test: `src/test/java/com/bluegen/deepsyncapp/repository/OceanGridPointRepositoryTest.java` (add a test)

**Interfaces:**
- Consumes: `OceanDataFilter` (Task 2), `StatsService` (Task 6).
- Produces: `StatsService.variables(OceanDataFilter) -> VariableStatistics`.

- [ ] **Step 1: Write the failing controller tests**

Append to `StatsControllerTest`, adding imports for `OceanDataFilter`,
`VariableStatistics`, `VariableSummary` and `static org.mockito.ArgumentMatchers.any`:

```java
    @Test
    void reportsVariableStatisticsForAFilter() throws Exception {
        when(statsService.variables(any())).thenReturn(new VariableStatistics(
                new VariableSummary(15.0, 28.0, 21.14, 384L),
                new VariableSummary(34.0, 35.4, 34.87, 384L),
                new VariableSummary(0.1, 1.2, 0.45, 384L),
                new OceanDataFilter(null, null, null, null, null, null)));

        mockMvc.perform(get("/api/stats/variables"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.temperatureC.mean").value(21.14))
                .andExpect(jsonPath("$.salinityPsu.max").value(35.4))
                .andExpect(jsonPath("$.chlorophyll.count").value(384));
    }

    @Test
    void rejectsAnInvertedBoundingBoxWith400() throws Exception {
        mockMvc.perform(get("/api/stats/variables")
                        .param("minLon", "95").param("maxLon", "60"))
                .andExpect(status().isBadRequest());
    }
```

- [ ] **Step 2: Write the failing repository test**

Append to `OceanGridPointRepositoryTest`, adding the import
`com.bluegen.deepsyncapp.model.VariableStatsRow`:

```java
    @Test
    void aggregatesVariablesOverTheFilteredSubset() {
        VariableStatsRow row = repository.findVariableStats(null, null, null, null, null, T1);

        assertThat(row.temperatureCount()).isEqualTo(3L);
        assertThat(row.temperatureMean()).isEqualTo(25.0);
        assertThat(row.salinityMin()).isEqualTo(35.0);
    }
```

- [ ] **Step 3: Run both tests to verify they fail**

Run: `./mvnw test -Dtest=StatsControllerTest+OceanGridPointRepositoryTest`
Expected: FAIL — `VariableStatsRow`, `VariableSummary`, `VariableStatistics` and
`findVariableStats` do not exist.

- [ ] **Step 4: Create the statistics records**

Create `src/main/java/com/bluegen/deepsyncapp/model/VariableSummary.java`:

```java
package com.bluegen.deepsyncapp.model;

public record VariableSummary(Double min, Double max, Double mean, Long count) {
}
```

Create `src/main/java/com/bluegen/deepsyncapp/model/VariableStatsRow.java`:

```java
package com.bluegen.deepsyncapp.model;

/** Flat projection target for the twelve aggregate columns; assembled into VariableStatistics. */
public record VariableStatsRow(Double temperatureMin, Double temperatureMax,
                               Double temperatureMean, Long temperatureCount,
                               Double salinityMin, Double salinityMax,
                               Double salinityMean, Long salinityCount,
                               Double chlorophyllMin, Double chlorophyllMax,
                               Double chlorophyllMean, Long chlorophyllCount) {
}
```

Create `src/main/java/com/bluegen/deepsyncapp/model/VariableStatistics.java`:

```java
package com.bluegen.deepsyncapp.model;

/**
 * Aggregates over the filtered grid subset. The AI Assistant traces every number it
 * reports back to this endpoint - the LLM must never be the source of a value.
 */
public record VariableStatistics(VariableSummary temperatureC,
                                 VariableSummary salinityPsu,
                                 VariableSummary chlorophyll,
                                 OceanDataFilter filter) {
}
```

- [ ] **Step 5: Add the aggregate query**

Add to `OceanGridPointRepository`, importing `com.bluegen.deepsyncapp.model.VariableStatsRow`.
The `where` clause is identical to `findFiltered` — keep the two in sync:

```java
    @Query("""
            select new com.bluegen.deepsyncapp.model.VariableStatsRow(
                min(p.temperatureC), max(p.temperatureC), avg(p.temperatureC), count(p.temperatureC),
                min(p.salinityPsu), max(p.salinityPsu), avg(p.salinityPsu), count(p.salinityPsu),
                min(p.chlorophyll), max(p.chlorophyll), avg(p.chlorophyll), count(p.chlorophyll))
            from OceanGridPointEntity p
            where (:minLat is null or p.latitude >= :minLat)
              and (:maxLat is null or p.latitude <= :maxLat)
              and (:minLon is null or p.longitude >= :minLon)
              and (:maxLon is null or p.longitude <= :maxLon)
              and (:depthMeters is null or p.depthMeters = :depthMeters)
              and (:timestamp is null or p.timestamp = :timestamp)
            """)
    VariableStatsRow findVariableStats(@Param("minLat") Double minLat,
                                       @Param("maxLat") Double maxLat,
                                       @Param("minLon") Double minLon,
                                       @Param("maxLon") Double maxLon,
                                       @Param("depthMeters") Double depthMeters,
                                       @Param("timestamp") Instant timestamp);
```

- [ ] **Step 6: Extend the service and controller**

Add to `StatsService`, importing `OceanDataFilter`, `VariableStatistics`,
`VariableStatsRow` and `VariableSummary`:

```java
    public VariableStatistics variables(OceanDataFilter filter) {
        VariableStatsRow row = gridRepository.findVariableStats(
                filter.minLat(), filter.maxLat(),
                filter.minLon(), filter.maxLon(),
                filter.depthMeters(), filter.timestamp());

        return new VariableStatistics(
                new VariableSummary(row.temperatureMin(), row.temperatureMax(),
                        row.temperatureMean(), row.temperatureCount()),
                new VariableSummary(row.salinityMin(), row.salinityMax(),
                        row.salinityMean(), row.salinityCount()),
                new VariableSummary(row.chlorophyllMin(), row.chlorophyllMax(),
                        row.chlorophyllMean(), row.chlorophyllCount()),
                filter);
    }
```

Add to `StatsController`, importing `OceanDataFilter`, `VariableStatistics`,
`jakarta.validation.Valid` and `org.springframework.web.bind.annotation.ModelAttribute`:

```java
    @GetMapping("/variables")
    public VariableStatistics variables(@Valid @ModelAttribute OceanDataFilter filter) {
        return statsService.variables(filter);
    }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `./mvnw test -Dtest=StatsControllerTest+OceanGridPointRepositoryTest`
Expected: PASS, 3 stats tests and 5 repository tests.

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/bluegen/deepsyncapp src/test/java/com/bluegen/deepsyncapp
git commit -m "feat: add GET /api/stats/variables"
```

---

### Task 8: GET /api/hazards and full-suite verification

**Files:**
- Create: `src/main/java/com/bluegen/deepsyncapp/model/HazardAdvisory.java`
- Modify: `src/main/java/com/bluegen/deepsyncapp/repository/HazardAdvisoryRepository.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/service/HazardAdvisoryService.java`
- Create: `src/main/java/com/bluegen/deepsyncapp/controller/HazardAdvisoryController.java`
- Test: `src/test/java/com/bluegen/deepsyncapp/controller/HazardAdvisoryControllerTest.java`

**Interfaces:**
- Consumes: `HazardAdvisoryEntity.HazardType`, `HazardAdvisoryEntity.Severity` (nested enums
  on the entity — reuse them, do not redeclare).
- Produces: `HazardAdvisoryService.findAdvisories(HazardType, Severity) -> List<HazardAdvisory>`.

**Note:** read-only. Hazard CRUD belongs to Phase 9's `HazardAdvisoryManager`.

- [ ] **Step 1: Write the failing test**

Create `src/test/java/com/bluegen/deepsyncapp/controller/HazardAdvisoryControllerTest.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import com.bluegen.deepsyncapp.model.HazardAdvisory;
import com.bluegen.deepsyncapp.service.HazardAdvisoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HazardAdvisoryController.class)
class HazardAdvisoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HazardAdvisoryService hazardAdvisoryService;

    @Test
    void listsAdvisories() throws Exception {
        when(hazardAdvisoryService.findAdvisories(null, null)).thenReturn(List.of(
                new HazardAdvisory(1L, HazardType.TSUNAMI, "Bay of Bengal",
                        "Tsunami watch in effect", Severity.SEVERE,
                        Instant.parse("2026-09-01T00:00:00Z"))));

        mockMvc.perform(get("/api/hazards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("TSUNAMI"))
                .andExpect(jsonPath("$[0].severity").value("SEVERE"))
                .andExpect(jsonPath("$[0].region").value("Bay of Bengal"));
    }

    @Test
    void filtersByTypeAndSeverity() throws Exception {
        when(hazardAdvisoryService.findAdvisories(HazardType.PFZ, Severity.LOW))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/hazards").param("type", "PFZ").param("severity", "LOW"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void rejectsAnUnknownHazardTypeWith400() throws Exception {
        mockMvc.perform(get("/api/hazards").param("type", "VOLCANO"))
                .andExpect(status().isBadRequest());
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./mvnw test -Dtest=HazardAdvisoryControllerTest`
Expected: FAIL — `HazardAdvisoryController`, `HazardAdvisoryService` and `HazardAdvisory`
do not exist.

- [ ] **Step 3: Create the DTO**

Create `src/main/java/com/bluegen/deepsyncapp/model/HazardAdvisory.java`:

```java
package com.bluegen.deepsyncapp.model;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;

import java.time.Instant;

public record HazardAdvisory(Long id,
                             HazardType type,
                             String region,
                             String message,
                             Severity severity,
                             Instant issuedAt) {

    public static HazardAdvisory from(HazardAdvisoryEntity entity) {
        return new HazardAdvisory(
                entity.getId(),
                entity.getType(),
                entity.getRegion(),
                entity.getMessage(),
                entity.getSeverity(),
                entity.getIssuedAt());
    }
}
```

- [ ] **Step 4: Add the filter query**

Replace `src/main/java/com/bluegen/deepsyncapp/repository/HazardAdvisoryRepository.java` with:

```java
package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HazardAdvisoryRepository extends JpaRepository<HazardAdvisoryEntity, Long> {

    @Query("""
            select h from HazardAdvisoryEntity h
            where (:type is null or h.type = :type)
              and (:severity is null or h.severity = :severity)
            order by h.issuedAt desc
            """)
    List<HazardAdvisoryEntity> findFiltered(@Param("type") HazardType type,
                                            @Param("severity") Severity severity);
}
```

- [ ] **Step 5: Create the service and controller**

Create `src/main/java/com/bluegen/deepsyncapp/service/HazardAdvisoryService.java`:

```java
package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import com.bluegen.deepsyncapp.model.HazardAdvisory;
import com.bluegen.deepsyncapp.repository.HazardAdvisoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HazardAdvisoryService {

    private final HazardAdvisoryRepository repository;

    public HazardAdvisoryService(HazardAdvisoryRepository repository) {
        this.repository = repository;
    }

    public List<HazardAdvisory> findAdvisories(HazardType type, Severity severity) {
        return repository.findFiltered(type, severity).stream()
                .map(HazardAdvisory::from)
                .toList();
    }
}
```

Create `src/main/java/com/bluegen/deepsyncapp/controller/HazardAdvisoryController.java`:

```java
package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import com.bluegen.deepsyncapp.model.HazardAdvisory;
import com.bluegen.deepsyncapp.service.HazardAdvisoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hazards")
public class HazardAdvisoryController {

    private final HazardAdvisoryService hazardAdvisoryService;

    public HazardAdvisoryController(HazardAdvisoryService hazardAdvisoryService) {
        this.hazardAdvisoryService = hazardAdvisoryService;
    }

    @GetMapping
    public List<HazardAdvisory> advisories(@RequestParam(required = false) HazardType type,
                                           @RequestParam(required = false) Severity severity) {
        return hazardAdvisoryService.findAdvisories(type, severity);
    }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `./mvnw test -Dtest=HazardAdvisoryControllerTest`
Expected: PASS, 3 tests.

- [ ] **Step 7: Run the whole suite**

Run: `./mvnw test`
Expected: all tests green. Docker must be running for the Testcontainers tests.

- [ ] **Step 8: Verify against the real seeded database**

```bash
docker compose up -d postgres
./mvnw spring-boot:run
```

In a second shell, confirm each endpoint returns real data:

```bash
curl -s "http://localhost:8080/api/ocean-data?depthMeters=0" | head -c 300
curl -s "http://localhost:8080/api/ocean-data/axes"
curl -s "http://localhost:8080/api/floats"
curl -s "http://localhost:8080/api/floats/2900226"
curl -s "http://localhost:8080/api/floats/2900226/profiles"
curl -s "http://localhost:8080/api/floats/2900226/track"
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8080/api/floats/9999999"
curl -s "http://localhost:8080/api/stats/summary"
curl -s "http://localhost:8080/api/stats/variables?minLat=0&maxLat=20"
curl -s "http://localhost:8080/api/hazards"
```

Expected against the Phase 1 seed: `/api/stats/summary` reports `gridPointCount` 384 and
5 floats across two instrument types; `/api/floats/2900226/profiles` returns 30 samples;
`/api/floats/2900226/track` returns 6 positions; `/api/hazards` returns 3 advisories; the
unknown platform id returns 404.

- [ ] **Step 9: Commit**

```bash
git add src/main/java/com/bluegen/deepsyncapp src/test/java/com/bluegen/deepsyncapp
git commit -m "feat: add GET /api/hazards"
```
