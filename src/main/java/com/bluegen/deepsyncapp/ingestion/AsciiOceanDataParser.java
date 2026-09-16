package com.bluegen.deepsyncapp.ingestion;

import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileReader;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses ASCII/CSV files (Argo floats, Gliders, CTD casts, etc.).
 * Supports both grid point data and in-situ float profile data.
 */
@Component
public class AsciiOceanDataParser implements OceanDataParser {

  @Override
  public String getName() {
    return "ASCII/CSV Parser";
  }

  @Override
  public List<String> getSupportedExtensions() {
    return List.of(".csv", ".txt", ".asc", ".ascii");
  }

  @Override
  public boolean canParse(File file) {
    try (FileReader reader = new FileReader(file);
         CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {
      return parser.getHeaderMap().size() > 0;
    } catch (Exception e) {
      return false;
    }
  }

  @Override
  public List<OceanGridPointEntity> parseOceanGridData(File file) throws Exception {
    List<OceanGridPointEntity> result = new ArrayList<>();
    try (FileReader reader = new FileReader(file);
         CSVParser csvParser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {

      for (CSVRecord record : csvParser) {
        try {
          Double lat = parseDouble(record, "latitude", "lat");
          Double lon = parseDouble(record, "longitude", "lon");
          if (lat == null || lon == null) continue;

          OceanGridPointEntity point = new OceanGridPointEntity();
          point.setLatitude(lat);
          point.setLongitude(lon);
          point.setDepthMeters(parseDouble(record, "depth_meters", "depth") != null ?
              parseDouble(record, "depth_meters", "depth") : 0.0);
          point.setTimestamp(parseTimestamp(record, "timestamp", "time"));
          point.setTemperatureC(parseDouble(record, "temperature_c", "temperature"));
          point.setSalinityPsu(parseDouble(record, "salinity_psu", "salinity"));
          point.setCurrentU(parseDouble(record, "current_u", "u"));
          point.setCurrentV(parseDouble(record, "current_v", "v"));
          point.setChlorophyll(parseDouble(record, "chlorophyll", "chl"));

          result.add(point);
        } catch (Exception e) {
          // Skip malformed rows
          continue;
        }
      }
    }
    return result;
  }

  @Override
  public ArgoFloatEntity parseFloatData(File file) throws Exception {
    try (FileReader reader = new FileReader(file);
         CSVParser csvParser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {

      ArgoFloatEntity floatEntity = null;
      List<ProfileSampleEntity> profiles = new ArrayList<>();
      List<FloatPositionEntity> positions = new ArrayList<>();

      for (CSVRecord record : csvParser) {
        try {
          String platformId = getField(record, "platformId", "platform_id", "id", "glider_id", "wmo");
          String instrumentType = getField(record, "instrumentType", "instrument_type", "type");

          if (platformId == null) continue;

          if (floatEntity == null) {
            floatEntity = new ArgoFloatEntity();
            floatEntity.setPlatformId(platformId);
            floatEntity.setInstrumentType(instrumentType != null ? instrumentType : "UNKNOWN");
          }

          Double lat = parseDouble(record, "latitude", "lat");
          Double lon = parseDouble(record, "longitude", "lon");
          if (lat != null && lon != null) {
            floatEntity.setLatitude(lat);
            floatEntity.setLongitude(lon);
          }

          // Check if profile sample or position fix
          Double depth = parseDouble(record, "depth_meters", "depth");
          if (depth != null && depth > 0) {
            // It's a profile sample
            ProfileSampleEntity profile = new ProfileSampleEntity();
            profile.setDepthMeters(depth);
            profile.setTemperatureC(parseDouble(record, "temperature_c", "temperature"));
            profile.setSalinityPsu(parseDouble(record, "salinity_psu", "salinity"));
            profile.setTimestamp(parseTimestamp(record, "timestamp", "time"));
            profile.setArgoFloat(floatEntity);
            profiles.add(profile);
          } else {
            // It's a position fix
            FloatPositionEntity pos = new FloatPositionEntity();
            pos.setLatitude(lat);
            pos.setLongitude(lon);
            pos.setTimestamp(parseTimestamp(record, "timestamp", "time"));
            pos.setArgoFloat(floatEntity);
            positions.add(pos);
          }
        } catch (Exception e) {
          // Skip malformed rows
          continue;
        }
      }

      if (floatEntity != null) {
        floatEntity.setProfileSamples(profiles);
        floatEntity.setPositions(positions);
      }

      return floatEntity;
    }
  }

  private Double parseDouble(CSVRecord record, String... columnNames) {
    for (String col : columnNames) {
      try {
        if (record.isMapped(col)) {
          String val = record.get(col);
          if (val != null && !val.isBlank()) {
            return Double.parseDouble(val);
          }
        }
      } catch (NumberFormatException ignored) {
        // Try next column
      }
    }
    return null;
  }

  private String getField(CSVRecord record, String... columnNames) {
    for (String col : columnNames) {
      try {
        if (record.isMapped(col)) {
          String val = record.get(col);
          if (val != null && !val.isBlank()) {
            return val;
          }
        }
      } catch (Exception ignored) {
        // Try next column
      }
    }
    return null;
  }

  private Instant parseTimestamp(CSVRecord record, String... columnNames) {
    for (String col : columnNames) {
      try {
        if (record.isMapped(col)) {
          String val = record.get(col);
          if (val != null && !val.isBlank()) {
            try {
              return Instant.parse(val); // ISO8601
            } catch (Exception e1) {
              try {
                return Instant.ofEpochMilli(Long.parseLong(val)); // Unix timestamp
              } catch (Exception e2) {
                return Instant.now();
              }
            }
          }
        }
      } catch (Exception ignored) {
        // Try next column
      }
    }
    return Instant.now();
  }
}
