package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArgoService {

    private final ArgoFloatRepository argoFloatRepository;

    public ArgoService(ArgoFloatRepository argoFloatRepository) {
        this.argoFloatRepository = argoFloatRepository;
    }

    public List<ArgoFloat> findFloats(String instrumentType) {
        return argoFloatRepository.findProjectedFloats(instrumentType);
    }

    public ArgoFloat findFloat(String platformId) {
        return argoFloatRepository.findProjectedFloat(platformId)
                .orElseThrow(() -> new NotFoundException("No float with platformId " + platformId));
    }
}
