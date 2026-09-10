package com.bluegen.deepsyncapp.model;

import java.time.Instant;
import java.util.List;

/** The discrete depth and time steps present in the grid, for the TimeSlider and depth pickers. */
public record OceanDataAxes(List<Double> depths, List<Instant> timestamps) {
}
