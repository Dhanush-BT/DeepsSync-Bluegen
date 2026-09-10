package com.bluegen.deepsyncapp.model;

import java.util.Map;

public record CorpusSummary(Long gridPointCount,
                            Map<String, Long> floatCountByInstrumentType,
                            DoubleRange depthRange,
                            DoubleRange latRange,
                            DoubleRange lonRange,
                            TimeRange timeRange,
                            Long activeHazardCount) {
}
