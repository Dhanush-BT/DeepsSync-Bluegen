package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import com.bluegen.deepsyncapp.model.HazardAdvisory;
import com.bluegen.deepsyncapp.service.HazardAdvisoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HazardAdvisoryController.class)
class HazardAdvisoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HazardAdvisoryService hazardAdvisoryService;

    @Test
    void listsAdvisories() throws Exception {
        when(hazardAdvisoryService.findAdvisories(null, null)).thenReturn(List.of(
                new HazardAdvisory(1L, HazardType.TSUNAMI, "Bay of Bengal",
                        "Tsunami watch in effect", Severity.SEVERE,
                        Instant.parse("2026-09-01T00:00:00Z"))));

        mockMvc.perform(get("/api/hazards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("TSUNAMI"))
                .andExpect(jsonPath("$[0].severity").value("SEVERE"))
                .andExpect(jsonPath("$[0].region").value("Bay of Bengal"));
    }

    @Test
    void filtersByTypeAndSeverity() throws Exception {
        when(hazardAdvisoryService.findAdvisories(HazardType.PFZ, Severity.LOW))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/hazards").param("type", "PFZ").param("severity", "LOW"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void rejectsAnUnknownHazardTypeWith400() throws Exception {
        mockMvc.perform(get("/api/hazards").param("type", "VOLCANO"))
                .andExpect(status().isBadRequest());
    }
}
