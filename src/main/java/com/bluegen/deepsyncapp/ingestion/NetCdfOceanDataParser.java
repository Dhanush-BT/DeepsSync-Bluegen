package com.bluegen.deepsyncapp.ingestion;

import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import org.springframework.stereotype.Component;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import ucar.nc2.Dimension;
import ucar.ma2.Array;

import java.io.File;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses NetCDF (.nc) files following CF Conventions.
 * Handles two shapes of data:
 *  - Gridded model output: independent lat[]/lon[]/depth[] axes forming a cartesian grid
 *    (e.g. HYCOM). Data variables are indexed [time][depth][lat][lon].
 *  - Profile files (Argo/Glider/CTD): lat/lon are paired per-profile (N_PROF), and data
 *    variables like TEMP/PSAL/PRES are 2D (N_PROF x N_LEVELS). Treating these as an
 *    independent-axis grid corrupts the data and can throw ucar.ma2 index exceptions,
 *    so profile shape is detected and walked separately.
 */
@Component
public class NetCdfOceanDataParser implements OceanDataParser {

  @Override
  public String getName() {
    return "NetCDF Parser";
  }

  @Override
  public List<String> getSupportedExtensions() {
    return List.of(".nc", ".ncml");
  }

  @Override
  public boolean canParse(File file) {
    try (NetcdfFile ncFile = NetcdfFile.open(file.getAbsolutePath())) {
      return ncFile != null && hasRequiredDimensions(ncFile);
    } catch (Exception e) {
      return false;
    }
  }

  @Override
  public List<OceanGridPointEntity> parseOceanGridData(File file) throws Exception {
    List<OceanGridPointEntity> result = new ArrayList<>();
    try (NetcdfFile ncFile = NetcdfFile.open(file.getAbsolutePath())) {
      if (ncFile == null) {
        throw new IllegalArgumentException("Invalid NetCDF file: " + file.getName());
      }

      double[] latitudes = extractDoubleArray(ncFile, "latitude", "lat", "y");
      double[] longitudes = extractDoubleArray(ncFile, "longitude", "lon", "x");
      if (latitudes == null || longitudes == null) {
        return result;
      }

      Variable tempVar = findVariableCaseInsensitive(ncFile, "temperature", "temp");
      Variable salVar = findVariableCaseInsensitive(ncFile, "salinity", "sal", "psal");
      Variable uVar = findVariableCaseInsensitive(ncFile, "current_u", "eastward_sea_water_velocity");
      Variable vVar = findVariableCaseInsensitive(ncFile, "current_v", "northward_sea_water_velocity");
      Variable chlVar = findVariableCaseInsensitive(ncFile, "chlorophyll", "chl", "chlor_a");

      // Profile mode: lat/lon paired 1:1 with a "profile" axis (N_PROF), and a data
      // variable is 2D (N_PROF x N_LEVELS) - the shape used by Argo/Glider/CTD files.
      Variable primaryData = firstNonNull(tempVar, salVar, uVar, vVar, chlVar);
      boolean profileMode = latitudes.length == longitudes.length
          && primaryData != null
          && primaryData.getRank() == 2
          && primaryData.getShape()[0] == latitudes.length;

      Instant timestamp = extractFirstTimestamp(ncFile);

      if (profileMode) {
        int nProf = primaryData.getShape()[0];
        int nLevels = primaryData.getShape()[1];
        double[] depths = extractDoubleArray(ncFile, "depth", "z", "altitude", "pres", "pressure");
        boolean depthPerLevel = depths != null && depths.length == nLevels;

        double[] tempFlat = flatten(tempVar);
        double[] salFlat = flatten(salVar);
        double[] uFlat = flatten(uVar);
        double[] vFlat = flatten(vVar);
        double[] chlFlat = flatten(chlVar);
        double[] depthFlat = depthPerLevel ? null : flatten(findVariableCaseInsensitive(ncFile, "depth", "z", "altitude", "pres", "pressure"));

        for (int p = 0; p < nProf; p++) {
          for (int l = 0; l < nLevels; l++) {
            int flatIdx = p * nLevels + l;
            Double dVal = depthPerLevel ? (depths[l] >= 9990.0 || depths[l] < 0 ? null : depths[l]) : safeGet(depthFlat, flatIdx, null);
            if (dVal == null || dVal > 11000.0) continue;

            Double temp = safeGet(tempFlat, flatIdx, null);
            Double sal = safeGet(salFlat, flatIdx, null);
            Double u = safeGet(uFlat, flatIdx, null);
            Double v = safeGet(vFlat, flatIdx, null);
            Double chl = safeGet(chlFlat, flatIdx, null);

            if (temp == null && sal == null && u == null && v == null && chl == null) continue;

            OceanGridPointEntity point = new OceanGridPointEntity();
            point.setLatitude(latitudes[p]);
            point.setLongitude(longitudes[p]);
            point.setDepthMeters(dVal);
            point.setTimestamp(timestamp);
            point.setTemperatureC(temp);
            point.setSalinityPsu(sal);
            point.setCurrentU(u);
            point.setCurrentV(v);
            point.setChlorophyll(chl);
            result.add(point);
          }
        }
        return result;
      }

      // Grid mode: independent lat/lon/depth axes (regular model output).
      double[] depths = extractDoubleArray(ncFile, "depth", "z", "altitude");
      int depthCount = depths != null ? depths.length : 1;

      double[] tempFlat = flatten(tempVar);
      double[] salFlat = flatten(salVar);
      double[] uFlat = flatten(uVar);
      double[] vFlat = flatten(vVar);
      double[] chlFlat = flatten(chlVar);

      for (int i = 0; i < latitudes.length; i++) {
        for (int j = 0; j < longitudes.length; j++) {
          for (int d = 0; d < depthCount; d++) {
            int flatIdx = (i * longitudes.length + j) * depthCount + d;
            Double dVal = depths != null && d < depths.length ? depths[d] : 0.0;
            if (dVal == null || dVal >= 9990.0 || dVal < 0 || dVal > 11000.0) continue;

            Double temp = safeGet(tempFlat, flatIdx, null);
            Double sal = safeGet(salFlat, flatIdx, null);
            Double u = safeGet(uFlat, flatIdx, null);
            Double v = safeGet(vFlat, flatIdx, null);
            Double chl = safeGet(chlFlat, flatIdx, null);

            if (temp == null && sal == null && u == null && v == null && chl == null) continue;

            OceanGridPointEntity point = new OceanGridPointEntity();
            point.setLatitude(latitudes[i]);
            point.setLongitude(longitudes[j]);
            point.setDepthMeters(dVal);
            point.setTimestamp(timestamp);
            point.setTemperatureC(temp);
            point.setSalinityPsu(sal);
            point.setCurrentU(u);
            point.setCurrentV(v);
            point.setChlorophyll(chl);
            result.add(point);
          }
        }
      }
    }
    return result;
  }

  @Override
  public ArgoFloatEntity parseFloatData(File file) throws Exception {
    try (NetcdfFile ncFile = NetcdfFile.open(file.getAbsolutePath())) {
      if (ncFile == null) return null;

      double[] latitudes = extractDoubleArray(ncFile, "latitude", "lat", "y");
      double[] longitudes = extractDoubleArray(ncFile, "longitude", "lon", "x");
      if (latitudes == null || longitudes == null || latitudes.length == 0) {
        return null;
      }

      Variable tempVar = findVariableCaseInsensitive(ncFile, "temperature", "temp");
      Variable salVar = findVariableCaseInsensitive(ncFile, "salinity", "sal", "psal");
      Variable primaryData = firstNonNull(tempVar, salVar,
          findVariableCaseInsensitive(ncFile, "pres", "pressure", "depth"));

      // Only single/multi-profile files (N_PROF x N_LEVELS) map to an Argo float; grid
      // files have no natural "platform" and are covered by parseOceanGridData instead.
      if (primaryData == null || primaryData.getRank() != 2 || primaryData.getShape()[0] != latitudes.length) {
        return null;
      }

      int nProf = primaryData.getShape()[0];
      int nLevels = primaryData.getShape()[1];
      double[] depths = extractDoubleArray(ncFile, "depth", "z", "altitude", "pres", "pressure");
      boolean depthPerLevel = depths != null && depths.length == nLevels;
      double[] depthFlat = depthPerLevel ? null
          : flatten(findVariableCaseInsensitive(ncFile, "depth", "z", "altitude", "pres", "pressure"));
      double[] tempFlat = flatten(tempVar);
      double[] salFlat = flatten(salVar);
      Instant timestamp = extractFirstTimestamp(ncFile);

      ArgoFloatEntity floatEntity = new ArgoFloatEntity();
      floatEntity.setPlatformId(extractPlatformId(file.getName(), ncFile));
      floatEntity.setInstrumentType("ARGO_FLOAT");
      floatEntity.setDataSource("NetCDF Upload");
      floatEntity.setDatasetPath(file.getName());
      floatEntity.setLatitude(latitudes[0]);
      floatEntity.setLongitude(longitudes[0]);

      List<ProfileSampleEntity> profiles = new ArrayList<>();
      List<FloatPositionEntity> positions = new ArrayList<>();

      for (int p = 0; p < nProf; p++) {
        FloatPositionEntity pos = new FloatPositionEntity();
        pos.setArgoFloat(floatEntity);
        pos.setLatitude(latitudes[p]);
        pos.setLongitude(longitudes[p]);
        pos.setTimestamp(timestamp);
        positions.add(pos);

        for (int l = 0; l < nLevels; l++) {
          int flatIdx = p * nLevels + l;
          Double depthVal = depthPerLevel ? (depths[l] >= 9990.0 || depths[l] < 0 ? null : depths[l]) : safeGet(depthFlat, flatIdx, null);
          if (depthVal == null || depthVal > 11000.0) continue;

          Double tempVal = safeGet(tempFlat, flatIdx, null);
          Double salVal = safeGet(salFlat, flatIdx, null);
          // Only add sample if at least one valid measurement is present
          if (tempVal == null && salVal == null) continue;

          ProfileSampleEntity sample = new ProfileSampleEntity();
          sample.setArgoFloat(floatEntity);
          sample.setTimestamp(timestamp);
          sample.setDepthMeters(depthVal);
          sample.setTemperatureC(tempVal);
          sample.setSalinityPsu(salVal);
          profiles.add(sample);
        }
      }

      floatEntity.setProfileSamples(profiles);
      floatEntity.setPositions(positions);
      return floatEntity;
    }
  }

  private String extractPlatformId(String fileName, NetcdfFile ncFile) {
    Variable platformVar = findVariableCaseInsensitive(ncFile, "platform_number", "platform_id", "wmo");
    if (platformVar != null) {
      try {
        Array arr = platformVar.read();
        String val = arr.toString().trim();
        if (!val.isEmpty()) {
          // In some Argo NetCDF files char array reads as "2902294 ,2902294" or "2902294 "
          String cleanId = val.split("[,\\s]+")[0].replaceAll("[^a-zA-Z0-9_-]", "").trim();
          if (!cleanId.isEmpty()) return cleanId;
          return val;
        }
      } catch (Exception ignored) {
        // Fall through to filename-derived id
      }
    }
    String base = fileName.replaceAll("\\..*", "");
    return base.isEmpty() ? fileName : base;
  }

  private Instant extractFirstTimestamp(NetcdfFile ncFile) throws Exception {
    long[] times = extractTimeArray(ncFile, "time", "juld", "t");
    if (times == null || times.length == 0) return Instant.now();
    // JULD is CF days-since-1950-01-01 for Argo; treat large values as already millis/seconds,
    // and small values (< ~100000) as days since epoch to give a sane, non-crashing fallback.
    long raw = times[0];
    if (Math.abs(raw) < 100_000) {
      return Instant.ofEpochSecond(raw * 86400L);
    }
    return Instant.ofEpochMilli(raw);
  }

  private Variable firstNonNull(Variable... vars) {
    for (Variable v : vars) {
      if (v != null) return v;
    }
    return null;
  }

  private Double safeGet(double[] data, int idx, Double defaultValue) {
    if (data == null || idx < 0 || idx >= data.length) return defaultValue;
    double val = data[idx];
    if (Double.isNaN(val) || Double.isInfinite(val) || Math.abs(val) >= 9990.0 || val <= -990.0) {
      return defaultValue;
    }
    return val;
  }

  private boolean hasRequiredDimensions(NetcdfFile ncFile) {
    // Dimension names alone don't reliably signal lat/lon presence (e.g. Argo profile
    // files index by N_PROF/N_LEVELS instead), so fall back to checking for lat/lon
    // variables directly, case-insensitively.
    List<Dimension> dims = ncFile.getDimensions();
    boolean hasLatLon = dims.stream()
        .anyMatch(d -> d.getShortName().toLowerCase().matches("(lat|latitude|y)"))
        && dims.stream()
        .anyMatch(d -> d.getShortName().toLowerCase().matches("(lon|longitude|x)"));
    if (hasLatLon) return true;

    return findVariableCaseInsensitive(ncFile, "latitude", "lat", "y") != null
        && findVariableCaseInsensitive(ncFile, "longitude", "lon", "x") != null;
  }

  private Variable findVariableCaseInsensitive(NetcdfFile ncFile, String... names) {
    for (String name : names) {
      Variable v = ncFile.findVariable(name);
      if (v != null) return v;
    }
    for (Variable v : ncFile.getVariables()) {
      for (String name : names) {
        if (v.getShortName().equalsIgnoreCase(name)) return v;
      }
    }
    return null;
  }

  /**
   * Reads a variable fully flattened in row-major order via ucar's own helper, avoiding
   * manual IndexIterator/multi-dim reconstruction (source of ucar.ma2 Index exceptions
   * on irregular ranks like Argo's N_PROF x N_LEVELS).
   */
  private double[] flatten(Variable var) throws Exception {
    if (var == null) return null;
    Array array = var.read();
    return (double[]) array.get1DJavaArray(double.class);
  }

  private double[] extractDoubleArray(NetcdfFile ncFile, String... varNames) throws Exception {
    Variable var = findVariableCaseInsensitive(ncFile, varNames);
    if (var != null && var.getRank() >= 1) {
      return flatten(var);
    }
    return null;
  }

  private long[] extractTimeArray(NetcdfFile ncFile, String... varNames) throws Exception {
    Variable var = findVariableCaseInsensitive(ncFile, varNames);
    if (var == null || var.getRank() < 1) return null;
    Array array = var.read();
    double[] asDouble = (double[]) array.get1DJavaArray(double.class);
    long[] result = new long[asDouble.length];
    for (int i = 0; i < asDouble.length; i++) {
      result[i] = (long) asDouble[i];
    }
    return result;
  }
}
