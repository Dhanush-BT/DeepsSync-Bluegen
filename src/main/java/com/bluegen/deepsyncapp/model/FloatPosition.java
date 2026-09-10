package com.bluegen.deepsyncapp.model;

import com.bluegen.deepsyncapp.entity.FloatPositionEntity;

import java.time.Instant;

public record FloatPosition(Instant timestamp, Double latitude, Double longitude) {

    public static FloatPosition from(FloatPositionEntity entity) {
        return new FloatPosition(entity.getTimestamp(), entity.getLatitude(), entity.getLongitude());
    }
}
