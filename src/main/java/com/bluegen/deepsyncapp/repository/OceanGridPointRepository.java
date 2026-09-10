package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import com.bluegen.deepsyncapp.model.GridExtent;
import com.bluegen.deepsyncapp.model.VariableStatsRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface OceanGridPointRepository extends JpaRepository<OceanGridPointEntity, Long> {

    /**
     * Every parameter is optional; a null means "unbounded on this axis". Shared verbatim
     * by the ocean-data endpoint and the variable-statistics endpoint so both agree on
     * what a filter means.
     *
     * <p>The null checks are cast explicitly: PostgreSQL cannot infer the type of a bare
     * parameter appearing only in an {@code is null} test, and fails the whole statement
     * with "could not determine data type of parameter".
     */
    @Query("""
            select p from OceanGridPointEntity p
            where (cast(:minLat as Double) is null or p.latitude >= :minLat)
              and (cast(:maxLat as Double) is null or p.latitude <= :maxLat)
              and (cast(:minLon as Double) is null or p.longitude >= :minLon)
              and (cast(:maxLon as Double) is null or p.longitude <= :maxLon)
              and (cast(:depthMeters as Double) is null or p.depthMeters = :depthMeters)
              and (cast(:timestamp as Instant) is null or p.timestamp = :timestamp)
            order by p.depthMeters asc, p.latitude asc, p.longitude asc
            """)
    List<OceanGridPointEntity> findFiltered(@Param("minLat") Double minLat,
                                            @Param("maxLat") Double maxLat,
                                            @Param("minLon") Double minLon,
                                            @Param("maxLon") Double maxLon,
                                            @Param("depthMeters") Double depthMeters,
                                            @Param("timestamp") Instant timestamp);

    @Query("select distinct p.depthMeters from OceanGridPointEntity p order by p.depthMeters asc")
    List<Double> findDistinctDepths();

    @Query("select distinct p.timestamp from OceanGridPointEntity p order by p.timestamp asc")
    List<Instant> findDistinctTimestamps();

    @Query("""
            select new com.bluegen.deepsyncapp.model.GridExtent(
                count(p),
                min(p.depthMeters), max(p.depthMeters),
                min(p.latitude), max(p.latitude),
                min(p.longitude), max(p.longitude),
                min(p.timestamp), max(p.timestamp))
            from OceanGridPointEntity p
            """)
    GridExtent findGridExtent();

    /**
     * The {@code where} clause is deliberately identical to {@link #findFiltered} — the two
     * must agree on what a filter means. Change one, change both.
     */
    @Query("""
            select new com.bluegen.deepsyncapp.model.VariableStatsRow(
                min(p.temperatureC), max(p.temperatureC), avg(p.temperatureC), count(p.temperatureC),
                min(p.salinityPsu), max(p.salinityPsu), avg(p.salinityPsu), count(p.salinityPsu),
                min(p.chlorophyll), max(p.chlorophyll), avg(p.chlorophyll), count(p.chlorophyll))
            from OceanGridPointEntity p
            where (cast(:minLat as Double) is null or p.latitude >= :minLat)
              and (cast(:maxLat as Double) is null or p.latitude <= :maxLat)
              and (cast(:minLon as Double) is null or p.longitude >= :minLon)
              and (cast(:maxLon as Double) is null or p.longitude <= :maxLon)
              and (cast(:depthMeters as Double) is null or p.depthMeters = :depthMeters)
              and (cast(:timestamp as Instant) is null or p.timestamp = :timestamp)
            """)
    VariableStatsRow findVariableStats(@Param("minLat") Double minLat,
                                       @Param("maxLat") Double maxLat,
                                       @Param("minLon") Double minLon,
                                       @Param("maxLon") Double maxLon,
                                       @Param("depthMeters") Double depthMeters,
                                       @Param("timestamp") Instant timestamp);
}
