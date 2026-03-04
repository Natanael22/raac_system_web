import { create } from 'zustand'

export type Theme = 'light' | 'dark'

export interface Notification {
    id: string
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
}

interface UiState {
    sidebarOpen: boolean
    theme: Theme
    activeNotifications: Notification[]
    toggleSidebar: () => void
    setTheme: (theme: Theme) => void
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
    sidebarOpen: true,
    theme: 'light',
    activeNotifications: [],
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setTheme: (theme) => {
        set({ theme })
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    },
    addNotification: (notification) => set((state) => ({
        activeNotifications: [...state.activeNotifications, { ...notification, id: crypto.randomUUID() }]
    })),
    removeNotification: (id) => set((state) => ({
        activeNotifications: state.activeNotifications.filter(n => n.id !== id)
    })),
}))
