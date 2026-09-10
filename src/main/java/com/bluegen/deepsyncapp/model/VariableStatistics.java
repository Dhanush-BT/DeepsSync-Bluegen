package com.bluegen.deepsyncapp.model;

/**
 * The filter is echoed back so a caller — notably the AI Assistant — can show exactly which
 * subset a number came from. The LLM is never the source of a value.
 */
public record VariableStatistics(VariableSummary temperatureC,
                                 VariableSummary salinityPsu,
                                 VariableSummary chlorophyll,
                                 OceanDataFilter filter) {
}
