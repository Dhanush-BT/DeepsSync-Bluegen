package com.bluegen.deepsyncapp.model;

import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;

import java.time.Instant;

public record OceanGridPoint(Double latitude,
                             Double longitude,
                             Double depthMeters,
                             Instant timestamp,
                             Double temperatureC,
                             Double salinityPsu,
                             Double currentU,
                             Double currentV,
                             Double chlorophyll) {

    public static OceanGridPoint from(OceanGridPointEntity entity) {
        return new OceanGridPoint(
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getDepthMeters(),
                entity.getTimestamp(),
                entity.getTemperatureC(),
                entity.getSalinityPsu(),
                entity.getCurrentU(),
                entity.getCurrentV(),
                entity.getChlorophyll());
    }
}
