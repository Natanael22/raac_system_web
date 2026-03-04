import { api } from '@/lib/axios'
import type { InsuranceConfigRequest, InsuranceConfigResponse, Pageable, Page } from '@/types/api'

export const insuranceConfigService = {
    list: async (pageable?: Pageable): Promise<Page<InsuranceConfigResponse>> => {
        const params = {
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 20,
        }
        const response = await api.get<Page<InsuranceConfigResponse>>('/api/v1/insurance-configs', { params })
        return response.data
    },

    get: async (id: string): Promise<InsuranceConfigResponse> => {
        const response = await api.get<InsuranceConfigResponse>(`/api/v1/insurance-configs/${id}`)
        return response.data
    },

    create: async (data: InsuranceConfigRequest): Promise<InsuranceConfigResponse> => {
        const response = await api.post<InsuranceConfigResponse>('/api/v1/insurance-configs', data)
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/insurance-configs/${id}`)
    },
}
