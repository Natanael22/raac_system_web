import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentService } from '@/services/appointmentService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, CheckCircle, UserMinus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { AppointmentResponse } from '@/types/api'
import { format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function WaitingRoom() {
    const queryClient = useQueryClient()

    const { data: appointmentsPage, isLoading } = useQuery({
        queryKey: ['waiting-room'],
        queryFn: () => appointmentService.list({ page: 0, size: 100 }),
        refetchInterval: 30000, // Refresh every 30 seconds
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

    // Filter only patients that are present or in progress today
    const waitingPatients = (appointmentsPage?.content ?? []).filter(a => {
        const today = isToday(new Date(a.startDt))
        return today && ['EM_ESPERA', 'EM_ATENDIMENTO'].includes(a.status)
    }).sort((a, b) => new Date(a.startDt).getTime() - new Date(b.startDt).getTime())

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
                        {apt.status === 'EM_ESPERA' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-secondary border-secondary/20 hover:bg-secondary/10"
                                onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'EM_ATENDIMENTO' })}
                                disabled={updateStatusMutation.isPending}
                            >
                                <Play className="w-4 h-4 mr-2" /> Chamar
                            </Button>
                        )}
                        {apt.status === 'EM_ATENDIMENTO' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-success border-success/20 hover:bg-success/10"
                                onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'FINALIZADO' })}
                                disabled={updateStatusMutation.isPending}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Finalizar
                            </Button>
                        )}
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
                                {waitingPatients.filter(a => a.status === 'EM_ATENDIMENTO').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DataTable
                    columns={columns}
                    data={waitingPatients}
                    loading={isLoading}
                    searchKey="patientName"
                    searchPlaceholder="Buscar por nome do paciente..."
                />
            </div>
        </div>
    )
}
