import { api } from '@/lib/axios'


export interface PatientInsuranceRequest {
    operatorName: string
    cardNumber: string
    plan?: string
    validity?: string // ISO date
    accommodation?: string
    status: 'ACTIVE' | 'INACTIVE'
}

export interface PatientInsuranceResponse {
    id: string
    operatorName: string
    cardNumber: string
    plan?: string
    validity?: string
    accommodation?: string
    status: 'ACTIVE' | 'INACTIVE'
}

export const patientInsuranceService = {
    list: async (patientId: string): Promise<PatientInsuranceResponse[]> => {
        // endpoint: GET /api/v1/patients/{patientId}/insurances
        // A API retorna resposta paginada: { content: [...], totalElements, ... }
        const response = await api.get(`/api/v1/patients/${patientId}/insurances`)
        const data = response.data
        if (!data) return []
        // Suporte tanto a resposta paginada ({ content: [...] }) quanto a array direta
        if (Array.isArray(data)) return data
        if (data.content && Array.isArray(data.content)) return data.content

        return [data]
    },

    create: async (patientId: string, data: PatientInsuranceRequest): Promise<PatientInsuranceResponse> => {
        const response = await api.post<PatientInsuranceResponse>(`/api/v1/patients/${patientId}/insurances`, data)
        return response.data
    },

    update: async (patientId: string, id: string, data: PatientInsuranceRequest): Promise<PatientInsuranceResponse> => {
        const response = await api.put<PatientInsuranceResponse>(`/api/v1/patients/${patientId}/insurances/${id}`, data)
        return response.data
    },
}
