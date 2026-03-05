import { api } from '@/lib/axios'
import type { PatientRequest, PatientResponse, Pageable, Page } from '@/types/api'

export const patientService = {
    list: async (pageable?: Pageable): Promise<Page<PatientResponse>> => {
        const params = {
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 20,
            ...(pageable?.sort ? { sort: pageable.sort.join(',') } : {}),
        }
        const response = await api.get<Page<PatientResponse>>('/api/v1/patients', { params })
        return response.data
    },

    get: async (id: string): Promise<PatientResponse> => {
        const response = await api.get<PatientResponse>(`/api/v1/patients/${id}`)
        return response.data
    },

    create: async (data: PatientRequest): Promise<PatientResponse> => {
        const response = await api.post<PatientResponse>('/api/v1/patients', data)
        return response.data
    },

    updateStatus: async (id: string, active: boolean): Promise<PatientResponse> => {
        // Assume sending active status
        const response = await api.patch<PatientResponse>(`/api/v1/patients/${id}/status`, { active })
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/patients/${id}`)
    },
}
