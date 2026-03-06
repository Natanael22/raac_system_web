import { api } from '@/lib/axios'
import type { DoctorRequest, DoctorResponse, Pageable, Page } from '@/types/api'

export const doctorService = {
    list: async (pageable?: Pageable): Promise<Page<DoctorResponse>> => {
        const params = {
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 20,
        }
        const response = await api.get<Page<DoctorResponse>>('/api/v1/doctors', { params })
        return response.data
    },

    get: async (id: string): Promise<DoctorResponse> => {
        const response = await api.get<DoctorResponse>(`/api/v1/doctors/${id}`)
        return response.data
    },

    create: async (data: DoctorRequest): Promise<DoctorResponse> => {
        const response = await api.post<DoctorResponse>('/api/v1/doctors', data)
        return response.data
    },

    update: async (id: string, data: DoctorRequest): Promise<DoctorResponse> => {
        console.log(data)
        const response = await api.put<DoctorResponse>(`/api/v1/doctors/${id}`, data)
        console.log(response.data)
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/doctors/${id}`)
    },
}
