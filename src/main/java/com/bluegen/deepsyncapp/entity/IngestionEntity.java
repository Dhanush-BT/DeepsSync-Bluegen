package com.bluegen.deepsyncapp.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ingestion")
public class IngestionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String fileName;

  @Column(nullable = false)
  private String parserName;

  @Column(nullable = false)
  private String status; // PENDING, SUCCESS, FAILED

  @Column(name = "grid_points_ingested")
  private Integer gridPointsIngested;

  @Column(name = "floats_ingested")
  private Integer floatsIngested;

  @Column(columnDefinition = "TEXT")
  private String errorMessage;

  @Column(nullable = false)
  private Instant uploadedAt;

  @Column(name = "completed_at")
  private Instant completedAt;

  // Getters and Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getFileName() {
    return fileName;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public String getParserName() {
    return parserName;
  }

  public void setParserName(String parserName) {
    this.parserName = parserName;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Integer getGridPointsIngested() {
    return gridPointsIngested;
  }

  public void setGridPointsIngested(Integer gridPointsIngested) {
    this.gridPointsIngested = gridPointsIngested;
  }

  public Integer getFloatsIngested() {
    return floatsIngested;
  }

  public void setFloatsIngested(Integer floatsIngested) {
    this.floatsIngested = floatsIngested;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public void setErrorMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

  public Instant getUploadedAt() {
    return uploadedAt;
  }

  public void setUploadedAt(Instant uploadedAt) {
    this.uploadedAt = uploadedAt;
  }

  public Instant getCompletedAt() {
    return completedAt;
  }

  public void setCompletedAt(Instant completedAt) {
    this.completedAt = completedAt;
  }
}
