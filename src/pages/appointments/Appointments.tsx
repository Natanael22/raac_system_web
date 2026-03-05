import { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { useQuery, useMutation } from '@tanstack/react-query'
import { appointmentService } from '@/services/appointmentService'
import { doctorService } from '@/services/doctorService'
import { billingService } from '@/services/billingService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Appointments() {
    const navigate = useNavigate()
    const calendarRef = useRef<FullCalendar>(null)
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all')
    const [selectedEvent, setSelectedEvent] = useState<any>(null)

    const generateGuideMutation = useMutation({
        mutationFn: (appointmentId: string) => billingService.createFromAppointment(appointmentId),
        onSuccess: () => {
            toast.success('Guia TISS gerada com sucesso!')
            setSelectedEvent(null)
            navigate('/billing/guides')
        },
        onError: () => {
            toast.error('Erro ao gerar guia. O agendamento pode já possuir uma guia ou faltam dados.')
        }
    })

    const { data: doctorsPage } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => doctorService.list({ page: 0, size: 100 }),
    })

    const { data: appointmentsPage, isLoading } = useQuery({
        queryKey: ['appointments', selectedDoctorId],
        queryFn: () => appointmentService.list({ page: 0, size: 500 }), // In a real app we'd filter by doctor and date range
    })

    const doctors = doctorsPage?.content ?? []

    // Transform API appointments to FullCalendar events
    const events = (appointmentsPage?.content ?? [])
        .filter(apt => selectedDoctorId === 'all' || apt.doctorId === selectedDoctorId)
        .map(apt => ({
            id: apt.id,
            title: `${apt.patientName} (Dr. ${apt.doctorName})`,
            start: apt.startDt,
            end: apt.endDt,
            extendedProps: { ...apt },
            className: getStatusClass(apt.status)
        }))

    function getStatusClass(status: string) {
        switch (status) {
            case 'AGENDADO': return 'bg-blue-500 border-blue-600'
            case 'CONFIRMADO': return 'bg-success border-success-dark'
            case 'EM_ESPERA': return 'bg-warning border-warning-dark'
            case 'EM_ATENDIMENTO': return 'bg-secondary border-secondary-dark'
            case 'FINALIZADO': return 'bg-neutral-500 border-neutral-600'
            default: return 'bg-primary border-primary-dark'
        }
    }

    return (
        <div className="space-y-6 flex flex-col h-full">
            <PageHeader
                title="Agenda Médica"
                subtitle="Visualize e gerencie os agendamentos da clínica"
                action={
                    <Button
                        className="bg-secondary hover:bg-secondary/90 text-white"
                        onClick={() => navigate('/appointments/new')}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
                    </Button>
                }
            />

            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-6 flex flex-col h-full gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-64">
                            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os Médicos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Médicos</SelectItem>
                                    {doctors.map(doc => (
                                        <SelectItem key={doc.id} value={doc.id}>Dr. {doc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[600px] border rounded-md p-4 bg-white calendar-container">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                locale={ptBrLocale}
                                events={events}
                                slotMinTime="07:00:00"
                                slotMaxTime="20:00:00"
                                allDaySlot={false}
                                height="auto"
                                eventClick={(info) => {
                                    setSelectedEvent(info.event)
                                }}
                                dateClick={(info) => {
                                    toast(`Nova consulta em ${info.dateStr}`)
                                }}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes do Agendamento</DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-4 pt-4">
                            <div>
                                <p className="text-sm text-muted-foreground uppercase font-semibold">Paciente</p>
                                <p className="font-medium text-lg">{selectedEvent.extendedProps.patientName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase font-semibold">Médico</p>
                                    <p className="font-medium">{selectedEvent.extendedProps.doctorName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase font-semibold">Status</p>
                                    <p className="font-medium">{selectedEvent.extendedProps.status}</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t mt-4 gap-2">
                                <Button variant="outline" onClick={() => setSelectedEvent(null)}>Fechar</Button>
                                {selectedEvent.extendedProps.status === 'FINALIZADO' && (
                                    <Button
                                        className="bg-primary hover:bg-primary-dark"
                                        disabled={generateGuideMutation.isPending}
                                        onClick={() => generateGuideMutation.mutate(selectedEvent.id)}
                                    >
                                        {generateGuideMutation.isPending ? 'Gerando...' : 'Gerar Guia TISS'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <style>{`
        .fc .fc-button-primary {
          background-color: var(--primary);
          border-color: var(--primary);
        }
        .fc .fc-button-primary:hover {
          background-color: #1a3353;
        }
        .fc .fc-button-primary:disabled {
          background-color: #ccc;
          border-color: #ccc;
        }
        .fc .fc-event {
          cursor: pointer;
          font-size: 0.8rem;
          padding: 1px 4px;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f1f1f1;
        }
      `}</style>
        </div>
    )
}
