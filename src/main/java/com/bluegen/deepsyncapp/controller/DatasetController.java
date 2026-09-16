package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.config.EnhancedDataSeeder;
import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {

    private final EnhancedDataSeeder dataSeeder;
    private final ArgoFloatRepository argoFloatRepository;

    public DatasetController(EnhancedDataSeeder dataSeeder, ArgoFloatRepository argoFloatRepository) {
        this.dataSeeder = dataSeeder;
        this.argoFloatRepository = argoFloatRepository;
    }

    @GetMapping
    public List<String> getAvailableDatasets() {
        return dataSeeder.getAvailableDatasets();
    }

    @GetMapping("/stats")
    public Map<String, Object> getDatasetStats() {
        List<String> datasets = dataSeeder.getAvailableDatasets();
        return datasets.stream()
            .collect(java.util.stream.Collectors.toMap(
                ds -> ds,
                ds -> {
                    var stats = dataSeeder.getDatasetStats(ds);
                    return Map.of(
                        "files", stats.fileCount(),
                        "profiles", stats.profileCount()
                    );
                }
            ));
    }

    @GetMapping("/{datasetType}")
    public List<ArgoFloat> getDatasetProfiles(@PathVariable String datasetType) {
        // Filter floats by data source
        return argoFloatRepository.findProjectedFloats(null).stream()
            .filter(f -> datasetType.equalsIgnoreCase("all") ||
                    (f.platformId() != null && datasetType.equals(detectDatasetFromPlatformId(f.platformId()))))
            .toList();
    }

    @PostMapping("/reload")
    public Map<String, String> reloadDatasets() {
        dataSeeder.seedAllDatasets();
        return Map.of("status", "Datasets reloaded successfully");
    }

    private String detectDatasetFromPlatformId(String platformId) {
        if (platformId == null) return "unknown";
        String lower = platformId.toLowerCase();
        if (lower.startsWith("d") || lower.contains("290")) return "argo";
        if (lower.startsWith("sd")) return "bgc";
        if (lower.startsWith("sr")) return "bgc";
        if (lower.contains("sea") || lower.contains("glider")) return "glider";
        if (lower.contains("ctd")) return "ctd";
        return "other";
    }
}
