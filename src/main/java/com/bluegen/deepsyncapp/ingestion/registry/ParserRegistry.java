package com.bluegen.deepsyncapp.ingestion.registry;

import com.bluegen.deepsyncapp.ingestion.OceanDataParser;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * Auto-collects all OceanDataParser implementations registered as Spring components.
 * New parsers are discovered automatically—no branching logic needed elsewhere.
 */
@Component
public class ParserRegistry {
  private final List<OceanDataParser> parsers;
  private final Map<String, OceanDataParser> parsersByExtension;

  public ParserRegistry(List<OceanDataParser> parsers) {
    this.parsers = parsers;
    this.parsersByExtension = new HashMap<>();
    for (OceanDataParser parser : parsers) {
      for (String ext : parser.getSupportedExtensions()) {
        parsersByExtension.put(ext.toLowerCase(), parser);
      }
    }
  }

  /**
   * Get all registered parsers.
   */
  public List<OceanDataParser> getAllParsers() {
    return parsers;
  }

  /**
   * Get parser metadata for UI display.
   */
  public List<ParserInfo> getParserInfo() {
    return parsers.stream()
      .map(p -> new ParserInfo(p.getName(), p.getSupportedExtensions()))
      .collect(Collectors.toList());
  }

  /**
   * Find the appropriate parser for a file extension.
   */
  public OceanDataParser getParserForExtension(String extension) {
    String normalized = extension.toLowerCase();
    if (!normalized.startsWith(".")) {
      normalized = "." + normalized;
    }
    return parsersByExtension.get(normalized);
  }

  /**
   * DTO for parser metadata sent to frontend.
   */
  public static class ParserInfo {
    public final String name;
    public final List<String> supportedExtensions;

    public ParserInfo(String name, List<String> supportedExtensions) {
      this.name = name;
      this.supportedExtensions = supportedExtensions;
    }
  }
}
