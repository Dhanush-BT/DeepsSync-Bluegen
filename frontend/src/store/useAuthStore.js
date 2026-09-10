import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token') || null,

  login: (userData, token) => {
    localStorage.setItem('token', token)
    set({ isAuthenticated: true, user: userData, token })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ isAuthenticated: false, user: null, token: null })
  },

  setUser: (user) => set({ user }),
}))
