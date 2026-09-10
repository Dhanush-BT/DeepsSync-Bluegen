package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.CorpusSummary;
import com.bluegen.deepsyncapp.model.DoubleRange;
import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.TimeRange;
import com.bluegen.deepsyncapp.model.VariableStatistics;
import com.bluegen.deepsyncapp.model.VariableSummary;
import com.bluegen.deepsyncapp.service.StatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StatsController.class)
class StatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StatsService statsService;

    @Test
    void reportsTheCorpusSummary() throws Exception {
        when(statsService.summary()).thenReturn(new CorpusSummary(
                384L,
                Map.of("ARGO_FLOAT", 3L, "GLIDER", 2L),
                new DoubleRange(0.0, 1000.0),
                new DoubleRange(-10.0, 25.0),
                new DoubleRange(60.0, 95.0),
                new TimeRange(Instant.parse("2026-09-01T00:00:00Z"),
                        Instant.parse("2026-09-01T00:00:00Z")),
                3L));

        mockMvc.perform(get("/api/stats/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gridPointCount").value(384))
                .andExpect(jsonPath("$.floatCountByInstrumentType.ARGO_FLOAT").value(3))
                .andExpect(jsonPath("$.depthRange.max").value(1000.0))
                .andExpect(jsonPath("$.latRange.min").value(-10.0))
                .andExpect(jsonPath("$.activeHazardCount").value(3));
    }

    @Test
    void reportsVariableStatisticsForAFilter() throws Exception {
        when(statsService.variables(any())).thenReturn(new VariableStatistics(
                new VariableSummary(15.0, 28.0, 21.14, 384L),
                new VariableSummary(34.0, 35.4, 34.87, 384L),
                new VariableSummary(0.1, 1.2, 0.45, 384L),
                new OceanDataFilter(null, null, null, null, null, null)));

        mockMvc.perform(get("/api/stats/variables"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.temperatureC.mean").value(21.14))
                .andExpect(jsonPath("$.salinityPsu.max").value(35.4))
                .andExpect(jsonPath("$.chlorophyll.count").value(384));
    }

    @Test
    void rejectsAnInvertedBoundingBoxWith400() throws Exception {
        mockMvc.perform(get("/api/stats/variables")
                .param("minLon", "95").param("maxLon", "60"))
                .andExpect(status().isBadRequest());
    }
}
