package com.bluegen.deepsyncapp.model;

import java.time.Instant;

/**
 * Float list/detail projection. Child counts and observation range are aggregated in the
 * query itself so the float list never drags in the LAZY profile/position collections —
 * those are reached only via the sub-resource endpoints.
 */
public record ArgoFloat(String platformId,
                        String instrumentType,
                        Double latitude,
                        Double longitude,
                        Long profileCount,
                        Long positionCount,
                        Instant firstObservedAt,
                        Instant lastObservedAt) {
}
