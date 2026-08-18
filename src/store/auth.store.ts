import create from 'zustand'

type State = {
  user: any | null
  setUser: (u: any | null) => void
}

export const useAuthStore = create<State>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}))
