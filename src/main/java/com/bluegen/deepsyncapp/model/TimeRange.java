package com.bluegen.deepsyncapp.model;

import java.time.Instant;

public record TimeRange(Instant earliest, Instant latest) {
}
