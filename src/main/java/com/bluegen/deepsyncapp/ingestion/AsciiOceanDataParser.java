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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses ASCII/CSV files (Argo floats, Gliders, CTD casts, etc.).
 * Supports both grid point data and in-situ float profile data.
 * Expects CSV with headers: latitude, longitude, depth, temperature_c, salinity_psu, etc.
 * For floats: platformId, instrumentType, latitude, longitude, timestamp, depth, temperature_c, salinity_psu
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
          OceanGridPointEntity point = new OceanGridPointEntity();

          Double lat = parseDouble(record, "latitude", "lat", "y");
          Double lon = parseDouble(record, "longitude", "lon", "x");
          Double depth = parseDouble(record, "depth_meters", "depthMeters", "depth", "z");

          if (lat == null || lon == null) continue;

          point.setLatitude(lat);
          point.setLongitude(lon);
          point.setDepthMeters(depth != null ? depth : 0.0);
          point.setTimestamp(parseTimestamp(record, "timestamp", "time"));

          point.setTemperatureC(parseDouble(record, "temperature_c", "temperature", "temp", "t"));
          point.setSalinityPsu(parseDouble(record, "salinity_psu", "salinity", "sal", "s"));
          point.setCurrentU(parseDouble(record, "current_u", "u", "eastward_velocity"));
          point.setCurrentV(parseDouble(record, "current_v", "v", "northward_velocity"));
          point.setChlorophyll(parseDouble(record, "chlorophyll", "chl", "fluorescence"));

          result.add(point);
        } catch (Exception e) {
          // Skip malformed rows, continue processing
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

      ArgoFloatEntity float_ = null;
      List<ProfileSampleEntity> profiles = new ArrayList<>();
      List<FloatPositionEntity> positions = new ArrayList<>();

      for (CSVRecord record : csvParser) {
        try {
          String platformId = getField(record, "platformId", "platform_id", "id");
          String instrumentType = getField(record, "instrumentType", "instrument_type", "type");

          if (platformId == null) continue;

          if (float_ == null) {
            float_ = new ArgoFloatEntity();
            float_.setPlatformId(platformId);
            float_.setInstrumentType(instrumentType != null ? instrumentType : "UNKNOWN");
          }

          Double lat = parseDouble(record, "latitude", "lat");
          Double lon = parseDouble(record, "longitude", "lon");
          if (lat != null && lon != null) {
            float_.setLatitude(lat);
            float_.setLongitude(lon);
          }

          // Check if this is a profile sample or position fix
          Double depth = parseDouble(record, "depth_meters", "depth");
          if (depth != null && depth > 0) {
            // It's a profile sample
            ProfileSampleEntity profile = new ProfileSampleEntity();
            profile.setDepthMeters(depth);
            profile.setTemperatureC(parseDouble(record, "temperature_c", "temperature"));
            profile.setSalinityPsu(parseDouble(record, "salinity_psu", "salinity"));
            profile.setTimestamp(parseTimestamp(record, "timestamp", "time"));
            profile.setArgoFloat(float_);
            profiles.add(profile);
          } else {
            // It's a position fix
            FloatPositionEntity pos = new FloatPositionEntity();
            pos.setLatitude(lat);
            pos.setLongitude(lon);
            pos.setTimestamp(parseTimestamp(record, "timestamp", "time"));
            pos.setArgoFloat(float_);
            positions.add(pos);
          }
        } catch (Exception e) {
          // Skip malformed rows
          continue;
        }
      }

      if (float_ != null) {
        float_.setProfileSamples(profiles);
        float_.setPositions(positions);
      }
      return float_;
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
      }
    }
    return null;
  }

  private String getField(CSVRecord record, String... columnNames) {
    for (String col : columnNames) {
      if (record.isMapped(col)) {
        String val = record.get(col);
        if (val != null && !val.isBlank()) {
          return val;
        }
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
                // Try other formats
                return Instant.now();
              }
            }
          }
        }
      } catch (Exception ignored) {
      }
    }
    return Instant.now();
  }
}
