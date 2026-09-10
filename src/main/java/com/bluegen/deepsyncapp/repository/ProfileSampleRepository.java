package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

/**
 * Read-only repository for profile samples by float. Writes are cascade-managed
 * by {@link com.bluegen.deepsyncapp.entity.ArgoFloatEntity} only.
 */
public interface ProfileSampleRepository extends JpaRepository<ProfileSampleEntity, Long> {

    @Query("""
            select s from ProfileSampleEntity s
            where s.argoFloat.platformId = :platformId
              and (:timestamp is null or s.timestamp = :timestamp)
            order by s.timestamp asc, s.depthMeters asc
            """)
    List<ProfileSampleEntity> findByPlatformId(@Param("platformId") String platformId,
                                               @Param("timestamp") Instant timestamp);
}
