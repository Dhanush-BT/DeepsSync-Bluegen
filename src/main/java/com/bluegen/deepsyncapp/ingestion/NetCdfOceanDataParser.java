package com.bluegen.deepsyncapp.ingestion;

import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import org.springframework.stereotype.Component;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import ucar.nc2.Dimension;
import ucar.ma2.Array;
import ucar.ma2.IndexIterator;

import java.io.File;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Parses NetCDF (.nc) files following CF Conventions.
 * Extracts grid-based ocean data (temperature, salinity, currents, chlorophyll at fixed coordinates).
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
      if (ncFile == null) throw new IllegalArgumentException("Invalid NetCDF file: " + file.getName());

      // Extract coordinate variables (CF convention names)
      double[] latitudes = extractDoubleArray(ncFile, "lat", "latitude", "y");
      double[] longitudes = extractDoubleArray(ncFile, "lon", "longitude", "x");
      double[] depths = extractDoubleArray(ncFile, "depth", "z", "level");
      long[] times = extractTimeArray(ncFile);

      if (latitudes == null || longitudes == null) {
        return result;
      }

      // Extract data variables
      double[][][][] temperatureData = extractVariable4D(ncFile, "temperature_c", "temp", "t", "temperature");
      double[][][][] salinityData = extractVariable4D(ncFile, "salinity_psu", "sal", "salinity");
      double[][][][] currentUData = extractVariable4D(ncFile, "current_u", "eastward_sea_water_velocity");
      double[][][][] currentVData = extractVariable4D(ncFile, "current_v", "northward_sea_water_velocity");
      double[][][][] chlorophyllData = extractVariable4D(ncFile, "chlorophyll", "chl");

      // Build grid points from coordinate arrays
      int timeIdx = times != null && times.length > 0 ? 0 : -1;
      Instant timestamp = timeIdx >= 0 ? Instant.ofEpochMilli(times[0]) : Instant.now();

      for (int i = 0; i < latitudes.length; i++) {
        for (int j = 0; j < longitudes.length; j++) {
          int depthIdx = depths != null ? 0 : -1;
          double depth = depthIdx >= 0 ? depths[depthIdx] : 0.0;

          OceanGridPointEntity point = new OceanGridPointEntity();
          point.setLatitude(latitudes[i]);
          point.setLongitude(longitudes[j]);
          point.setDepthMeters(depth);
          point.setTimestamp(timestamp);

          if (temperatureData != null && timeIdx >= 0 && depthIdx >= 0) {
            point.setTemperatureC(safeExtract(temperatureData, timeIdx, depthIdx, i, j));
          }
          if (salinityData != null && timeIdx >= 0 && depthIdx >= 0) {
            point.setSalinityPsu(safeExtract(salinityData, timeIdx, depthIdx, i, j));
          }
          if (currentUData != null && timeIdx >= 0 && depthIdx >= 0) {
            point.setCurrentU(safeExtract(currentUData, timeIdx, depthIdx, i, j));
          }
          if (currentVData != null && timeIdx >= 0 && depthIdx >= 0) {
            point.setCurrentV(safeExtract(currentVData, timeIdx, depthIdx, i, j));
          }
          if (chlorophyllData != null && timeIdx >= 0 && depthIdx >= 0) {
            point.setChlorophyll(safeExtract(chlorophyllData, timeIdx, depthIdx, i, j));
          }

          result.add(point);
        }
      }
    }
    return result;
  }

  @Override
  public ArgoFloatEntity parseFloatData(File file) throws Exception {
    // Float data (Argo, Glider) typically comes from ASCII/CSV.
    // NetCDF can contain float profiles, but that's covered separately.
    return null;
  }

  private boolean hasRequiredDimensions(NetcdfFile ncFile) {
    List<Dimension> dims = ncFile.getDimensions();
    boolean hasLatLon = dims.stream()
      .anyMatch(d -> d.getShortName().matches("(lat|latitude|y)"))
      && dims.stream()
      .anyMatch(d -> d.getShortName().matches("(lon|longitude|x)"));
    return hasLatLon;
  }

  private double[] extractDoubleArray(NetcdfFile ncFile, String... varNames) throws Exception {
    for (String name : varNames) {
      Variable var = ncFile.findVariable(name);
      if (var != null) {
        Array array = var.read();
        double[] result = new double[(int) array.getSize()];
        IndexIterator it = array.getIndexIterator();
        int idx = 0;
        while (it.hasNext()) {
          result[idx++] = it.getDoubleNext();
        }
        return result;
      }
    }
    return null;
  }

  private long[] extractTimeArray(NetcdfFile ncFile) throws Exception {
    Variable timeVar = ncFile.findVariable("time");
    if (timeVar == null) return null;
    Array array = timeVar.read();
    long[] result = new long[(int) array.getSize()];
    IndexIterator it = array.getIndexIterator();
    int idx = 0;
    while (it.hasNext()) {
      result[idx++] = it.getLongNext();
    }
    return result;
  }

  private double[][][][] extractVariable4D(NetcdfFile ncFile, String... varNames) throws Exception {
    for (String name : varNames) {
      Variable var = ncFile.findVariable(name);
      if (var != null && var.getRank() >= 2) {
        Array array = var.read();
        int[] shape = array.getShape();
        double[][][][] result = new double[shape[0]][shape[1]][shape.length > 2 ? shape[2] : 1][shape.length > 3 ? shape[3] : 1];
        IndexIterator it = array.getIndexIterator();
        while (it.hasNext()) {
          int[] idx = it.getCurrentCounter();
          double val = it.getDoubleNext();
          if (idx.length >= 4) {
            result[idx[0]][idx[1]][idx[2]][idx[3]] = val;
          } else if (idx.length == 3) {
            result[idx[0]][idx[1]][idx[2]][0] = val;
          } else if (idx.length == 2) {
            result[idx[0]][idx[1]][0][0] = val;
          }
        }
        return result;
      }
    }
    return null;
  }

  private Double safeExtract(double[][][][] data, int t, int z, int y, int x) {
    try {
      if (data != null && t < data.length && z < data[t].length && y < data[t][z].length && x < data[t][z][y].length) {
        double val = data[t][z][y][x];
        return !Double.isNaN(val) && !Double.isInfinite(val) ? val : null;
      }
    } catch (Exception ignored) {
    }
    return null;
  }
}
