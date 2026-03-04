// =====================================================
// Tipos gerados a partir do OpenAPI spec (v3.1.0)
// Servidor: http://localhost:8080
// =====================================================

// --- Enums ---

export type Sex = 'MALE' | 'FEMALE' | 'OTHER'
export type AppointmentType = 'CONSULTA' | 'EXAME' | 'RETORNO' | 'PROCEDIMENTO'
export type AppointmentStatus = 'AGENDADO' | 'CONFIRMADO' | 'EM_ESPERA' | 'EM_ATENDIMENTO' | 'FINALIZADO' | 'CANCELADO' | 'AUSENTE'
export type AppointmentOrigin = 'TELEFONE' | 'WHATSAPP' | 'PRESENCIAL' | 'ONLINE'
export type AuthorizationStatus = 'PENDENTE' | 'APROVADO' | 'NEGADO' | 'CANCELADO'
export type GuideType = 'CONSULTA' | 'SP_SADT' | 'HONORARIO'
export type GuideStatus = 'CRIADA' | 'ENVIADA' | 'PAGA' | 'GLOSADA' | 'CANCELADA'
export type BatchStatus = 'CRIADO' | 'ENVIADO' | 'PROCESSADO' | 'REJEITADO'
export type InsuranceEnvironment = 'DEV' | 'HML' | 'PROD'
export type UserRole = 'ADMIN' | 'MEDICO' | 'ATENDENTE' | 'FATURAMENTO' | 'PACIENTE'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

// --- Pagination ---

export interface Pageable {
    page?: number
    size?: number
    sort?: string[]
}

export interface Page<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
    numberOfElements: number
    empty: boolean
}

// --- Auth ---

export interface LoginRequest {
    email: string
    password: string
    tenantId?: string
}

export interface UserDto {
    id: string
    name: string
    email: string
    role: string
    tenantId: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: UserDto
}

// --- Patients ---

export interface PatientRequest {
    name: string
    cpf?: string
    cns?: string
    birthDate: string // ISO date "YYYY-MM-DD"
    sex: Sex
    phone?: string
    email?: string
    prontuarioNumber?: string
    addressStreet?: string
    addressNumber?: string
    addressCity?: string
    addressState?: string
}

export interface PatientResponse {
    id: string
    name: string
    cpf?: string
    prontuarioNumber?: string
    birthDate: string
    phone?: string
}

// --- Doctors ---

export interface DoctorRequest {
    name: string
    crm: string
    ufCrm: string
    specialty?: string
    baBankCode?: string
    baAgency?: string
    baAccount?: string
}

export interface DoctorResponse {
    id: string
    name: string
    crm: string
    specialty?: string
}

// --- Appointments ---

export interface AppointmentRequest {
    patientId: string
    doctorId: string
    insuranceId?: string
    type: AppointmentType
    startDt: string // ISO date-time
    endDt: string   // ISO date-time
    room?: string
    origin?: AppointmentOrigin
    notes?: string
}

export interface AppointmentResponse {
    id: string
    patientId: string
    patientName: string
    doctorId: string
    doctorName: string
    type: AppointmentType
    startDt: string
    endDt: string
    status: AppointmentStatus
    room?: string
}

// --- Medical Records ---

export interface MedicalRecordRequest {
    patientId: string
    doctorId: string
    diagnosisJson?: string
    notes?: string
}

export interface MedicalRecordResponse {
    id: string
    diagnosis?: string
    notes?: string
    doctorId: string
    doctorName: string
    patientId: string
    patientName: string
}

// --- Authorizations ---

export interface AuthorizationRequestDto {
    patientId: string
    doctorId: string
    insuranceConfigId: string
    procedureCode: string
    cid?: string
}

// --- Insurance Configs ---

export interface InsuranceConfigRequest {
    operatorName: string
    operatorAnscode: string
    environment: InsuranceEnvironment
    webserviceUrl?: string
    credentials?: string
    certPassword?: string
}

export interface InsuranceConfigResponse {
    id: string
    operatorName: string
    operatorAnscode: string
    environment: InsuranceEnvironment
    webserviceUrl?: string
}

// --- Billing ---

export interface GuideRequest {
    appointmentId: string
    authRequestId?: string
    guideType: GuideType
    guideNumber?: string
    proceduresJson?: string
    totalValue?: number
}

export interface BatchRequest {
    insuranceConfigId: string
    month: number
    year: number
}

export interface ValidationResponse {
    valid: boolean
    errors: string[]
}

export interface BillingGuide {
    id: string
    guideType: GuideType
    guideNumber?: string
    procedures?: string
    totalValue?: number
    status: GuideStatus
}

export interface BillingBatch {
    id: string
    competenceMonth: number
    competenceYear: number
    totalValue?: number
    xmlBatch?: string
    status: BatchStatus
    submittedAt?: string
}
