package com.bluegen.deepsyncapp.model;

import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;

import java.time.Instant;

public record ProfileSample(Instant timestamp,
                            Double depthMeters,
                            Double temperatureC,
                            Double salinityPsu,
                            Double currentU,
                            Double currentV,
                            Double chlorophyll) {

    public static ProfileSample from(ProfileSampleEntity entity) {
        return new ProfileSample(
                entity.getTimestamp(),
                entity.getDepthMeters(),
                entity.getTemperatureC(),
                entity.getSalinityPsu(),
                entity.getCurrentU(),
                entity.getCurrentV(),
                entity.getChlorophyll());
    }
}
