import { api } from '@/lib/axios'
import type { AppointmentRequest, AppointmentResponse, Pageable, Page } from '@/types/api'

export const appointmentService = {
    list: async (pageable?: Pageable): Promise<Page<AppointmentResponse>> => {
        const params = {
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 50,
        }
        const response = await api.get<Page<AppointmentResponse>>('/api/v1/appointments', { params })
        return response.data
    },

    create: async (data: AppointmentRequest): Promise<AppointmentResponse> => {
        const response = await api.post<AppointmentResponse>('/api/v1/appointments', data)
        return response.data
    },

    updateStatus: async (id: string, status: string): Promise<AppointmentResponse> => {
        const response = await api.patch<AppointmentResponse>(`/api/v1/appointments/${id}/status`, { status })
        return response.data
    },
}
