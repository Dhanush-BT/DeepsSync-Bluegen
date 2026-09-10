package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.OceanGridPoint;
import com.bluegen.deepsyncapp.service.OceanDataService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OceanDataController.class)
class OceanDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OceanDataService oceanDataService;

    @Test
    void returnsGridPointsAsAJsonArray() throws Exception {
        when(oceanDataService.findPoints(any())).thenReturn(List.of(
                new OceanGridPoint(10.0, 70.0, 0.0, Instant.parse("2026-09-01T00:00:00Z"),
                        27.5, 34.6, 0.1, 0.2, 0.5)));

        mockMvc.perform(get("/api/ocean-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].latitude").value(10.0))
                .andExpect(jsonPath("$[0].temperatureC").value(27.5))
                .andExpect(jsonPath("$[0].timestamp").value("2026-09-01T00:00:00Z"));
    }

    @Test
    void bindsAllFilterParameters() throws Exception {
        when(oceanDataService.findPoints(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/ocean-data")
                        .param("minLat", "5").param("maxLat", "15")
                        .param("minLon", "65").param("maxLon", "75")
                        .param("depthMeters", "100")
                        .param("timestamp", "2026-09-01T00:00:00Z"))
                .andExpect(status().isOk());

        ArgumentCaptor<OceanDataFilter> captor = ArgumentCaptor.forClass(OceanDataFilter.class);
        verify(oceanDataService).findPoints(captor.capture());
        OceanDataFilter filter = captor.getValue();
        assertThat(filter.minLat()).isEqualTo(5.0);
        assertThat(filter.depthMeters()).isEqualTo(100.0);
        assertThat(filter.timestamp()).isEqualTo(Instant.parse("2026-09-01T00:00:00Z"));
    }

    @Test
    void rejectsInvertedLatitudeRangeWith400() throws Exception {
        mockMvc.perform(get("/api/ocean-data").param("minLat", "20").param("maxLat", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.path").value("/api/ocean-data"));
    }

    @Test
    void rejectsOutOfRangeLatitudeWith400() throws Exception {
        mockMvc.perform(get("/api/ocean-data").param("minLat", "-200"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsUnparseableTimestampWith400() throws Exception {
        mockMvc.perform(get("/api/ocean-data").param("timestamp", "yesterday"))
                .andExpect(status().isBadRequest());
    }
}
