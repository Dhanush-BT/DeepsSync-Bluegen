package com.bluegen.deepsyncapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "ocean_grid_point")
public class OceanGridPointEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "depth_meters", nullable = false)
    private Double depthMeters;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "temperature_c")
    private Double temperatureC;

    @Column(name = "salinity_psu")
    private Double salinityPsu;

    @Column(name = "current_u")
    private Double currentU;

    @Column(name = "current_v")
    private Double currentV;

    @Column(name = "chlorophyll")
    private Double chlorophyll;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getDepthMeters() {
        return depthMeters;
    }

    public void setDepthMeters(Double depthMeters) {
        this.depthMeters = depthMeters;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Double getTemperatureC() {
        return temperatureC;
    }

    public void setTemperatureC(Double temperatureC) {
        this.temperatureC = temperatureC;
    }

    public Double getSalinityPsu() {
        return salinityPsu;
    }

    public void setSalinityPsu(Double salinityPsu) {
        this.salinityPsu = salinityPsu;
    }

    public Double getCurrentU() {
        return currentU;
    }

    public void setCurrentU(Double currentU) {
        this.currentU = currentU;
    }

    public Double getCurrentV() {
        return currentV;
    }

    public void setCurrentV(Double currentV) {
        this.currentV = currentV;
    }

    public Double getChlorophyll() {
        return chlorophyll;
    }

    public void setChlorophyll(Double chlorophyll) {
        this.chlorophyll = chlorophyll;
    }
}
