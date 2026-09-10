package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.AbstractPostgresTest;
import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import com.bluegen.deepsyncapp.model.ArgoFloat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ArgoFloatRepositoryTest extends AbstractPostgresTest {

    private static final Instant T1 = Instant.parse("2026-09-01T00:00:00Z");
    private static final Instant T2 = Instant.parse("2026-09-05T00:00:00Z");

    @Autowired
    private ArgoFloatRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();

        ArgoFloatEntity floaty = new ArgoFloatEntity();
        floaty.setPlatformId("1111111");
        floaty.setInstrumentType("ARGO_FLOAT");
        floaty.setLatitude(12.0);
        floaty.setLongitude(72.0);
        floaty.addProfileSample(sample(T1, 0.0));
        floaty.addProfileSample(sample(T2, 0.0));
        floaty.addPosition(position(T1, 12.0, 72.0));

        ArgoFloatEntity glider = new ArgoFloatEntity();
        glider.setPlatformId("2222222");
        glider.setInstrumentType("GLIDER");
        glider.setLatitude(15.0);
        glider.setLongitude(75.0);

        repository.saveAll(List.of(floaty, glider));
    }

    private ProfileSampleEntity sample(Instant at, Double depth) {
        ProfileSampleEntity s = new ProfileSampleEntity();
        s.setTimestamp(at);
        s.setDepthMeters(depth);
        s.setTemperatureC(27.0);
        s.setSalinityPsu(34.5);
        return s;
    }

    private FloatPositionEntity position(Instant at, Double lat, Double lon) {
        FloatPositionEntity p = new FloatPositionEntity();
        p.setTimestamp(at);
        p.setLatitude(lat);
        p.setLongitude(lon);
        return p;
    }

    @Test
    void projectsChildCountsWithoutLoadingCollections() {
        List<ArgoFloat> floats = repository.findProjectedFloats(null);

        assertThat(floats).hasSize(2);
        ArgoFloat first = floats.get(0);
        assertThat(first.platformId()).isEqualTo("1111111");
        assertThat(first.profileCount()).isEqualTo(2L);
        assertThat(first.positionCount()).isEqualTo(1L);
        assertThat(first.firstObservedAt()).isEqualTo(T1);
        assertThat(first.lastObservedAt()).isEqualTo(T2);
    }

    @Test
    void reportsZeroCountsForAFloatWithNoChildren() {
        List<ArgoFloat> floats = repository.findProjectedFloats("GLIDER");

        assertThat(floats).hasSize(1);
        assertThat(floats.get(0).profileCount()).isZero();
        assertThat(floats.get(0).firstObservedAt()).isNull();
    }

    @Test
    void filtersByInstrumentType() {
        assertThat(repository.findProjectedFloats("ARGO_FLOAT"))
                .extracting(ArgoFloat::platformId)
                .containsExactly("1111111");
    }

    @Test
    void findsASingleFloatByPlatformId() {
        assertThat(repository.findProjectedFloat("2222222")).isPresent();
        assertThat(repository.findProjectedFloat("9999999")).isEmpty();
    }
}
