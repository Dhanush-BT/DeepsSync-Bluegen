package com.bluegen.deepsyncapp.config;

import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import com.bluegen.deepsyncapp.entity.UserEntity;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import com.bluegen.deepsyncapp.repository.HazardAdvisoryRepository;
import com.bluegen.deepsyncapp.repository.OceanGridPointRepository;
import com.bluegen.deepsyncapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;

/**
 * Seeds realistic mock data on first startup so every downstream feature
 * (Dashboard 3D/2D, Geo Map, Auth bootstrap, Hazard overlay) has real data to
 * render against instead of empty tables. Each seeding step is independently
 * idempotent so repeated app restarts never duplicate rows.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final double[] GRID_DEPTHS = {0, 50, 100, 200, 500, 1000};
    private static final double[] PROFILE_DEPTHS = {0, 50, 100, 200, 500};
    private static final String[] FLOAT_INSTRUMENT_TYPES = {"ARGO_FLOAT", "GLIDER"};
    private static final String[] HAZARD_REGIONS = {"Bay of Bengal", "Arabian Sea", "Lakshadweep Sea"};

    private final OceanGridPointRepository gridPointRepository;
    private final ArgoFloatRepository argoFloatRepository;
    private final HazardAdvisoryRepository hazardAdvisoryRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final String adminEmail;
    private final String adminPassword;
    private final String adminFullName;

    public DataSeeder(
            OceanGridPointRepository gridPointRepository,
            ArgoFloatRepository argoFloatRepository,
            HazardAdvisoryRepository hazardAdvisoryRepository,
            UserRepository userRepository,
            @Value("${deepsync.admin.email:admin@deepsync.local}") String adminEmail,
            @Value("${deepsync.admin.password:ChangeMe123!}") String adminPassword,
            @Value("${deepsync.admin.full-name:DEEPSYNC Admin}") String adminFullName) {
        this.gridPointRepository = gridPointRepository;
        this.argoFloatRepository = argoFloatRepository;
        this.hazardAdvisoryRepository = hazardAdvisoryRepository;
        this.userRepository = userRepository;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminFullName = adminFullName;
    }

    @Override
    public void run(String... args) {
        seedOceanGrid();
        seedArgoFloats();
        seedHazardAdvisories();
        seedAdminUser();
    }

    private void seedOceanGrid() {
        if (gridPointRepository.count() > 0) {
            log.info("Ocean grid already seeded, skipping");
            return;
        }

        Random random = new Random(42);
        Instant now = Instant.now().truncatedTo(ChronoUnit.HOURS);
        int inserted = 0;

        for (double lat = -10; lat <= 25; lat += 5) {
            for (double lon = 60; lon <= 95; lon += 5) {
                for (double depth : GRID_DEPTHS) {
                    OceanGridPointEntity point = new OceanGridPointEntity();
                    point.setLatitude(lat);
                    point.setLongitude(lon);
                    point.setDepthMeters(depth);
                    point.setTimestamp(now);
                    point.setTemperatureC(surfaceTemperatureFor(lat) - depthFalloff(depth, 0.02) + jitter(random, 0.5));
                    point.setSalinityPsu(34.5 + (depth / 1000.0) * 1.2 + jitter(random, 0.15));
                    point.setCurrentU(Math.sin(Math.toRadians(lat + lon)) * 0.6 + jitter(random, 0.1));
                    point.setCurrentV(Math.cos(Math.toRadians(lat - lon)) * 0.6 + jitter(random, 0.1));
                    point.setChlorophyll(Math.max(0.02, 0.8 * Math.exp(-depth / 120.0) + jitter(random, 0.05)));
                    gridPointRepository.save(point);
                    inserted++;
                }
            }
        }

        log.info("Seeded {} ocean grid points", inserted);
    }

    private void seedArgoFloats() {
        if (argoFloatRepository.count() > 0) {
            log.info("Argo floats already seeded, skipping");
            return;
        }

        Random random = new Random(7);
        Instant now = Instant.now();
        int floatCount = 5;
        int timestepCount = 6;

        for (int i = 0; i < floatCount; i++) {
            ArgoFloatEntity argoFloat = new ArgoFloatEntity();
            argoFloat.setPlatformId("29002" + (26 + i));
            argoFloat.setInstrumentType(FLOAT_INSTRUMENT_TYPES[i % FLOAT_INSTRUMENT_TYPES.length]);

            double startLat = -8 + random.nextDouble() * 30;
            double startLon = 62 + random.nextDouble() * 30;
            argoFloat.setLatitude(startLat);
            argoFloat.setLongitude(startLon);

            double lat = startLat;
            double lon = startLon;

            for (int t = 0; t < timestepCount; t++) {
                Instant timestamp = now.minus((timestepCount - t) * 24L, ChronoUnit.HOURS);

                // Drift the float slightly each timestep to build a real trajectory.
                lat += jitter(random, 0.3);
                lon += jitter(random, 0.3);

                FloatPositionEntity position = new FloatPositionEntity();
                position.setTimestamp(timestamp);
                position.setLatitude(lat);
                position.setLongitude(lon);
                argoFloat.addPosition(position);

                for (double depth : PROFILE_DEPTHS) {
                    ProfileSampleEntity sample = new ProfileSampleEntity();
                    sample.setTimestamp(timestamp);
                    sample.setDepthMeters(depth);
                    sample.setTemperatureC(surfaceTemperatureFor(lat) - depthFalloff(depth, 0.02) + jitter(random, 0.4));
                    sample.setSalinityPsu(34.5 + (depth / 1000.0) * 1.2 + jitter(random, 0.15));
                    sample.setCurrentU(Math.sin(Math.toRadians(lat + lon + t)) * 0.5 + jitter(random, 0.1));
                    sample.setCurrentV(Math.cos(Math.toRadians(lat - lon + t)) * 0.5 + jitter(random, 0.1));
                    sample.setChlorophyll(Math.max(0.02, 0.8 * Math.exp(-depth / 120.0) + jitter(random, 0.05)));
                    argoFloat.addProfileSample(sample);
                }
            }

            // Keep the float's headline position current with its latest fix.
            argoFloat.setLatitude(lat);
            argoFloat.setLongitude(lon);

            argoFloatRepository.save(argoFloat);
        }

        log.info("Seeded {} Argo floats with {} timesteps each", floatCount, timestepCount);
    }

    private void seedHazardAdvisories() {
        if (hazardAdvisoryRepository.count() > 0) {
            log.info("Hazard advisories already seeded, skipping");
            return;
        }

        List<HazardAdvisoryEntity> advisories = List.of(
                hazard(HazardType.HIGH_WAVE, HAZARD_REGIONS[0], Severity.MODERATE,
                        "High wave alert for fishing vessels operating in the Bay of Bengal."),
                hazard(HazardType.PFZ, HAZARD_REGIONS[1], Severity.LOW,
                        "Potential Fishing Zone advisory issued for the Arabian Sea."),
                hazard(HazardType.TSUNAMI, HAZARD_REGIONS[2], Severity.SEVERE,
                        "Tsunami watch issued near the Lakshadweep Sea following seismic activity.")
        );

        hazardAdvisoryRepository.saveAll(advisories);
        log.info("Seeded {} hazard advisories", advisories.size());
    }

    private HazardAdvisoryEntity hazard(HazardType type, String region, Severity severity, String message) {
        HazardAdvisoryEntity advisory = new HazardAdvisoryEntity();
        advisory.setType(type);
        advisory.setRegion(region);
        advisory.setSeverity(severity);
        advisory.setMessage(message);
        advisory.setIssuedAt(Instant.now());
        return advisory;
    }

    private void seedAdminUser() {
        if (userRepository.findByEmpIdOrEmail(adminEmail).isPresent()) {
            log.info("Admin user already seeded, skipping");
            return;
        }

        UserEntity admin = new UserEntity();
        admin.setEmpIdOrEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setFullName(adminFullName);
        admin.setActive(true);
        userRepository.save(admin);

        log.info("Seeded pre-activated admin user '{}'", adminEmail);
    }

    private double surfaceTemperatureFor(double latitude) {
        // Warmer near the equator, cooler toward higher latitudes.
        return 29.0 - Math.abs(latitude) * 0.15;
    }

    private double depthFalloff(double depthMeters, double rate) {
        return depthMeters * rate;
    }

    private double jitter(Random random, double magnitude) {
        return (random.nextDouble() - 0.5) * 2 * magnitude;
    }
}
