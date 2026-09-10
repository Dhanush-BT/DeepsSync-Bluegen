package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.model.ArgoFloat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArgoFloatRepository extends JpaRepository<ArgoFloatEntity, Long> {

    Optional<ArgoFloatEntity> findByPlatformId(String platformId);

    @Query("""
            select new com.bluegen.deepsyncapp.model.ArgoFloat(
                f.platformId, f.instrumentType, f.latitude, f.longitude,
                count(distinct s.id), count(distinct p.id),
                min(s.timestamp), max(s.timestamp))
            from ArgoFloatEntity f
            left join f.profileSamples s
            left join f.positions p
            where (:instrumentType is null or f.instrumentType = :instrumentType)
            group by f.id, f.platformId, f.instrumentType, f.latitude, f.longitude
            order by f.platformId asc
            """)
    List<ArgoFloat> findProjectedFloats(@Param("instrumentType") String instrumentType);

    @Query("""
            select new com.bluegen.deepsyncapp.model.ArgoFloat(
                f.platformId, f.instrumentType, f.latitude, f.longitude,
                count(distinct s.id), count(distinct p.id),
                min(s.timestamp), max(s.timestamp))
            from ArgoFloatEntity f
            left join f.profileSamples s
            left join f.positions p
            where f.platformId = :platformId
            group by f.id, f.platformId, f.instrumentType, f.latitude, f.longitude
            """)
    Optional<ArgoFloat> findProjectedFloat(@Param("platformId") String platformId);

    @Query("select f.instrumentType, count(f) from ArgoFloatEntity f group by f.instrumentType")
    List<Object[]> countByInstrumentType();
}
