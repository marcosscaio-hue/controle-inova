import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/lib/auth'

type AuthStore = {
  usuario: Usuario | null
  setUsuario: (u: Usuario | null) => void
  logout: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      setUsuario: (u) => set({ usuario: u }),
      logout: () => set({ usuario: null }),
    }),
    { name: 'controle-inova-auth' }
  )
)
