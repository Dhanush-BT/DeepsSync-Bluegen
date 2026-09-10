package com.bluegen.deepsyncapp.model;

import java.time.Instant;

/** Flat aggregate row from the grid; regrouped into ranges by CorpusSummary. */
public record GridExtent(Long count,
                         Double minDepth,
                         Double maxDepth,
                         Double minLat,
                         Double maxLat,
                         Double minLon,
                         Double maxLon,
                         Instant earliest,
                         Instant latest) {
}
