---
name: cf-convention-check
description: Check NetCDF ingestion code and datasets against CF (Climate and Forecast) conventions for ocean variables. Use when writing or reviewing code in the netcdf/ package, wiring up new NetCDF variable parsing, or when the user asks whether ingestion handles CF conventions / units / fill values / dimension order correctly.
---

# CF Convention Check

DEEPSYNC-APP ingests INCOIS ocean model output and observation NetCDF files
(`src/main/java/com/bluegen/deepsyncapp/netcdf/`, built on Unidata `cdm-core`).
Deliverable #7 of the problem statement requires CF-convention compliance —
this skill is the checklist to apply whenever that ingestion code is written
or reviewed.

## What to check

1. **Standard names** — each physical variable should be matched by its CF
   `standard_name` attribute, not by guessing from the short variable name
   alone (files vary: `temp`/`thetao`/`TEMP` all show up in the wild).

   | Ocean variable | Expected `standard_name` | Typical units |
   |---|---|---|
   | Sea water temperature | `sea_water_temperature` / `sea_water_potential_temperature` | `degree_C` or `K` |
   | Salinity | `sea_water_salinity` / `sea_water_practical_salinity` | `1` / `PSU` (dimensionless) |
   | Currents (u/v) | `eastward_sea_water_velocity` / `northward_sea_water_velocity` | `m s-1` |
   | Chlorophyll | `mass_concentration_of_chlorophyll_a_in_sea_water` | `mg m-3` |
   | Depth | `depth` (positive: `down`) | `m` |
   | Latitude / Longitude | `latitude` / `longitude` | `degrees_north` / `degrees_east` |
   | Time | `time` | CF-style `<unit> since <reference-date>` |

2. **Units are read, not assumed** — always pull the `units` attribute off the
   variable and convert if it doesn't match the app's internal unit (e.g.
   Kelvin vs. Celsius for temperature) rather than hardcoding an assumption.

3. **`_FillValue` / `missing_value`** — check for these attributes and treat
   matching cells as missing/null, not as real zeros or extreme values, before
   the data reaches the DB or frontend.

4. **`positive` attribute on depth/height** — `down` vs `up` changes the sign
   convention; don't assume depth is always positive-down without checking.

5. **Dimension order** — CF-compliant ocean files are typically ordered
   `(time, depth, lat, lon)`; verify actual dimension order per-file via
   `Variable.getDimensions()` rather than assuming a fixed index order.

6. **Coordinate variables vs. data variables** — use netcdf-java's
   `NetcdfDataset` / `CoordinateSystem` (not raw `NetcdfFile`) so lat/lon/time/
   depth are resolved as proper coordinate axes instead of hand-parsed.

7. **Time decoding** — decode the `time` variable's `units` (e.g.
   `"days since 1990-01-01"`) via `CalendarDateUnit`, don't parse it manually.

## When invoked

- If reviewing existing code (e.g. `NetcdfReaderService`): go through the
  checklist above against the actual variable-reading logic and flag any
  step that's skipped or hardcoded instead of read from file metadata.
- If writing new ingestion code: read the target NetCDF file's variable
  attributes first (or ask the user for a sample `ncdump -h` if no sample
  file is available yet) before writing extraction logic, so the mapping is
  based on what's actually in the file rather than assumed variable names.
- Note explicitly which checklist items could not be verified (e.g. "no
  sample .nc file available yet, dimension order assumed from INCOIS docs").
