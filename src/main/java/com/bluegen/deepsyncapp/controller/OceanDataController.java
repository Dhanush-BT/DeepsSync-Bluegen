package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.OceanDataAxes;
import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.OceanGridPoint;
import com.bluegen.deepsyncapp.service.OceanDataService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ocean-data")
public class OceanDataController {

    private final OceanDataService oceanDataService;

    public OceanDataController(OceanDataService oceanDataService) {
        this.oceanDataService = oceanDataService;
    }

    @GetMapping
    public List<OceanGridPoint> gridPoints(@Valid @ModelAttribute OceanDataFilter filter) {
        return oceanDataService.findPoints(filter);
    }

    @GetMapping("/axes")
    public OceanDataAxes axes() {
        return oceanDataService.findAxes();
    }
}
