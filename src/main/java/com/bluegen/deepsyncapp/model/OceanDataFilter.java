package com.bluegen.deepsyncapp.model;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import java.time.Instant;

/**
 * Bounding box plus depth and time. Every field is optional; null means unbounded on
 * that axis. Shared by /api/ocean-data and /api/stats/variables.
 */
public record OceanDataFilter(
        @DecimalMin("-90") @DecimalMax("90") Double minLat,
        @DecimalMin("-90") @DecimalMax("90") Double maxLat,
        @DecimalMin("-180") @DecimalMax("180") Double minLon,
        @DecimalMin("-180") @DecimalMax("180") Double maxLon,
        Double depthMeters,
        Instant timestamp) {

    @AssertTrue(message = "minLat must be less than or equal to maxLat")
    public boolean isLatitudeRangeOrdered() {
        return minLat == null || maxLat == null || minLat <= maxLat;
    }

    @AssertTrue(message = "minLon must be less than or equal to maxLon")
    public boolean isLongitudeRangeOrdered() {
        return minLon == null || maxLon == null || minLon <= maxLon;
    }
}
