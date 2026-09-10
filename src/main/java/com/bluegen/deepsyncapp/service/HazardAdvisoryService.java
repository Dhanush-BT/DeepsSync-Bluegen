package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import com.bluegen.deepsyncapp.model.HazardAdvisory;
import com.bluegen.deepsyncapp.repository.HazardAdvisoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HazardAdvisoryService {

    private final HazardAdvisoryRepository repository;

    public HazardAdvisoryService(HazardAdvisoryRepository repository) {
        this.repository = repository;
    }

    public List<HazardAdvisory> findAdvisories(HazardType type, Severity severity) {
        return repository.findFiltered(type, severity)
                .stream()
                .map(HazardAdvisory::from)
                .toList();
    }
}
