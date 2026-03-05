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
        // endpoint listed in prompt: GET /api/v1/patients/{patientId}/insurances
        const response = await api.get<PatientInsuranceResponse[]>(`/api/v1/patients/${patientId}/insurances`)
        return response.data
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
