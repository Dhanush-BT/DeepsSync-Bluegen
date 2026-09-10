package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.HazardType;
import com.bluegen.deepsyncapp.entity.HazardAdvisoryEntity.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HazardAdvisoryRepository extends JpaRepository<HazardAdvisoryEntity, Long> {

    @Query("""
            select h from HazardAdvisoryEntity h
            where (cast(:type as String) is null or h.type = :type)
              and (cast(:severity as String) is null or h.severity = :severity)
            order by h.issuedAt desc
            """)
    List<HazardAdvisoryEntity> findFiltered(@Param("type") HazardType type,
                                            @Param("severity") Severity severity);
}
