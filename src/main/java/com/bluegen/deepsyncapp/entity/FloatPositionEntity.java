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
 * Position fix for an {@link ArgoFloatEntity} over time — backs trajectory
 * rendering (Dashboard) and path plotting (Geo Map). Never fake a path from a
 * single lat/lon; seed multiple fixes per float.
 */
@Entity
@Table(name = "float_position")
public class FloatPositionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "argo_float_id", nullable = false)
    private ArgoFloatEntity argoFloat;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

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
}
