import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'atendente' | 'medico'
}

interface AuthState {
    user: User | null
    token: string | null
    refreshToken: string | null
    tenant: string | null
    permissions: string[]
    login: (user: User, token: string, tenant: string, permissions: string[], refreshToken?: string) => void
    logout: () => void
    setToken: (token: string) => void
    hasPermission: (action: string) => boolean
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            tenant: null,
            permissions: [],
            login: (user, token, tenant, permissions, refreshToken) =>
                set({ user, token, tenant, permissions, refreshToken: refreshToken ?? null }),
            logout: () =>
                set({ user: null, token: null, refreshToken: null, tenant: null, permissions: [] }),
            setToken: (token) =>
                set({ token }),
            hasPermission: (action) =>
                get().permissions.includes(action),
        }),
        {
            name: 'raac-auth', // chave no localStorage
            storage: createJSONStorage(() => localStorage),
            // Persiste apenas os dados — nunca as funções
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                tenant: state.tenant,
                permissions: state.permissions,
            }),
        }
    )
)
