import { api } from '@/lib/axios'
import type { AuthorizationRequestDto } from '@/types/api'

export const authorizationService = {
    request: async (data: AuthorizationRequestDto): Promise<Record<string, unknown>> => {
        const response = await api.post<Record<string, unknown>>('/api/v1/authorizations', data)
        return response.data
    },

    getStatus: async (id: string): Promise<Record<string, string>> => {
        const response = await api.get<Record<string, string>>(`/api/v1/authorizations/${id}/status`)
        return response.data
    },
}
