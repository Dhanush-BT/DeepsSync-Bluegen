package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.model.CorpusSummary;
import com.bluegen.deepsyncapp.model.DoubleRange;
import com.bluegen.deepsyncapp.model.GridExtent;
import com.bluegen.deepsyncapp.model.OceanDataFilter;
import com.bluegen.deepsyncapp.model.TimeRange;
import com.bluegen.deepsyncapp.model.VariableStatistics;
import com.bluegen.deepsyncapp.model.VariableStatsRow;
import com.bluegen.deepsyncapp.model.VariableSummary;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import com.bluegen.deepsyncapp.repository.HazardAdvisoryRepository;
import com.bluegen.deepsyncapp.repository.OceanGridPointRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class StatsService {

    private final OceanGridPointRepository gridRepository;
    private final ArgoFloatRepository argoFloatRepository;
    private final HazardAdvisoryRepository hazardAdvisoryRepository;

    public StatsService(OceanGridPointRepository gridRepository,
                        ArgoFloatRepository argoFloatRepository,
                        HazardAdvisoryRepository hazardAdvisoryRepository) {
        this.gridRepository = gridRepository;
        this.argoFloatRepository = argoFloatRepository;
        this.hazardAdvisoryRepository = hazardAdvisoryRepository;
    }

    public CorpusSummary summary() {
        GridExtent extent = gridRepository.findGridExtent();

        Map<String, Long> byType = new LinkedHashMap<>();
        for (Object[] row : argoFloatRepository.countByInstrumentType()) {
            byType.put((String) row[0], (Long) row[1]);
        }

        return new CorpusSummary(
                extent.count(),
                byType,
                new DoubleRange(extent.minDepth(), extent.maxDepth()),
                new DoubleRange(extent.minLat(), extent.maxLat()),
                new DoubleRange(extent.minLon(), extent.maxLon()),
                new TimeRange(extent.earliest(), extent.latest()),
                hazardAdvisoryRepository.count());
    }

    public VariableStatistics variables(OceanDataFilter filter) {
        VariableStatsRow row = gridRepository.findVariableStats(
                filter.minLat(), filter.maxLat(),
                filter.minLon(), filter.maxLon(),
                filter.depthMeters(), filter.timestamp());

        return new VariableStatistics(
                new VariableSummary(row.temperatureMin(), row.temperatureMax(),
                        row.temperatureMean(), row.temperatureCount()),
                new VariableSummary(row.salinityMin(), row.salinityMax(),
                        row.salinityMean(), row.salinityCount()),
                new VariableSummary(row.chlorophyllMin(), row.chlorophyllMax(),
                        row.chlorophyllMean(), row.chlorophyllCount()),
                filter);
    }
}
