package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FloatPositionRepository extends JpaRepository<FloatPositionEntity, Long> {

    List<FloatPositionEntity> findByArgoFloatIdOrderByTimestampAsc(Long argoFloatId);

    @Query("""
            select p from FloatPositionEntity p
            where p.argoFloat.platformId = :platformId
            order by p.timestamp asc
            """)
    List<FloatPositionEntity> findByPlatformIdOrderByTimestampAsc(@Param("platformId") String platformId);
}
