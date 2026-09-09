package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FloatPositionRepository extends JpaRepository<FloatPositionEntity, Long> {

    List<FloatPositionEntity> findByArgoFloatIdOrderByTimestampAsc(Long argoFloatId);
}
