package com.bluegen.deepsyncapp.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "argo_float")
public class ArgoFloatEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "platform_id", nullable = false, unique = true)
    private String platformId;

    @Column(name = "instrument_type", nullable = false)
    private String instrumentType;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @OneToMany(mappedBy = "argoFloat", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<ProfileSampleEntity> profileSamples = new ArrayList<>();

    @OneToMany(mappedBy = "argoFloat", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<FloatPositionEntity> positions = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlatformId() {
        return platformId;
    }

    public void setPlatformId(String platformId) {
        this.platformId = platformId;
    }

    public String getInstrumentType() {
        return instrumentType;
    }

    public void setInstrumentType(String instrumentType) {
        this.instrumentType = instrumentType;
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

    public List<ProfileSampleEntity> getProfileSamples() {
        return profileSamples;
    }

    public List<FloatPositionEntity> getPositions() {
        return positions;
    }

    public void setProfileSamples(List<ProfileSampleEntity> samples) {
    this.profileSamples = samples != null ? samples : new ArrayList<>();
    for (ProfileSampleEntity sample : this.profileSamples) {
      sample.setArgoFloat(this);
    }
  }

  public void setPositions(List<FloatPositionEntity> positions) {
    this.positions = positions != null ? positions : new ArrayList<>();
    for (FloatPositionEntity position : this.positions) {
      position.setArgoFloat(this);
    }
  }

  public void addProfileSample(ProfileSampleEntity sample) {
        sample.setArgoFloat(this);
        this.profileSamples.add(sample);
    }

    public void addPosition(FloatPositionEntity position) {
        position.setArgoFloat(this);
        this.positions.add(position);
    }
}
