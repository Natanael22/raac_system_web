import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentService } from '@/services/appointmentService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, CheckCircle, UserMinus, Clock } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { AppointmentResponse } from '@/types/api'
import { format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useState } from 'react'
import { AttendanceWizard } from './components/AttendanceWizard'

export default function WaitingRoom() {
    const queryClient = useQueryClient()
    const [wizardAppointment, setWizardAppointment] = useState<AppointmentResponse | null>(null)

    const { data: appointmentsPage, isLoading } = useQuery({
        queryKey: ['waiting-room'],
        queryFn: () => appointmentService.list({ page: 0, size: 100, sort: ["startDt,asc"] }),
        staleTime: 0,              // always consider cache stale
        refetchOnWindowFocus: true, // refetch when tab re-gains focus
        refetchInterval: 30000,    // also poll every 30 seconds
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            appointmentService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waiting-room'] })
            toast.success('Status atualizado com sucesso!')
        },
        onError: () => {
            toast.error('Erro ao atualizar status do paciente.')
        }
    })

    // All appointments for today (all statuses except CANCELADO and AUSENTE)
    const todayAppointments = (appointmentsPage?.content ?? []).filter(a => {
        try {
            return isToday(new Date(a.startDt))
        } catch {
            return false
        }
    }).filter(a => !['CANCELADO', 'AUSENTE', 'FINALIZADO'].includes(a.status))

    // Subset for summary cards
    const waitingPatients = todayAppointments.filter(a => a.status === 'EM_ESPERA')
    const inProgressPatients = todayAppointments.filter(a => a.status === 'EM_ATENDIMENTO')

    const columns: ColumnDef<AppointmentResponse>[] = [
        {
            accessorKey: 'patientName',
            header: 'Paciente',
            cell: ({ row }) => (
                <div className="font-medium text-primary">
                    {row.original.patientName}
                </div>
            )
        },
        {
            accessorKey: 'doctorName',
            header: 'Médico',
            cell: ({ row }) => `Dr. ${row.original.doctorName}`
        },
        {
            accessorKey: 'startDt',
            header: 'Agendado para',
            cell: ({ row }) => format(new Date(row.original.startDt), 'HH:mm', { locale: ptBR })
        },
        {
            accessorKey: 'type',
            header: 'Tipo',
            cell: ({ row }) => row.original.type
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status.toLowerCase() as any
                return <StatusBadge status={status} />
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const apt = row.original
                return (
                    <div className="flex justify-end gap-2">

                        <Button
                            variant="outline"
                            size="sm"
                            className="text-secondary border-secondary/20 hover:bg-secondary/10"
                            onClick={() => setWizardAppointment(apt)}
                        >
                            <Play className="w-4 h-4 mr-2" /> Atender
                        </Button>


                        <Button
                            variant="outline"
                            size="sm"
                            className="text-success border-success/20 hover:bg-success/10"
                            onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'FINALIZADO' })}
                            disabled={updateStatusMutation.isPending}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Finalizar
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="text-success border-success/20 hover:bg-success/10"
                            onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'EM_ESPERA' })}
                            disabled={updateStatusMutation.isPending}
                        >
                            <Clock className="w-4 h-4 mr-2" /> Aguardar
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger/10"
                            onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'AUSENTE' })}
                            disabled={updateStatusMutation.isPending}
                        >
                            <UserMinus className="w-4 h-4" />
                        </Button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sala de Espera"
                subtitle="Gerenciamento de pacientes presentes no estabelecimento"
            />

            <div className="grid gap-6">
                <div className="flex gap-4">
                    <Card className="flex-1 bg-secondary/5 border-secondary/20">
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-secondary/80 mb-1">Aguardando Atendimento</div>
                            <div className="text-3xl font-bold text-secondary">
                                {waitingPatients.filter(a => a.status === 'EM_ESPERA').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 bg-success/5 border-success/20">
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-success/80 mb-1">Em Atendimento</div>
                            <div className="text-3xl font-bold text-success">
                                {inProgressPatients.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DataTable
                    columns={columns}
                    data={todayAppointments}
                    loading={isLoading}
                    searchKey="patientName"
                    searchPlaceholder="Buscar por nome do paciente..."
                />
            </div>

            <AttendanceWizard
                appointment={wizardAppointment}
                onClose={() => setWizardAppointment(null)}
            />
        </div>
    )
}
