package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.service.ArgoService;
import com.bluegen.deepsyncapp.service.NotFoundException;
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

@WebMvcTest(ArgoController.class)
class ArgoControllerTest {

    private static final ArgoFloat FLOAT = new ArgoFloat("2900226", "ARGO_FLOAT", 12.0, 72.0,
            30L, 6L, Instant.parse("2026-09-01T00:00:00Z"), Instant.parse("2026-09-06T00:00:00Z"));

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArgoService argoService;

    @Test
    void returnsAllFloatsAsAJsonArray() throws Exception {
        when(argoService.findFloats(null)).thenReturn(List.of(FLOAT));

        mockMvc.perform(get("/api/floats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].platformId").value("2900226"))
                .andExpect(jsonPath("$[0].profileCount").value(30));
    }

    @Test
    void filtersByInstrumentType() throws Exception {
        when(argoService.findFloats("GLIDER")).thenReturn(List.of());

        mockMvc.perform(get("/api/floats").param("instrumentType", "GLIDER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void returnsASingleFloat() throws Exception {
        when(argoService.findFloat("2900226")).thenReturn(FLOAT);

        mockMvc.perform(get("/api/floats/2900226"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instrumentType").value("ARGO_FLOAT"));
    }

    @Test
    void returns404ForAnUnknownPlatformId() throws Exception {
        when(argoService.findFloat("9999999"))
                .thenThrow(new NotFoundException("No float with platformId 9999999"));

        mockMvc.perform(get("/api/floats/9999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("No float with platformId 9999999"))
                .andExpect(jsonPath("$.path").value("/api/floats/9999999"));
    }
}
