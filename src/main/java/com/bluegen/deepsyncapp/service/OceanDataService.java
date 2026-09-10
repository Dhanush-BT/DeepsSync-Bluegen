package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.OceanGridPoint;
import com.bluegen.deepsyncapp.repository.OceanGridPointRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OceanDataService {

    private final OceanGridPointRepository repository;

    public OceanDataService(OceanGridPointRepository repository) {
        this.repository = repository;
    }

    public List<OceanGridPoint> findPoints(OceanDataFilter filter) {
        return repository.findFiltered(
                        filter.minLat(), filter.maxLat(),
                        filter.minLon(), filter.maxLon(),
                        filter.depthMeters(), filter.timestamp())
                .stream()
                .map(OceanGridPoint::from)
                .toList();
    }
}
