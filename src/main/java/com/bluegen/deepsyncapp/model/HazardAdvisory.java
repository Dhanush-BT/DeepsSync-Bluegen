package com.bluegen.deepsyncapp.model;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;

import java.time.Instant;

public record HazardAdvisory(Long id,
                             HazardType type,
                             String region,
                             String message,
                             Severity severity,
                             Instant issuedAt) {

    public static HazardAdvisory from(HazardAdvisoryEntity entity) {
        return new HazardAdvisory(
                entity.getId(),
                entity.getType(),
                entity.getRegion(),
                entity.getMessage(),
                entity.getSeverity(),
                entity.getIssuedAt());
    }
}
