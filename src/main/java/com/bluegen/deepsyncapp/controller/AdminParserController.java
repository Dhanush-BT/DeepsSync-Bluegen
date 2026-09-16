package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.ingestion.OceanDataParser;
import com.bluegen.deepsyncapp.ingestion.registry.ParserRegistry;
import com.bluegen.deepsyncapp.ingestion.validation.CfConventionValidator;
import com.bluegen.deepsyncapp.entity.IngestionEntity;
import com.bluegen.deepsyncapp.entity.OceanGridPointEntity;
import com.bluegen.deepsyncapp.entity.ArgoFloatEntity;
import com.bluegen.deepsyncapp.entity.ProfileSampleEntity;
import com.bluegen.deepsyncapp.entity.FloatPositionEntity;
import com.bluegen.deepsyncapp.repository.IngestionRepository;
import com.bluegen.deepsyncapp.repository.OceanGridPointRepository;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Admin-only endpoints for data ingestion.
 * Requires admin authentication (Phase 6 - Auth).
 */
@RestController
@RequestMapping("/api/admin")
public class AdminParserController {

  private final ParserRegistry parserRegistry;
  private final CfConventionValidator cfValidator;
  private final IngestionRepository ingestionRepository;
  private final OceanGridPointRepository oceanGridPointRepository;
  private final ArgoFloatRepository argoFloatRepository;
  private final Path uploadDir = Paths.get(System.getProperty("java.io.tmpdir"), "deepsync-uploads");

  public AdminParserController(
    ParserRegistry parserRegistry,
    CfConventionValidator cfValidator,
    IngestionRepository ingestionRepository,
    OceanGridPointRepository oceanGridPointRepository,
    ArgoFloatRepository argoFloatRepository
  ) {
    this.parserRegistry = parserRegistry;
    this.cfValidator = cfValidator;
    this.ingestionRepository = ingestionRepository;
    this.oceanGridPointRepository = oceanGridPointRepository;
    this.argoFloatRepository = argoFloatRepository;
    try {
      Files.createDirectories(uploadDir);
    } catch (Exception e) {
      throw new RuntimeException("Failed to create upload directory", e);
    }
  }

  /**
   * Upload a file and ingest its data.
   * Supports CSV, NetCDF, and ASCII files.
   */
  @PostMapping("/ingest")
  public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
    Map<String, Object> response = new HashMap<>();

    if (file.isEmpty()) {
      response.put("error", "File is empty");
      return ResponseEntity.badRequest().body(response);
    }

    String fileName = file.getOriginalFilename();
    String fileExt = getFileExtension(fileName);
    OceanDataParser parser = parserRegistry.getParserForExtension(fileExt);

    if (parser == null) {
      response.put("error", "No parser found for file type: " + fileExt);
      return ResponseEntity.badRequest().body(response);
    }

    // Create ingestion record
    IngestionEntity ingestion = new IngestionEntity();
    ingestion.setFileName(fileName);
    ingestion.setParserName(parser.getName());
    ingestion.setStatus("PENDING");
    ingestion.setUploadedAt(Instant.now());
    ingestion = ingestionRepository.save(ingestion);

    try {
      // Save uploaded file temporarily
      String tempFileName = UUID.randomUUID() + "-" + fileName;
      Path filePath = uploadDir.resolve(tempFileName);
      Files.write(filePath, file.getBytes());
      File uploadedFile = filePath.toFile();

      // Validate NetCDF files
      if (fileExt.equals(".nc") && !cfValidator.validate(uploadedFile).isValid) {
        ingestion.setStatus("FAILED");
        ingestion.setErrorMessage("File failed CF Convention validation");
        ingestion.setCompletedAt(Instant.now());
        ingestionRepository.save(ingestion);
        response.put("error", "NetCDF file failed CF Convention validation");
        return ResponseEntity.badRequest().body(response);
      }

      // Parse grid data
      List<OceanGridPointEntity> gridPoints = parser.parseOceanGridData(uploadedFile);
      if (gridPoints != null && !gridPoints.isEmpty()) {
        oceanGridPointRepository.saveAll(gridPoints);
      }

      // Parse float data
      ArgoFloatEntity floatData = parser.parseFloatData(uploadedFile);
      if (floatData != null) {
        Optional<ArgoFloatEntity> existing = argoFloatRepository.findByPlatformId(floatData.getPlatformId());
        if (existing.isPresent()) {
          ArgoFloatEntity cur = existing.get();
          cur.setLatitude(floatData.getLatitude());
          cur.setLongitude(floatData.getLongitude());
          cur.setInstrumentType(floatData.getInstrumentType());
          cur.setDataSource(floatData.getDataSource());
          cur.setDatasetPath(floatData.getDatasetPath());
          
          // Clear and replace child profiles and positions
          if (floatData.getProfileSamples() != null) {
            cur.getProfileSamples().clear();
            for (ProfileSampleEntity sample : floatData.getProfileSamples()) {
              sample.setArgoFloat(cur);
              cur.getProfileSamples().add(sample);
            }
          }
          if (floatData.getPositions() != null) {
            cur.getPositions().clear();
            for (FloatPositionEntity pos : floatData.getPositions()) {
              pos.setArgoFloat(cur);
              cur.getPositions().add(pos);
            }
          }
          argoFloatRepository.save(cur);
        } else {
          argoFloatRepository.save(floatData);
        }
      }

      // Mark ingestion as success
      ingestion.setStatus("SUCCESS");
      ingestion.setGridPointsIngested(gridPoints != null ? gridPoints.size() : 0);
      ingestion.setFloatsIngested(floatData != null ? 1 : 0);
      ingestion.setCompletedAt(Instant.now());
      ingestion = ingestionRepository.save(ingestion);

      // Clean up temp file
      Files.deleteIfExists(filePath);

      response.put("ingestionId", ingestion.getId());
      response.put("parserName", parser.getName());
      response.put("gridPointsIngested", gridPoints != null ? gridPoints.size() : 0);
      response.put("floatsIngested", floatData != null ? 1 : 0);
      response.put("status", "SUCCESS");

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      ingestion.setStatus("FAILED");
      ingestion.setErrorMessage(e.getMessage());
      ingestion.setCompletedAt(Instant.now());
      ingestionRepository.save(ingestion);

      response.put("error", "Ingestion failed: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
  }

  /**
   * List all available parsers.
   */
  @GetMapping("/parsers")
  public ResponseEntity<List<ParserRegistry.ParserInfo>> listParsers() {
    return ResponseEntity.ok(parserRegistry.getParserInfo());
  }

  /**
   * List all ingestion records.
   */
  @GetMapping("/ingestions")
  public ResponseEntity<List<IngestionEntity>> listIngestions() {
    return ResponseEntity.ok(ingestionRepository.findAllByOrderByUploadedAtDesc());
  }

  /**
   * Get ingestion details.
   */
  @GetMapping("/ingestions/{id}")
  public ResponseEntity<?> getIngestion(@PathVariable Long id) {
    return ingestionRepository.findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  private String getFileExtension(String fileName) {
    if (fileName == null || !fileName.contains(".")) {
      return "";
    }
    return "." + fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
  }
}
