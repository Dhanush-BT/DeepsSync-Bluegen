package com.bluegen.deepsyncapp.ingestion;

import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import java.io.File;
import java.util.List;

/**
 * Plugin contract for ocean data parsers.
 * Implementations handle specific file formats (NetCDF, CSV, ASCII, etc.)
 * and convert them into domain entities.
 */
public interface OceanDataParser {
  /**
   * Human-readable name for this parser (e.g., "NetCDF Parser", "CSV Parser")
   */
  String getName();

  /**
   * File extensions this parser handles (e.g., [".nc"], [".csv", ".txt"])
   */
  List<String> getSupportedExtensions();

  /**
   * Validate that the file is readable and in the expected format.
   */
  boolean canParse(File file);

  /**
   * Parse grid-based oceanographic data (temperature, salinity, etc. at fixed points).
   * Returns empty list if file contains no grid data.
   */
  List<OceanGridPointEntity> parseOceanGridData(File file) throws Exception;

  /**
   * Parse in-situ instrument float data (Argo, Glider, etc.).
   * Returns the float entity with its profile samples and position history populated.
   * Returns null if file contains no float data.
   */
  ArgoFloatEntity parseFloatData(File file) throws Exception;
}
