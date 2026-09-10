package com.bluegen.deepsyncapp.service;

import com.bluegen.deepsyncapp.model.ArgoFloat;
import com.bluegen.deepsyncapp.model.FloatPosition;
import com.bluegen.deepsyncapp.model.ProfileSample;
import com.bluegen.deepsyncapp.repository.ArgoFloatRepository;
import com.bluegen.deepsyncapp.repository.FloatPositionRepository;
import com.bluegen.deepsyncapp.repository.ProfileSampleRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ArgoService {

    private final ArgoFloatRepository argoFloatRepository;
    private final ProfileSampleRepository profileSampleRepository;
    private final FloatPositionRepository floatPositionRepository;

    public ArgoService(ArgoFloatRepository argoFloatRepository,
                      ProfileSampleRepository profileSampleRepository,
                      FloatPositionRepository floatPositionRepository) {
        this.argoFloatRepository = argoFloatRepository;
        this.profileSampleRepository = profileSampleRepository;
        this.floatPositionRepository = floatPositionRepository;
    }

    public List<ArgoFloat> findFloats(String instrumentType) {
        return argoFloatRepository.findProjectedFloats(instrumentType);
    }

    public ArgoFloat findFloat(String platformId) {
        return argoFloatRepository.findProjectedFloat(platformId)
                .orElseThrow(() -> new NotFoundException("No float with platformId " + platformId));
    }

    public List<ProfileSample> findProfiles(String platformId, Instant timestamp) {
        requireFloat(platformId);
        return profileSampleRepository.findByPlatformId(platformId, timestamp)
                .stream().map(ProfileSample::from).toList();
    }

    public List<FloatPosition> findTrack(String platformId) {
        requireFloat(platformId);
        return floatPositionRepository.findByPlatformIdOrderByTimestampAsc(platformId)
                .stream().map(FloatPosition::from).toList();
    }

    private void requireFloat(String platformId) {
        if (argoFloatRepository.findByPlatformId(platformId).isEmpty()) {
            throw new NotFoundException("No float with platformId " + platformId);
        }
    }
}
