package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.OceanDataAxes;
import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.OceanGridPoint;
import com.bluegen.deepsyncapp.service.OceanDataService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ocean-data")
public class OceanDataController {

    private final OceanDataService oceanDataService;

    public OceanDataController(OceanDataService oceanDataService) {
        this.oceanDataService = oceanDataService;
    }

    @GetMapping
    public List<OceanGridPoint> gridPoints(
            @Valid @ModelAttribute OceanDataFilter filter,
            @RequestParam(required = false) List<String> dataset) {
        // Filter by dataset if specified
        if (dataset != null && !dataset.isEmpty()) {
            return oceanDataService.findPointsByDatasets(filter, dataset);
        }
        return oceanDataService.findPoints(filter);
    }

    @GetMapping("/axes")
    public OceanDataAxes axes() {
        return oceanDataService.findAxes();
    }
}
