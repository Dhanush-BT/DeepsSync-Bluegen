package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.service.ArgoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
}
