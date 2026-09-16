package com.bluegen.deepsyncapp.ingestion;

import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import ucar.nc2.Dimension;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;

/**
 * Universal NetCDF data loader for all dataset types (Argo, BGC, Glider, CTD, IGORA, etc.)
 * Uses CF Convention metadata to auto-detect data structure and extract profiles/trajectories.
 */
public class NetCdfDatasetLoader {
    private static final Logger log = LoggerFactory.getLogger(NetCdfDatasetLoader.class);

    private final Path datasetRootPath;
    private final String datasetName;

    public NetCdfDatasetLoader(Path datasetRootPath, String datasetName) {
        this.datasetRootPath = datasetRootPath;
        this.datasetName = datasetName;
    }

    /**
     * Load all NetCDF files from dataset directory
     */
    public List<ArgoFloatEntity> loadFloatProfiles() throws IOException {
        List<ArgoFloatEntity> floats = new ArrayList<>();

        try (var stream = Files.walk(datasetRootPath)) {
            stream.filter(p -> p.toString().endsWith(".nc"))
                .forEach(ncFile -> {
                    try {
                        ArgoFloatEntity float_ = loadNetCdfProfile(ncFile);
                        if (float_ != null) {
                            floats.add(float_);
                        }
                    } catch (IOException e) {
                        log.warn("Failed to load {}: {}", ncFile, e.getMessage());
                    }
                });
        }

        log.info("Loaded {} profiles from {}", floats.size(), datasetName);
        return floats;
    }

    /**
     * Load a single NetCDF profile file (Argo, BGC, CTD, Glider, etc.)
     * Auto-detects structure using CF Convention attributes
     */
    private ArgoFloatEntity loadNetCdfProfile(Path ncFile) throws IOException {
        try (NetcdfFile nc = NetcdfFile.open(ncFile.toString())) {
            // Detect file type from filename and metadata
            String fileName = ncFile.getFileName().toString();
            String platformId = extractPlatformId(fileName);
            String instrumentType = detectInstrumentType(fileName, nc);

            // Extract core dimensions (should be present in any CF file)
            Variable latVar = nc.findVariable("latitude") != null ? nc.findVariable("latitude") : nc.findVariable("lat");
            Variable lonVar = nc.findVariable("longitude") != null ? nc.findVariable("longitude") : nc.findVariable("lon");
            Variable depthVar = nc.findVariable("depth") != null ? nc.findVariable("depth") : nc.findVariable("pressure");
            Variable timeVar = nc.findVariable("time");

            if (latVar == null || lonVar == null || depthVar == null) {
                log.debug("Skipping {} - missing required dimensions", ncFile);
                return null;
            }

            // Create float entity
            ArgoFloatEntity floatEntity = new ArgoFloatEntity();
            floatEntity.setPlatformId(platformId);
            floatEntity.setInstrumentType(instrumentType);
            floatEntity.setDataSource(datasetName);
            floatEntity.setDatasetPath(ncFile.toString());

            // Extract coordinates
            double lat = getFirstValue(latVar, 0.0);
            double lon = getFirstValue(lonVar, 0.0);
            floatEntity.setLatitude(lat);
            floatEntity.setLongitude(lon);

            // Extract profile samples (vertical profiles at different depths)
            extractProfileSamples(floatEntity, nc, depthVar, timeVar);

            // Extract positions (trajectory)
            extractPositionHistory(floatEntity, nc, latVar, lonVar, timeVar);

            return floatEntity;
        }
    }

    private void extractProfileSamples(ArgoFloatEntity floatEntity, NetcdfFile nc,
                                      Variable depthVar, Variable timeVar) throws IOException {
        Set<String> profileVars = new HashSet<>(Arrays.asList(
            "temperature", "salinity", "temp", "sal", "psal", "cond",
            "oxygen", "nitrate", "phosphate", "silicate", "chla", "ph"
        ));

        List<Variable> dataVars = nc.getVariables().stream()
            .filter(v -> profileVars.contains(v.getShortName().toLowerCase()))
            .toList();

        if (dataVars.isEmpty()) return;

        // Get dimensions
        int nDepth = depthVar.getShape()[0];
        int nTime = timeVar != null ? timeVar.getShape()[0] : 1;

        Instant timestamp = getTimestamp(timeVar, 0);

        for (int d = 0; d < Math.min(nDepth, 50); d++) {
            ProfileSampleEntity sample = new ProfileSampleEntity();
            sample.setArgoFloat(floatEntity);
            sample.setTimestamp(timestamp);
            sample.setDepthMeters(getDepthValue(depthVar, d));

            // Extract available variables
            for (Variable var : dataVars) {
                String varName = var.getShortName().toLowerCase();
                try {
                    double value = getValue(var, d, 0);
                    if (varName.contains("temp")) {
                        sample.setTemperatureC(value);
                    } else if (varName.contains("sal")) {
                        sample.setSalinityPsu(value);
                    }
                    // Note: oxygen, nitrate, phosphate etc. are not stored in profile samples
                } catch (Exception e) {
                    // Skip if dimension mismatch
                }
            }

            floatEntity.getProfileSamples().add(sample);
        }
    }

    private void extractPositionHistory(ArgoFloatEntity floatEntity, NetcdfFile nc,
                                       Variable latVar, Variable lonVar, Variable timeVar) throws IOException {
        int nTime = timeVar != null ? timeVar.getShape()[0] : 1;

        for (int t = 0; t < Math.min(nTime, 10); t++) {
            FloatPositionEntity pos = new FloatPositionEntity();
            pos.setArgoFloat(floatEntity);
            pos.setLatitude(getLatValue(latVar, t));
            pos.setLongitude(getLonValue(lonVar, t));
            pos.setTimestamp(getTimestamp(timeVar, t));

            floatEntity.getPositions().add(pos);
        }
    }

    // Helper methods
    private String extractPlatformId(String fileName) {
        // Extract platform ID from filename (e.g., "D2902294_153" from filename)
        String base = fileName.replaceAll("\\..*", "").replaceAll("[^0-9]", "");
        return base.length() >= 6 ? base.substring(0, 7) : base;
    }

    private String detectInstrumentType(String fileName, NetcdfFile nc) {
        String lower = fileName.toLowerCase();
        if (lower.contains("argo") || lower.contains("_d") || lower.contains("d_")) return "ARGO_FLOAT";
        if (lower.contains("bgc") || lower.contains("sd")) return "BGC_FLOAT";
        if (lower.contains("glider") || lower.contains("sea")) return "GLIDER";
        if (lower.contains("ctd")) return "CTD";
        return "UNKNOWN";
    }

    private double getFirstValue(Variable var, double defaultValue) {
        try {
            if (var.getShape()[0] > 0) {
                return var.read().getDouble(0);
            }
        } catch (IOException | IndexOutOfBoundsException e) {
            log.debug("Error reading variable {}: {}", var.getShortName(), e.getMessage());
        }
        return defaultValue;
    }

    private double getLatValue(Variable latVar, int index) {
        try {
            if (latVar.getShape().length == 1 && latVar.getShape()[0] > index) {
                return latVar.read().getDouble(index);
            } else if (latVar.getShape().length > 1 && latVar.getShape()[0] > index) {
                return latVar.read().getDouble(index);
            }
        } catch (IOException e) {
            log.debug("Error reading latitude");
        }
        return 0.0;
    }

    private double getLonValue(Variable lonVar, int index) {
        try {
            if (lonVar.getShape().length == 1 && lonVar.getShape()[0] > index) {
                return lonVar.read().getDouble(index);
            } else if (lonVar.getShape().length > 1 && lonVar.getShape()[0] > index) {
                return lonVar.read().getDouble(index);
            }
        } catch (IOException e) {
            log.debug("Error reading longitude");
        }
        return 0.0;
    }

    private double getDepthValue(Variable depthVar, int index) {
        try {
            if (depthVar.getShape()[0] > index) {
                return depthVar.read().getDouble(index);
            }
        } catch (IOException e) {
            log.debug("Error reading depth");
        }
        return 0.0;
    }

    private double getValue(Variable var, int... indices) throws IOException {
        var array = var.read();
        if (indices.length == 1) {
            return array.getDouble(indices[0]);
        } else {
            // Multi-dimensional access
            int index = indices[0];
            if (var.getShape().length > 1 && indices.length > 1) {
                index = indices[0] * var.getShape()[1] + indices[1];
            }
            return array.getDouble(index);
        }
    }

    private Instant getTimestamp(Variable timeVar, int index) {
        if (timeVar == null) return Instant.now();
        try {
            if (timeVar.getShape()[0] > index) {
                double timeValue = timeVar.read().getDouble(index);
                // Assume Unix timestamp in seconds or CF convention (seconds since epoch)
                return Instant.ofEpochSecond((long) timeValue);
            }
        } catch (IOException | IllegalArgumentException e) {
            log.debug("Error reading timestamp");
        }
        return Instant.now();
    }
}
