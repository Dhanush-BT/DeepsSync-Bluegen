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
  selectedChartType: 'profile',
  setSelectedFloat: (floatId) => set({ selectedFloat: floatId }),
  setSelectedChartType: (type) => set({ selectedChartType: type }),

  // 3D Dashboard visualization controls
  selectedVariable: 'temperatureC',
  setSelectedVariable: (variable) => set({ selectedVariable: variable }),

  colorbarAuto: true,
  colorbarMin: null,
  colorbarMax: null,
  setColorbarAuto: (auto) => set({ colorbarAuto: auto }),
  setColorbarRange: (min, max) => set({ colorbarMin: min, colorbarMax: max }),

  verticalExaggeration: 1,
  setVerticalExaggeration: (scale) => set({ verticalExaggeration: scale }),

  volumeOpacity: 0.85,
  setVolumeOpacity: (opacity) => set({ volumeOpacity: opacity }),

  // Data loading states
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
