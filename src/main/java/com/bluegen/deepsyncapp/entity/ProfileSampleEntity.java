package com.bluegen.deepsyncapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Depth-resolved reading for an {@link ArgoFloatEntity}, accessed only via that
 * entity's cascade (no standalone repository).
 */
@Entity
@Table(name = "profile_sample")
public class ProfileSampleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "argo_float_id", nullable = false)
    private ArgoFloatEntity argoFloat;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "depth_meters", nullable = false)
    private Double depthMeters;

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

    public ArgoFloatEntity getArgoFloat() {
        return argoFloat;
    }

    public void setArgoFloat(ArgoFloatEntity argoFloat) {
        this.argoFloat = argoFloat;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Double getDepthMeters() {
        return depthMeters;
    }

    public void setDepthMeters(Double depthMeters) {
        this.depthMeters = depthMeters;
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
