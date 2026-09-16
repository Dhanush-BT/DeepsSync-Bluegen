package com.bluegen.deepsyncapp.config;

import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.ingestion.NetCdfDatasetLoader;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Enhanced data seeder that loads all available datasets from the dataset directory:
 * - Argo profiles (NetCDF)
 * - BGC (Bio-Geo-Chemical) float profiles (NetCDF)
 * - Glider trajectories (NetCDF)
 * - CTD casts (NetCDF)
 * - IGORA model data (NetCDF/CSV)
 * - Hazard advisories (NetCDF)
 *
 * Auto-detects data types using CF Convention metadata and intelligently
 * maps them to appropriate entity types for visualization.
 */
@Component
public class EnhancedDataSeeder {
    private static final Logger log = LoggerFactory.getLogger(EnhancedDataSeeder.class);

    private static final String DATASET_ROOT = "dataset/SIH 26067";
    private static final Set<String> DATASET_TYPES = new HashSet<>(Arrays.asList(
        "argo", "bgc", "glider", "ctd", "igora", "hycom", "hazards"
    ));

    private final ArgoFloatRepository argoFloatRepository;

    public EnhancedDataSeeder(ArgoFloatRepository argoFloatRepository) {
        this.argoFloatRepository = argoFloatRepository;
    }

    /**
     * Seed all available datasets into the database
     */
    public void seedAllDatasets() {
        Path rootPath = Paths.get(DATASET_ROOT);

        if (!Files.exists(rootPath)) {
            log.warn("Dataset directory not found at {}", rootPath.toAbsolutePath());
            return;
        }

        for (String datasetType : DATASET_TYPES) {
            seedDataset(rootPath.resolve(datasetType), datasetType);
        }
    }

    /**
     * Seed a specific dataset type
     */
    private void seedDataset(Path datasetPath, String datasetType) {
        if (!Files.exists(datasetPath)) {
            log.debug("Dataset {} not found", datasetType);
            return;
        }

        try {
            log.info("Loading {} dataset from {}", datasetType, datasetPath);

            NetCdfDatasetLoader loader = new NetCdfDatasetLoader(datasetPath, datasetType);
            List<ArgoFloatEntity> floats = loader.loadFloatProfiles();

            // Save to database (skip duplicates by platform ID)
            int saved = 0;
            for (ArgoFloatEntity float_ : floats) {
                if (argoFloatRepository.findByPlatformId(float_.getPlatformId()).isEmpty()) {
                    argoFloatRepository.save(float_);
                    saved++;
                }
            }

            log.info("Saved {} profiles from {} dataset", saved, datasetType);
        } catch (IOException e) {
            log.error("Error loading {} dataset: {}", datasetType, e.getMessage());
        }
    }

    /**
     * Get available datasets in the root directory
     */
    public List<String> getAvailableDatasets() {
        Path rootPath = Paths.get(DATASET_ROOT);
        if (!Files.exists(rootPath)) {
            return List.of();
        }

        try (var stream = Files.list(rootPath)) {
            return stream
                .filter(Files::isDirectory)
                .map(p -> p.getFileName().toString())
                .filter(name -> !name.startsWith("."))
                .toList();
        } catch (IOException e) {
            log.error("Error listing datasets: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Get dataset statistics
     */
    public DatasetStats getDatasetStats(String datasetType) {
        Path datasetPath = Paths.get(DATASET_ROOT).resolve(datasetType);

        if (!Files.exists(datasetPath)) {
            return new DatasetStats(datasetType, 0, 0);
        }

        try (var stream = Files.walk(datasetPath)) {
            long fileCount = stream.filter(p -> p.toString().endsWith(".nc") || p.toString().endsWith(".csv"))
                .count();
            long profileCount = argoFloatRepository.countByDataSource(datasetType);
            return new DatasetStats(datasetType, fileCount, profileCount);
        } catch (IOException e) {
            log.error("Error getting stats for {}: {}", datasetType, e.getMessage());
            return new DatasetStats(datasetType, 0, 0);
        }
    }

    public record DatasetStats(String type, long fileCount, long profileCount) {}
}
