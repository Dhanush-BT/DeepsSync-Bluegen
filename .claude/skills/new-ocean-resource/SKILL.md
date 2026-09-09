---
name: new-ocean-resource
description: Scaffold a new backend resource (entity, repository, service, DTO, controller) following DEEPSYNC-APP's existing vertical-slice package layout. Use when the user asks to add a new REST resource/endpoint to the Spring Boot backend, e.g. "add a Glider resource" or "scaffold a new CTD endpoint".
disable-model-invocation: true
---

# New Ocean Resource

Scaffolds the five files DEEPSYNC-APP always creates together for a new backend
resource, wired the same way every time so the codebase doesn't drift into
inconsistent patterns as more instrument/model-output types get added
(Argo floats, Gliders, CTD, BGC, moorings, HF-radar, ADCP, ...).

Base package: `com.bluegen.deepsyncapp`
Reference implementation to match the style of: `src/main/java/com/bluegen/deepsyncapp/controller/HealthController.java`

## When invoked

1. Ask (if not already given): the resource name (e.g. `Glider`), and its
   fields with types (e.g. `id: Long`, `callSign: String`, `latitude: Double`,
   `longitude: Double`, `depthMeters: Double`, `recordedAt: Instant`).
2. Create these five files, using `<Name>` for the PascalCase resource name
   and `<name>` for the camelCase variable name:

   - `model/<Name>Entity.java` — JPA entity (`@Entity`, `@Id`/`@GeneratedValue`,
     one field per requested column, getters/setters or Lombok `@Data` if
     Lombok is on the classpath — check `pom.xml` first, it is not currently
     a dependency, so default to plain getters/setters).
   - `repository/<Name>Repository.java` — `interface <Name>Repository extends
     JpaRepository<<Name>Entity, Long>` (adjust ID type to match the entity's
     `@Id` field).
   - `dto/<Name>Dto.java` — plain record or class mirroring the entity fields
     exposed over the API (leave out internal-only fields if the user says so).
   - `service/<Name>Service.java` — `@Service` class injecting the repository,
     with `findAll()`, `findById(id)`, `create(dto)` at minimum; map between
     entity and DTO manually (no MapStruct is configured).
   - `controller/<Name>Controller.java` — `@RestController` under
     `@RequestMapping("/api/<plural-kebab-name>")`, following the style of
     `HealthController` (constructor injection, `Map`/DTO return types,
     standard `@GetMapping`/`@PostMapping`).

3. After creating the files, run `./mvnw -q -DskipTests compile` to confirm
   the new resource compiles cleanly, and report the result.

## Conventions to preserve
- Package-per-layer (not package-per-feature) — matches the existing
  `controller/`, `service/`, `repository/`, `model/`, `dto/` layout.
- Constructor injection, no field `@Autowired`.
- REST paths are plural and kebab-case under `/api/...` (see `/api/health`
  as the precedent for the `/api` prefix).
- Don't add validation annotations, security, or pagination unless asked —
  keep scaffolds minimal and let the user layer on requirements.
