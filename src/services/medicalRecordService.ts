import { api } from '@/lib/axios'
import type { MedicalRecordRequest, MedicalRecordResponse, Pageable, Page } from '@/types/api'

export const medicalRecordService = {
    list: async (pageable?: Pageable): Promise<Page<MedicalRecordResponse>> => {
        const params = {
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 20,
        }
        const response = await api.get<Page<MedicalRecordResponse>>('/api/v1/medical-records', { params })
        return response.data
    },

    listByPatient: async (patientId: string, pageable?: Pageable): Promise<Page<MedicalRecordResponse>> => {
        const params = {
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 20,
        }
        const response = await api.get<Page<MedicalRecordResponse>>(`/api/v1/medical-records/patient/${patientId}`, { params })
        return response.data
    },

    get: async (id: string): Promise<MedicalRecordResponse> => {
        const response = await api.get<MedicalRecordResponse>(`/api/v1/medical-records/${id}`)
        return response.data
    },

    create: async (data: MedicalRecordRequest): Promise<MedicalRecordResponse> => {
        const response = await api.post<MedicalRecordResponse>('/api/v1/medical-records', data)
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/medical-records/${id}`)
    },
}
