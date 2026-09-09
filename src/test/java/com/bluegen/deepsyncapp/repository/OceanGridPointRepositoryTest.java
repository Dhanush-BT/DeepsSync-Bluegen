package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.AbstractPostgresTest;
import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OceanGridPointRepositoryTest extends AbstractPostgresTest {

    private static final Instant T1 = Instant.parse("2026-09-01T00:00:00Z");
    private static final Instant T2 = Instant.parse("2026-09-02T00:00:00Z");

    @Autowired
    private OceanGridPointRepository repository;

    @BeforeEach
    void seed() {
        repository.deleteAll();
        repository.saveAll(List.of(
                point(10.0, 70.0, 0.0, T1),
                point(10.0, 70.0, 100.0, T1),
                point(20.0, 80.0, 0.0, T1),
                point(20.0, 80.0, 0.0, T2)));
    }

    private OceanGridPointEntity point(double lat, double lon, double depth, Instant at) {
        OceanGridPointEntity p = new OceanGridPointEntity();
        p.setLatitude(lat);
        p.setLongitude(lon);
        p.setDepthMeters(depth);
        p.setTimestamp(at);
        p.setTemperatureC(25.0);
        p.setSalinityPsu(35.0);
        p.setCurrentU(0.1);
        p.setCurrentV(0.2);
        p.setChlorophyll(0.5);
        return p;
    }

    @Test
    void allNullParametersReturnEverything() {
        List<OceanGridPointEntity> found =
                repository.findFiltered(null, null, null, null, null, null);

        assertThat(found).hasSize(4);
    }

    @Test
    void boundingBoxExcludesPointsOutsideIt() {
        List<OceanGridPointEntity> found =
                repository.findFiltered(5.0, 15.0, 65.0, 75.0, null, null);

        assertThat(found).hasSize(2);
        assertThat(found).allSatisfy(p -> assertThat(p.getLatitude()).isEqualTo(10.0));
    }

    @Test
    void depthAndTimestampNarrowFurther() {
        List<OceanGridPointEntity> found =
                repository.findFiltered(null, null, null, null, 0.0, T2);

        assertThat(found).hasSize(1);
        assertThat(found.get(0).getLongitude()).isEqualTo(80.0);
    }

    @Test
    void resultsAreOrderedByDepthThenLatitudeThenLongitude() {
        List<OceanGridPointEntity> found =
                repository.findFiltered(null, null, null, null, null, T1);

        assertThat(found).extracting(OceanGridPointEntity::getDepthMeters)
                .containsExactly(0.0, 0.0, 100.0);
        assertThat(found.get(0).getLatitude()).isEqualTo(10.0);
    }
}
