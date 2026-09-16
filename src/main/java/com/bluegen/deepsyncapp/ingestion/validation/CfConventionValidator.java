package com.bluegen.deepsyncapp.ingestion.validation;

import org.springframework.stereotype.Component;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import ucar.nc2.Dimension;
import ucar.nc2.Attribute;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Validates NetCDF files for CF Conventions compliance.
 * Checks for required attributes, standard names, valid coordinate systems, etc.
 */
@Component
public class CfConventionValidator {

  public ValidationResult validate(File ncFile) {
    ValidationResult result = new ValidationResult();
    try (NetcdfFile dataset = NetcdfFile.open(ncFile.getAbsolutePath())) {
      if (dataset == null) {
        result.addError("File is not a valid NetCDF file");
        return result;
      }

      // Check global attributes
      checkGlobalAttributes(dataset, result);

      // Check for required coordinate variables
      checkCoordinateVariables(dataset, result);

      // Check dimensions
      checkDimensions(dataset, result);

      // Check variable attributes
      checkVariableAttributes(dataset, result);

    } catch (Exception e) {
      result.addError("Failed to open NetCDF file: " + e.getMessage());
    }

    result.isValid = result.errors.isEmpty();
    return result;
  }

  private void checkGlobalAttributes(NetcdfFile dataset, ValidationResult result) {
    Attribute conventions = dataset.findGlobalAttribute("Conventions");
    if (conventions == null) {
      result.addWarning("Missing 'Conventions' global attribute");
    } else {
      String value = conventions.getStringValue();
      if (!value.contains("CF")) {
        result.addWarning("'Conventions' attribute does not mention CF: " + value);
      }
    }
  }

  private void checkCoordinateVariables(NetcdfFile dataset, ValidationResult result) {
    boolean hasLat = findVariable(dataset, "latitude", "lat", "y") != null;
    boolean hasLon = findVariable(dataset, "longitude", "lon", "x") != null;

    if (!hasLat) result.addError("Missing latitude coordinate variable");
    if (!hasLon) result.addError("Missing longitude coordinate variable");
  }

  private void checkDimensions(NetcdfFile dataset, ValidationResult result) {
    // Informational only: lat/lon presence is already enforced as a hard error in
    // checkCoordinateVariables. Profile-indexed files (e.g. Argo N_PROF/N_LEVELS) don't
    // name dimensions after lat/lon/depth at all, so treating this as an error rejected
    // valid files.
    List<Dimension> dims = dataset.getDimensions();
    boolean hasSpatialDims = false;
    for (Dimension dim : dims) {
      String name = dim.getShortName().toLowerCase();
      if (name.matches("(lat|latitude|lon|longitude|x|y|depth|z|pres|pressure)")) {
        hasSpatialDims = true;
        break;
      }
    }
    if (!hasSpatialDims) {
      result.addWarning("No conventionally named spatial dimension found (lat/lon/depth)");
    }
  }

  private void checkVariableAttributes(NetcdfFile dataset, ValidationResult result) {
    for (Variable var : dataset.getVariables()) {
      Attribute stdName = var.findAttribute("standard_name");
      Attribute units = var.findAttribute("units");

      if (stdName == null) {
        result.addWarning("Variable '" + var.getShortName() + "' missing 'standard_name' attribute");
      }
      if (units == null) {
        result.addWarning("Variable '" + var.getShortName() + "' missing 'units' attribute");
      }
    }
  }

  private Variable findVariable(NetcdfFile dataset, String... names) {
    for (String name : names) {
      Variable v = dataset.findVariable(name);
      if (v != null) return v;
    }
    // Fall back to case-insensitive match (Argo/INCOIS files commonly use
    // upper-case names like LATITUDE/LONGITUDE).
    for (Variable v : dataset.getVariables()) {
      for (String name : names) {
        if (v.getShortName().equalsIgnoreCase(name)) return v;
      }
    }
    return null;
  }

  public static class ValidationResult {
    public boolean isValid;
    public List<String> errors = new ArrayList<>();
    public List<String> warnings = new ArrayList<>();

    public void addError(String msg) {
      errors.add(msg);
    }

    public void addWarning(String msg) {
      warnings.add(msg);
    }

    public String summary() {
      if (isValid) {
        return "Valid CF Convention file" + (warnings.isEmpty() ? "" : " (with " + warnings.size() + " warnings)");
      } else {
        return "Invalid: " + String.join("; ", errors);
      }
    }
  }
}
