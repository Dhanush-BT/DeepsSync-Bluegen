import { create } from 'zustand'

export const useAppStore = create((set) => ({
  // Ocean data filter
  filter: {
    minDepth: null,
    maxDepth: null,
    minLat: null,
    maxLat: null,
    minLon: null,
    maxLon: null,
    timestamp: null,
  },

  setFilter: (newFilter) => set((state) => ({
    filter: { ...state.filter, ...newFilter },
  })),

  // Dashboard 3D state
  selectedPoint: null,
  setSelectedPoint: (point) => set({ selectedPoint: point }),

  // Dashboard 2D state
  selectedFloat: null,
  selectedFile: null,
  activeFileProfiles: [],
  selectedChartType: 'profile',
  setSelectedFloat: (floatId) => set({ selectedFloat: floatId }),
  setSelectedFile: (file) => set({ selectedFile: file }),
  setActiveFileProfiles: (profiles) => set({ activeFileProfiles: profiles }),
  setSelectedChartType: (type) => set({ selectedChartType: type }),

  // Dataset selection
  selectedDatasets: ['argo', 'bgc', 'glider', 'ctd'],
  setSelectedDatasets: (datasets) => set({ selectedDatasets: datasets }),

  // 3D Dashboard visualization controls
  selectedVariable: 'temperatureC',
  setSelectedVariable: (variable) => set({ selectedVariable: variable }),

  colormapPalette: 'turbo', // 'turbo' | 'viridis' | 'spectral' | 'deepsea'
  setColormapPalette: (palette) => set({ colormapPalette: palette }),

  visualizationStyle: 'triangles', // 'triangles' (triangular mesh) | 'cubes' (cubic voxels) | 'points' (particle dots)
  setVisualizationStyle: (style) => set({ visualizationStyle: style }),

  colorbarAuto: true,
  colorbarMin: null,
  colorbarMax: null,
  setColorbarAuto: (auto) => set({ colorbarAuto: auto }),
  setColorbarRange: (min, max) => set({ colorbarMin: min, colorbarMax: max }),

  verticalExaggeration: 1,
  setVerticalExaggeration: (scale) => set({ verticalExaggeration: scale }),

  volumeOpacity: 0.85,
  setVolumeOpacity: (opacity) => set({ volumeOpacity: opacity }),

  // Measurement sliders (longitude, latitude, depth)
  measurementLongitude: 85,
  measurementLatitude: 0,
  measurementDepth: 500,
  setMeasurementLongitude: (lon) => set({ measurementLongitude: lon }),
  setMeasurementLatitude: (lat) => set({ measurementLatitude: lat }),
  setMeasurementDepth: (depth) => set({ measurementDepth: depth }),

  // Data loading states
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
