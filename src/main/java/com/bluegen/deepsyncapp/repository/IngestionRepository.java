package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.IngestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface IngestionRepository extends JpaRepository<IngestionEntity, Long> {
  List<IngestionEntity> findAllByOrderByUploadedAtDesc();

  @Query("SELECT i FROM IngestionEntity i WHERE i.status = ?1 ORDER BY i.uploadedAt DESC")
  List<IngestionEntity> findByStatus(String status);
}
