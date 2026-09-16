package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.model.OceanDataAxes;
import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.OceanGridPoint;
import com.bluegen.deepsyncapp.repository.OceanGridPointRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    public OceanDataAxes findAxes() {
        return new OceanDataAxes(repository.findDistinctDepths(), repository.findDistinctTimestamps());
    }

    public List<OceanGridPoint> findPointsByDatasets(OceanDataFilter filter, List<String> datasets) {
        // Return grid points whenever data is available or any dataset is selected
        return findPoints(filter);
    }
}
