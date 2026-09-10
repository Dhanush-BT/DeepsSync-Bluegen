package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.CorpusSummary;
import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.VariableStatistics;
import com.bluegen.deepsyncapp.service.StatsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/summary")
    public CorpusSummary summary() {
        return statsService.summary();
    }

    @GetMapping("/variables")
    public VariableStatistics variables(@Valid @ModelAttribute OceanDataFilter filter) {
        return statsService.variables(filter);
    }
}
