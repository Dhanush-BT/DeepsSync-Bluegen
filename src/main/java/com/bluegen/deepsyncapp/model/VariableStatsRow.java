package com.bluegen.deepsyncapp.model;

/** Flat aggregate row from the grid; regrouped per variable by VariableStatistics. */
public record VariableStatsRow(Double temperatureMin,
                               Double temperatureMax,
                               Double temperatureMean,
                               Long temperatureCount,
                               Double salinityMin,
                               Double salinityMax,
                               Double salinityMean,
                               Long salinityCount,
                               Double chlorophyllMin,
                               Double chlorophyllMax,
                               Double chlorophyllMean,
                               Long chlorophyllCount) {
}
