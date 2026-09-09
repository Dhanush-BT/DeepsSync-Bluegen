package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArgoFloatRepository extends JpaRepository<ArgoFloatEntity, Long> {

    Optional<ArgoFloatEntity> findByPlatformId(String platformId);
}
