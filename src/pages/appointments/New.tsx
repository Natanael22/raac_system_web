
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentService } from '@/services/appointmentService'
import { patientService } from '@/services/patientService'
import { doctorService } from '@/services/doctorService'
import { patientInsuranceService } from '@/services/patientInsuranceService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { User, Stethoscope, Clock } from 'lucide-react'
import type { AppointmentRequest } from '@/types/api'
import { PatientCombobox } from '@/components/shared/PatientCombobox'

const formSchema = z.object({
    patientId: z.string().min(1, 'Paciente é obrigatório'),
    doctorId: z.string().min(1, 'Médico é obrigatório'),
    insuranceId: z.string().optional(),
    type: z.enum(['CONSULTA', 'EXAME', 'RETORNO', 'PROCEDIMENTO'] as const, { required_error: 'Tipo é obrigatório' }),
    origin: z.enum(['TELEFONE', 'WHATSAPP', 'PRESENCIAL', 'ONLINE'] as const).optional(),
    startDt: z.string().min(1, 'Data/hora de início é obrigatória'),
    endDt: z.string().min(1, 'Data/hora de fim é obrigatória'),
    room: z.string().optional(),
    notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function NewAppointment() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Fetch lists for select dropdowns (for MVP, fetching a large page size)
    const { data: patientsPage, isLoading: isLoadingPatients } = useQuery({
        queryKey: ['patients-list'],
        queryFn: () => patientService.list({ size: 100 }),
    })
    const { data: doctorsPage, isLoading: isLoadingDoctors } = useQuery({
        queryKey: ['doctors-list'],
        queryFn: () => doctorService.list({ size: 100 }),
    })

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patientId: '',
            doctorId: '',
            insuranceId: undefined,
            type: 'CONSULTA',
            origin: 'TELEFONE',
            startDt: '',
            endDt: '',
            room: '',
            notes: ''
        }
    })

    const selectedPatientId = watch('patientId')

    // Fetch insurances dynamically based on selected patient
    const { data: patientInsurances, isLoading: isLoadingInsurances } = useQuery({
        queryKey: ['patient-insurances', selectedPatientId],
        queryFn: () => patientInsuranceService.list(selectedPatientId!),
        enabled: !!selectedPatientId,
    })

    const mutation = useMutation({
        mutationFn: (data: AppointmentRequest) => appointmentService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
            queryClient.invalidateQueries({ queryKey: ['waiting-room'] })
            toast.success('Agendamento criado com sucesso!')
            navigate('/appointments')
        },
        onError: () => {
            toast.error('Erro ao criar agendamento. Verifique os dados.')
        }
    })

    const onSubmit = (data: FormData) => {
        const payload: AppointmentRequest = {
            ...data,
            startDt: data.startDt.length === 16 ? `${data.startDt}:00` : data.startDt,
            endDt: data.endDt.length === 16 ? `${data.endDt}:00` : data.endDt,
        }
        mutation.mutate(payload)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title="Novo Agendamento"
                subtitle="Agende uma consulta, exame ou procedimento"
                onBack={() => navigate('/appointments')}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary text-base">
                                <User className="w-4 h-4" /> Dados do Paciente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Paciente *</Label>
                                <PatientCombobox
                                    patients={patientsPage?.content ?? []}
                                    value={watch('patientId')}
                                    onChange={(v) => {
                                        setValue('patientId', v)
                                        setValue('insuranceId', undefined)
                                    }}
                                    disabled={isLoadingPatients}
                                    hasError={!!errors.patientId}
                                />
                                {errors.patientId && <p className="text-xs text-danger">{errors.patientId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Convênio (Opcional)</Label>
                                <Select
                                    disabled={!selectedPatientId || isLoadingInsurances}
                                    value={watch('insuranceId') || 'PARTICULAR'}
                                    onValueChange={(v) => setValue('insuranceId', v === 'PARTICULAR' ? undefined : v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Particular ou selecione um convênio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PARTICULAR">Particular (Sem Convênio)</SelectItem>
                                        {patientInsurances?.filter(i => i.status === 'ACTIVE').map(ins => (
                                            <SelectItem key={ins.id} value={ins.id}>{ins.operatorName} - {ins.plan || 'Sem plano'}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary text-base">
                                <Stethoscope className="w-4 h-4" /> Dados do Atendimento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Profissional (Médico) *</Label>
                                <Select disabled={isLoadingDoctors} value={watch('doctorId')} onValueChange={(v) => setValue('doctorId', v)}>
                                    <SelectTrigger className={errors.doctorId ? 'border-danger' : ''}>
                                        <SelectValue placeholder="Selecione o médico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctorsPage?.content.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name} - {d.specialty || 'Geral'}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.doctorId && <p className="text-xs text-danger">{errors.doctorId.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo *</Label>
                                    <Select value={watch('type')} onValueChange={(v: any) => setValue('type', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CONSULTA">Consulta</SelectItem>
                                            <SelectItem value="EXAME">Exame</SelectItem>
                                            <SelectItem value="RETORNO">Retorno</SelectItem>
                                            <SelectItem value="PROCEDIMENTO">Procedimento</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Origem</Label>
                                    <Select value={watch('origin')} onValueChange={(v: any) => setValue('origin', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Origem" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TELEFONE">Telefone</SelectItem>
                                            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                            <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                                            <SelectItem value="ONLINE">Online</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary text-base">
                            <Clock className="w-4 h-4" /> Agendamento e Sala
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Início *</Label>
                                <Input type="datetime-local" {...register('startDt')} className={errors.startDt ? 'border-danger' : ''} />
                                {errors.startDt && <p className="text-xs text-danger">{errors.startDt.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Fim *</Label>
                                <Input type="datetime-local" {...register('endDt')} className={errors.endDt ? 'border-danger' : ''} />
                                {errors.endDt && <p className="text-xs text-danger">{errors.endDt.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Sala / Consultório</Label>
                                <Input placeholder="Ex: Sala 01" {...register('room')} />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label>Observações / Notas da Recepção</Label>
                            <Textarea placeholder="Informações adicionais..." {...register('notes')} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 pb-10">
                    <Button type="button" variant="outline" onClick={() => navigate('/appointments')}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting || mutation.isPending} className="bg-primary text-white hover:bg-primary/90">
                        {isSubmitting || mutation.isPending ? 'Salvando...' : 'Confirmar Agendamento'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
