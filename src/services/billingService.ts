import { api } from '@/lib/axios'
import type { GuideRequest, BillingGuide, BatchRequest, BillingBatch, ValidationResponse } from '@/types/api'

// Extend types for billing responses
export type { BillingGuide, BillingBatch }

export const billingService = {
    createGuide: async (data: GuideRequest): Promise<BillingGuide> => {
        const response = await api.post<BillingGuide>('/api/v1/billing/guides', data)
        return response.data
    },

    createFromAppointment: async (appointmentId: string): Promise<BillingGuide> => {
        const response = await api.post<BillingGuide>(`/api/v1/billing/guides/from-appointment/${appointmentId}`)
        return response.data
    },

    createBatch: async (data: BatchRequest): Promise<BillingBatch> => {
        const response = await api.post<BillingBatch>('/api/v1/billing/batches', data)
        return response.data
    },

    validateBatch: async (id: string): Promise<ValidationResponse> => {
        const response = await api.get<ValidationResponse>(`/api/v1/billing/batches/${id}/validate`)
        return response.data
    },

    submitBatch: async (id: string): Promise<void> => {
        await api.post(`/api/v1/billing/batches/${id}/submit`)
    },
}
