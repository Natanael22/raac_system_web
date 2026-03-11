import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientService } from '@/services/patientService'
import { patientInsuranceService } from '@/services/patientInsuranceService'
import { appointmentService } from '@/services/appointmentService'
import { billingService } from '@/services/billingService'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
    User, Stethoscope, ShieldCheck, CheckCircle2, XCircle,
    CreditCard, ChevronRight, ChevronLeft, Loader2,
    AlertCircle, Banknote
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { AppointmentResponse } from '@/types/api'

// ─── Step Indicator ─────────────────────────────────────────────────────────

const STEPS = [
    { label: 'Paciente', icon: User },
    { label: 'Procedimento', icon: Stethoscope },
    { label: 'Autorização', icon: ShieldCheck },
    { label: 'Confirmação', icon: CheckCircle2 },
]

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-between mb-6 px-1">
            {STEPS.map((step, idx) => {
                const isCompleted = idx < current
                const isActive = idx === current
                return (
                    <div key={step.label} className="flex flex-col items-center flex-1">
                        <div className="flex items-center w-full">
                            {/* Left line */}
                            {idx > 0 && (
                                <div className={cn(
                                    'flex-1 h-0.5 transition-colors',
                                    isCompleted || isActive ? 'bg-primary' : 'bg-border'
                                )} />
                            )}
                            {/* Circle */}
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0',
                                isCompleted && 'bg-primary border-primary text-white',
                                isActive && 'bg-white border-primary text-primary shadow-md',
                                !isCompleted && !isActive && 'bg-muted border-border text-muted-foreground'
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            {/* Right line */}
                            {idx < STEPS.length - 1 && (
                                <div className={cn(
                                    'flex-1 h-0.5 transition-colors',
                                    isCompleted ? 'bg-primary' : 'bg-border'
                                )} />
                            )}
                        </div>
                        <span className={cn(
                            'mt-1.5 text-xs font-medium',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                        )}>
                            {step.label}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Info Row ────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">{label}</p>
            <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface AttendanceWizardProps {
    appointment: AppointmentResponse | null
    onClose: () => void
}

export function AttendanceWizard({ appointment, onClose }: AttendanceWizardProps) {
    const queryClient = useQueryClient()
    const [step, setStep] = useState(0)
    const [authCode, setAuthCode] = useState('')
    const [authResult, setAuthResult] = useState<'APROVADO' | 'NEGADO' | ''>('')
    const [paymentMethod, setPaymentMethod] = useState('')

    const isInsurance = !!appointment?.insuranceId

    // ── Data fetching ──────────────────────────────────────────────────────────
    const { data: patient, isLoading: loadingPatient } = useQuery({
        queryKey: ['patient', appointment?.patientId],
        queryFn: () => patientService.get(appointment!.patientId),
        enabled: !!appointment?.patientId,
    })

    const { data: insurances } = useQuery({
        queryKey: ['patient-insurances', appointment?.patientId],
        queryFn: () => patientInsuranceService.list(appointment!.patientId),
        enabled: !!appointment?.patientId && isInsurance,
    })

    const activeInsurance = insurances?.find(i =>
        appointment?.insuranceId ? i.id === appointment.insuranceId : i.status === 'ACTIVE'
    ) ?? insurances?.[0]

    // ── Mutations ──────────────────────────────────────────────────────────────
    const confirmMutation = useMutation({
        mutationFn: async () => {
            await appointmentService.updateStatus(appointment!.id, 'EM_ATENDIMENTO')
            // Attempt to generate TISS guide — non-fatal if it fails
            try {
                await billingService.createFromAppointment(appointment!.id)
            } catch {
                // The guide may already exist or be unavailable — log silently
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waiting-room'] })
            toast.success('Atendimento iniciado! Guia TISS gerada.')
            handleClose()
        },
        onError: () => toast.error('Erro ao iniciar atendimento. Tente novamente.'),
    })

    const cancelMutation = useMutation({
        mutationFn: () => appointmentService.updateStatus(appointment!.id, 'CANCELADO'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waiting-room'] })
            toast.info('Atendimento cancelado.')
            handleClose()
        },
        onError: () => toast.error('Erro ao cancelar. Tente novamente.'),
    })

    // ── Helpers ────────────────────────────────────────────────────────────────
    const handleClose = () => {
        setStep(0)
        setAuthCode('')
        setAuthResult('')
        setPaymentMethod('')
        onClose()
    }

    const canProceedStep3 = isInsurance
        ? (authCode.trim().length > 0 && authResult !== '')
        : paymentMethod !== ''

    const isPending = confirmMutation.isPending || cancelMutation.isPending

    if (!appointment) return null

    // ── Render steps ───────────────────────────────────────────────────────────

    const renderStep = () => {
        switch (step) {
            case 0: // ── Step 1: Paciente ────────────────────────────────────
                return (
                    <div className="space-y-5">
                        {loadingPatient ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
                                    <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" /> Dados Pessoais
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoRow label="Nome" value={patient?.name} />
                                        <InfoRow label="CPF" value={patient?.cpf} />
                                        <InfoRow label="CNS" value={patient?.cns} />
                                        <InfoRow label="Prontuário" value={patient?.prontuarioNumber} />
                                        <InfoRow label="Nascimento" value={
                                            patient?.birthDate
                                                ? format(new Date(patient.birthDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })
                                                : undefined
                                        } />
                                        <InfoRow label="Telefone" value={patient?.phone} />
                                    </div>
                                </div>

                                {isInsurance && activeInsurance ? (
                                    <div className="rounded-lg border p-4 bg-primary/5 border-primary/20 space-y-3">
                                        <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                                            <CreditCard className="w-3.5 h-3.5" /> Convênio
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <InfoRow label="Operadora" value={activeInsurance.operatorName} />
                                            <InfoRow label="Plano" value={activeInsurance.plan} />
                                            <InfoRow label="Carteirinha" value={activeInsurance.cardNumber} />
                                            <InfoRow label="Validade" value={
                                                activeInsurance.validity
                                                    ? format(new Date(activeInsurance.validity + 'T00:00:00'), 'dd/MM/yyyy')
                                                    : undefined
                                            } />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border p-4 bg-muted/30 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Banknote className="w-4 h-4" />
                                        Atendimento <strong className="text-foreground ml-1">Particular</strong>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )

            case 1: // ── Step 2: Procedimento ────────────────────────────────
                return (
                    <div className="space-y-5">
                        <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
                            <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                                <Stethoscope className="w-3.5 h-3.5" /> Profissional
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <InfoRow label="Médico" value={appointment.doctorName} />
                                <InfoRow label="Tipo" value={appointment.type} />
                                <InfoRow label="Sala" value={appointment.room} />
                                <InfoRow label="Início" value={
                                    format(new Date(appointment.startDt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                                } />
                            </div>
                        </div>

                        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 flex gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                            <p className="text-muted-foreground">
                                Confirme que o profissional acima está disponível e pronto para atender.
                            </p>
                        </div>
                    </div>
                )

            case 2: // ── Step 3: Autorização / Pagamento ───────────────────
                return isInsurance ? (
                    <div className="space-y-4">
                        <div className="rounded-lg border p-4 bg-muted/30 space-y-1">
                            <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5 mb-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Autorização do Convênio
                            </p>
                            <p className="text-xs text-muted-foreground">Operadora: <strong>{activeInsurance?.operatorName ?? '—'}</strong></p>
                            <p className="text-xs text-muted-foreground">Carteirinha: <strong>{activeInsurance?.cardNumber ?? '—'}</strong></p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="authCode">Código de Autorização</Label>
                            <Input
                                id="authCode"
                                placeholder="Ex: 123456789"
                                value={authCode}
                                onChange={e => setAuthCode(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Resultado da Autorização</Label>
                            <Select value={authResult} onValueChange={v => setAuthResult(v as 'APROVADO' | 'NEGADO')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o resultado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="APROVADO">
                                        <span className="flex items-center gap-2 text-success">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="NEGADO">
                                        <span className="flex items-center gap-2 text-danger">
                                            <XCircle className="w-3.5 h-3.5" /> Negado
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5 mb-2">
                                <Banknote className="w-3.5 h-3.5" /> Pagamento Particular
                            </p>
                            <p className="text-xs text-muted-foreground">Registre a forma de pagamento do paciente.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Forma de Pagamento</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                                    <SelectItem value="PIX">PIX</SelectItem>
                                    <SelectItem value="CREDITO">Cartão de Crédito</SelectItem>
                                    <SelectItem value="DEBITO">Cartão de Débito</SelectItem>
                                    <SelectItem value="TRANSFERENCIA">Transferência Bancária</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )

            case 3: // ── Step 4: Confirmação ─────────────────────────────────
                const isApproved = !isInsurance || authResult === 'APROVADO'
                return (
                    <div className="space-y-4">
                        <div className={cn(
                            'rounded-lg border p-4 space-y-3',
                            isApproved ? 'bg-success/5 border-success/30' : 'bg-danger/5 border-danger/30'
                        )}>
                            <div className="flex items-center gap-2">
                                {isApproved
                                    ? <CheckCircle2 className="w-5 h-5 text-success" />
                                    : <XCircle className="w-5 h-5 text-danger" />
                                }
                                <p className="font-semibold">
                                    {isApproved ? 'Pronto para iniciar atendimento' : 'Autorização negada'}
                                </p>
                            </div>
                            {!isApproved && (
                                <p className="text-sm text-muted-foreground">
                                    A autorização foi negada pelo convênio. O agendamento será marcado como <strong>CANCELADO</strong>.
                                </p>
                            )}
                        </div>

                        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
                            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Resumo</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Paciente: </span>
                                    <span className="font-medium">{appointment.patientName}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Médico: </span>
                                    <span className="font-medium">{appointment.doctorName}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tipo: </span>
                                    <span className="font-medium">{appointment.type}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        {isInsurance ? 'Autorização: ' : 'Pagamento: '}
                                    </span>
                                    <Badge variant={isApproved ? 'outline' : 'destructive'} className={isApproved ? 'text-success border-success' : ''}>
                                        {isInsurance ? authResult : paymentMethod}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {isApproved ? (
                                <Button
                                    className="flex-1 bg-success hover:bg-success/90 text-white"
                                    disabled={isPending}
                                    onClick={() => confirmMutation.mutate()}
                                >
                                    {confirmMutation.isPending
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Iniciando...</>
                                        : <><CheckCircle2 className="w-4 h-4 mr-2" /> Iniciar Atendimento + Gerar Guia</>
                                    }
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={isPending}
                                    onClick={() => cancelMutation.mutate()}
                                >
                                    {cancelMutation.isPending
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelando...</>
                                        : <><XCircle className="w-4 h-4 mr-2" /> Cancelar Agendamento</>
                                    }
                                </Button>
                            )}
                        </div>
                    </div>
                )
        }
    }

    // ── Third step label changes for particular ────────────────────────────────
    const stepLabels = [...STEPS]
    if (!isInsurance) stepLabels[2] = { label: 'Pagamento', icon: Banknote }

    return (
        <Dialog open={!!appointment} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary">Iniciar Atendimento</DialogTitle>
                </DialogHeader>

                {/* Step indicator */}
                <StepIndicator current={step} />

                {/* Step content */}
                <div className="min-h-[280px]">
                    {renderStep()}
                </div>

                {/* Navigation footer (hidden on step 4 which has its own buttons) */}
                {step < 3 && (
                    <div className="flex justify-between pt-4 border-t mt-4">
                        <Button
                            variant="outline"
                            onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            {step === 0 ? 'Cancelar' : 'Anterior'}
                        </Button>
                        <Button
                            disabled={step === 2 && !canProceedStep3}
                            onClick={() => setStep(s => s + 1)}
                            className="bg-primary hover:bg-primary/90"
                        >
                            Próximo <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
                {step === 3 && (
                    <div className="pt-4 border-t mt-4 flex justify-start">
                        <Button variant="ghost" onClick={() => setStep(2)}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
