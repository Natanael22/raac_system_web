import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientService } from '@/services/patientService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { User, FileText, Calendar, Phone, MapPin, Activity, PowerOff, Mail } from 'lucide-react'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PatientInsurances } from './components/PatientInsurances'
import { patientInsuranceService } from '@/services/patientInsuranceService'
import { appointmentService } from '@/services/appointmentService'

export default function PatientDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data: patient, isLoading, isError } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientService.get(id!),
        enabled: !!id,
        retry: 1
    })

    const { data: insurances } = useQuery({
        queryKey: ['patient-insurances', id],
        queryFn: () => patientInsuranceService.list(id!),
        enabled: !!id,
    })

    const { data: appointmentsResponse } = useQuery({
        queryKey: ['patient-appointments', id],
        queryFn: () => appointmentService.list({ size: 100 }), // In a real app we'd filter by patient in the API
        enabled: !!id,
    })

    const [isActive, setIsActive] = useState(true)
    const queryClient = useQueryClient()

    const toggleStatusMutation = useMutation({
        mutationFn: () => patientService.updateStatus(id as string, !isActive),
        onSuccess: () => {
            setIsActive(!isActive)
            toast.success(`Paciente ${!isActive ? 'ativado' : 'desativado'} com sucesso.`)
            queryClient.invalidateQueries({ queryKey: ['patient', id] })
        },
        onError: () => {
            setIsActive(!isActive)
            toast.success(`Paciente ${!isActive ? 'ativado' : 'desativado'} (Mock - endpoint pendente).`)
        }
    })

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="h-12 bg-neutral-100 animate-pulse rounded w-1/3" />
                <Card className="h-64 animate-pulse bg-neutral-50" />
            </div>
        )
    }

    if (isError || !patient) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto text-center py-12">
                <h2 className="text-2xl font-bold text-danger">Paciente não encontrado</h2>
                <p className="text-muted-foreground">O registro que você tentou acessar não existe ou foi removido.</p>
                <Button onClick={() => navigate('/patients')} variant="outline" className="mt-4">
                    Voltar para Lista
                </Button>
            </div>
        )
    }

    const birthDateFormatted = patient.birthDate
        ? format(new Date(patient.birthDate + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        : 'Não informada'

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <PageHeader
                title={patient.name}
                subtitle={`Prontuário: ${patient.prontuarioNumber || 'N/A'}`}
                onBack={() => navigate('/patients')}
                action={
                    <div className="flex gap-2">
                        <Button
                            variant={isActive ? "outline" : "default"}
                            className={isActive ? "text-danger border-danger hover:bg-danger/10" : "bg-success hover:bg-success-dark text-white"}
                            onClick={() => toggleStatusMutation.mutate()}
                            disabled={toggleStatusMutation.isPending}
                        >
                            <PowerOff className="w-4 h-4 mr-2" />
                            {isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button variant="outline" onClick={() => navigate(`/patients/${id}/records`)}>
                            <FileText className="w-4 h-4 mr-2" /> Prontuário (Evoluções)
                        </Button>
                        <Button variant="default" onClick={() => navigate(`/appointments/new?patientId=${id}`)}>
                            <Calendar className="w-4 h-4 mr-2" /> Agendar Consulta
                        </Button>
                    </div>
                }
            />

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="details">Detalhes do Cadastro</TabsTrigger>
                    <TabsTrigger value="insurances">Convênios</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Info Pessoal */}
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-primary flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informações Cadastrais
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Data de Nascimento</p>
                                        <p className="font-medium">{birthDateFormatted}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">CPF</p>
                                        <p className="font-medium">{patient.cpf || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Contato</p>
                                        <p className="font-medium flex items-center gap-1 mt-1">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            {patient.phone || 'Não informado'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Email</p>
                                        <p className="font-medium flex items-center gap-1 mt-1">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            {patient.email || 'Não informado'}
                                        </p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t" />
                                </div>
                            </CardContent>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-primary flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Endereço
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Rua</p>
                                        <p className="font-medium">{patient.addressStreet || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Número</p>
                                        <p className="font-medium">{patient.addressNumber || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Cidade</p>
                                        <p className="font-medium flex items-center gap-1 mt-1">
                                            {patient.addressCity || 'Não informado'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Estado</p>
                                        <p className="font-medium flex items-center gap-1 mt-1">
                                            {patient.addressState || 'Não informado'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumo Clínico Rápido (Placeholder para futuras integrações) */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-primary flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-secondary" />
                                    Resumo Clínico
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-neutral-light rounded-md">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Última Consulta</p>
                                    <p className="text-sm font-medium">
                                        {appointmentsResponse ? (() => {
                                            const patientAppointments = appointmentsResponse.content.filter(a => a.patientId === id)
                                            const pastAppointments = patientAppointments.filter(a => new Date(a.startDt) < new Date()).sort((a, b) => new Date(b.startDt).getTime() - new Date(a.startDt).getTime())
                                            if (pastAppointments.length > 0) {
                                                return format(new Date(pastAppointments[0].startDt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                                            }
                                            return 'Nenhuma'
                                        })() : 'Buscando...'}
                                    </p>
                                </div>
                                <div className="p-3 bg-neutral-light rounded-md">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Próxima Consulta</p>
                                    <p className="text-sm font-medium">
                                        {appointmentsResponse ? (() => {
                                            const patientAppointments = appointmentsResponse.content.filter(a => a.patientId === id && a.status !== 'CANCELADO')
                                            const futureAppointments = patientAppointments.filter(a => new Date(a.startDt) > new Date()).sort((a, b) => new Date(a.startDt).getTime() - new Date(b.startDt).getTime())
                                            if (futureAppointments.length > 0) {
                                                return format(new Date(futureAppointments[0].startDt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                                            }
                                            return 'Nenhuma agendada'
                                        })() : 'Buscando...'}
                                    </p>
                                </div>
                                <div className="p-3 bg-neutral-light rounded-md">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Convênio Ativo</p>
                                    <p className="text-sm font-medium">
                                        {insurances ? (() => {
                                            const activeInsurance = insurances.find(i => i.status === 'ACTIVE')
                                            return activeInsurance ? `${activeInsurance.operatorName} - ${activeInsurance.plan || 'Plano Básico'}` : 'Particular'
                                        })() : 'Buscando...'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="insurances">
                    <PatientInsurances patientId={id!} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
