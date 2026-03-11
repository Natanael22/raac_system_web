import { useQuery } from '@tanstack/react-query'
import { appointmentService } from '@/services/appointmentService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar as CalendarIcon, FileCheck, Receipt, Clock } from 'lucide-react'
import type { AppointmentResponse } from '@/types/api'
import { format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusColorMap: Record<string, string> = {
    AGENDADO: 'bg-blue-100 text-blue-700',
    CONFIRMADO: 'bg-success/10 text-success',
    EM_ESPERA: 'bg-warning/10 text-warning',
    EM_ATENDIMENTO: 'bg-secondary/10 text-secondary',
    FINALIZADO: 'bg-neutral-100 text-neutral-500',
    CANCELADO: 'bg-danger/10 text-danger',
    AUSENTE: 'bg-neutral-100 text-neutral-500',
}

const statusLabelMap: Record<string, string> = {
    AGENDADO: 'Agendado',
    CONFIRMADO: 'Confirmado',
    EM_ESPERA: 'Em Espera',
    EM_ATENDIMENTO: 'Em Atendimento',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
    AUSENTE: 'Ausente',
}

export default function Dashboard() {
    const { data: appointmentsPage, isLoading } = useQuery({
        queryKey: ['appointments-today'],
        queryFn: () => appointmentService.list({ page: 0, size: 50, sort: ["startDt,asc"] }),
        staleTime: 30_000, // 30 seconds — frequência alta por ser dado dinâmico
        refetchInterval: 60_000, // Auto-refetch a cada 1 minuto
    })

    // Filter today's appointments from the list
    const todayAppointments: AppointmentResponse[] = (appointmentsPage?.content ?? []).filter(a => {
        try {
            return isToday(new Date(a.startDt))
        } catch {
            return false
        }
    })

    const waitingCount = todayAppointments.filter(a => a.status === 'EM_ESPERA').length
    const inProgressCount = todayAppointments.filter(a => a.status === 'EM_ATENDIMENTO').length

    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard"
                subtitle="Visão geral e indicadores do dia"
            />

            {/* KPI Widgets */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-dark">Consultas Hoje</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{isLoading ? '—' : todayAppointments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {inProgressCount > 0 && <span className="text-secondary">{inProgressCount} em atendimento</span>}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-dark">Sala de Espera</CardTitle>
                        <Clock className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{isLoading ? '—' : waitingCount}</div>
                        <p className="text-xs text-warning mt-1">paciente(s) aguardando</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-dark">Total do Mês</CardTitle>
                        <Users className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{appointmentsPage?.totalElements ?? '—'}</div>
                        <p className="text-xs text-muted-foreground mt-1">consultas no período</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-dark">Status do Sistema</CardTitle>
                        <Receipt className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-bold text-success">Online</div>
                        <p className="text-xs text-muted-foreground mt-1">API conectada</p>
                    </CardContent>
                </Card>
            </div>

            {/* Appointments Today */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="text-primary font-semibold">
                            Agenda de Hoje — {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-14 rounded-md bg-neutral-100 animate-pulse" />
                                ))}
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                                <CalendarIcon className="h-8 w-8 opacity-40" />
                                <p className="text-sm">Sem consultas agendadas para hoje.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {todayAppointments.map(apt => (
                                    <li key={apt.id} className="flex items-center justify-between p-3 rounded-md border bg-white hover:bg-neutral-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-primary">{apt.patientName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(apt.startDt), 'HH:mm')} · Dr. {apt.doctorName}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColorMap[apt.status] ?? 'bg-neutral-100'}`}>
                                            {statusLabelMap[apt.status] ?? apt.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="text-primary font-semibold flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            Resumo de Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {Object.entries(statusLabelMap).map(([key, label]) => {
                                const count = todayAppointments.filter(a => a.status === key).length
                                return (
                                    <li key={key} className="flex items-center justify-between text-sm">
                                        <span className={`flex items-center gap-2`}>
                                            <span className={`w-2 h-2 rounded-full ${statusColorMap[key]?.split(' ')[0]}`} />
                                            {label}
                                        </span>
                                        <span className="font-bold text-primary">{count}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
