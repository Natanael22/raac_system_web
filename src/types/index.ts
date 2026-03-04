import { type BillingGuide, type BillingBatch } from '@/services/billingService'
import type {
    Page, Pageable,
    PatientRequest, PatientResponse,
    DoctorRequest, DoctorResponse,
    AppointmentRequest, AppointmentResponse,
    MedicalRecordRequest, MedicalRecordResponse,
    AuthorizationRequestDto,
    InsuranceConfigRequest, InsuranceConfigResponse,
    GuideRequest, BatchRequest, ValidationResponse,
    LoginRequest, LoginResponse, UserDto,
    Sex, AppointmentType, AppointmentStatus, AppointmentOrigin,
    AuthorizationStatus, GuideType, GuideStatus, BatchStatus, InsuranceEnvironment, UserRole, UserStatus
} from './api'

export type {
    Page, Pageable,
    PatientRequest, PatientResponse,
    DoctorRequest, DoctorResponse,
    AppointmentRequest, AppointmentResponse,
    MedicalRecordRequest, MedicalRecordResponse,
    AuthorizationRequestDto,
    InsuranceConfigRequest, InsuranceConfigResponse,
    GuideRequest, BatchRequest, ValidationResponse, BillingGuide, BillingBatch,
    LoginRequest, LoginResponse, UserDto,
    Sex, AppointmentType, AppointmentStatus, AppointmentOrigin,
    AuthorizationStatus, GuideType, GuideStatus, BatchStatus, InsuranceEnvironment, UserRole, UserStatus
}
