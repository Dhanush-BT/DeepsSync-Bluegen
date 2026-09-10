package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.model.FloatPosition;
import com.bluegen.deepsyncapp.model.ProfileSample;
import com.bluegen.deepsyncapp.service.ArgoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/floats")
public class ArgoController {

    private final ArgoService argoService;

    public ArgoController(ArgoService argoService) {
        this.argoService = argoService;
    }

    @GetMapping
    public List<ArgoFloat> floats(@RequestParam(required = false) String instrumentType) {
        return argoService.findFloats(instrumentType);
    }

    @GetMapping("/{platformId}")
    public ArgoFloat floatByPlatformId(@PathVariable String platformId) {
        return argoService.findFloat(platformId);
    }

    @GetMapping("/{platformId}/profiles")
    public List<ProfileSample> profiles(
            @PathVariable String platformId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant timestamp) {
        return argoService.findProfiles(platformId, timestamp);
    }

    @GetMapping("/{platformId}/track")
    public List<FloatPosition> track(@PathVariable String platformId) {
        return argoService.findTrack(platformId);
    }
}
