import { create } from 'zustand'

const savedToken = localStorage.getItem('token') || null
const savedUser = (() => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
})()

export const useAuthStore = create((set) => ({
  isAuthenticated: !!savedToken,
  user: savedUser,
  token: savedToken,

  login: (userData, token) => {
    localStorage.setItem('token', token)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
    set({ isAuthenticated: true, user: userData, token })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ isAuthenticated: false, user: null, token: null })
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ user })
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token)
      set({ token, isAuthenticated: true })
    } else {
      localStorage.removeItem('token')
      set({ token: null, isAuthenticated: false })
    }
  },
}))
