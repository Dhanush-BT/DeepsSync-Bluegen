package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import com.bluegen.deepsyncapp.model.HazardAdvisory;
import com.bluegen.deepsyncapp.service.HazardAdvisoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hazards")
public class HazardAdvisoryController {

    private final HazardAdvisoryService hazardAdvisoryService;

    public HazardAdvisoryController(HazardAdvisoryService hazardAdvisoryService) {
        this.hazardAdvisoryService = hazardAdvisoryService;
    }

    @GetMapping
    public List<HazardAdvisory> advisories(@RequestParam(required = false) HazardType type,
                                           @RequestParam(required = false) Severity severity) {
        return hazardAdvisoryService.findAdvisories(type, severity);
    }
}
