import { api } from '@/lib/axios'
import type { LoginRequest, LoginResponse } from '@/types/api'

export const authService = {
    login: async (data: LoginRequest, tenantId?: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/api/v1/auth/login', data, {
            headers: tenantId ? { 'X-Tenant-ID': tenantId } : {}
        })
        return response.data
    },

    logout: async (): Promise<void> => {
        await api.post('/api/v1/auth/logout')
    },
}
