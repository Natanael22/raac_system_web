import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { medicalRecordService } from '@/services/medicalRecordService'
import { patientService } from '@/services/patientService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Timeline, type TimelineItem } from '@/components/shared/Timeline'
import { Button } from '@/components/ui/button'
import { Plus, FileText, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PatientRecords() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data: patient } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientService.get(id!),
        enabled: !!id,
    })

    const { data: recordsPage, isLoading } = useQuery({
        queryKey: ['medical-records', id],
        queryFn: () => medicalRecordService.listByPatient(id!),
        enabled: !!id,
    })

    const records = recordsPage?.content ?? []

    const timelineItems: TimelineItem[] = records.map(record => ({
        id: record.id,
        date: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }), // Ideally the record has a createdAt field
        title: `Evolução Clínica - Dr. ${record.doctorName}`,
        description: record.notes || 'Sem observações adicionais.',
        icon: <FileText className="w-4 h-4" />
    }))

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <PageHeader
                title={`Prontuário: ${patient?.name || 'Carregando...'}`}
                subtitle="Histórico completo de evoluções e atendimentos"
                onBack={() => navigate(`/patients/${id}`)}
                action={
                    <Button
                        className="bg-secondary hover:bg-secondary/90 text-white"
                        onClick={() => navigate(`/patients/${id}/records/new`)}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nova Evolução
                    </Button>
                }
            />

            <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <div className="p-4 rounded-lg border bg-neutral-light/30">
                        <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                            <User className="w-4 h-4" />
                            <span>Dados do Paciente</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">CPF</p>
                                <p className="font-medium">{patient?.cpf || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Nascimento</p>
                                <p className="font-medium">{patient?.birthDate || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : timelineItems.length > 0 ? (
                        <Timeline items={timelineItems} />
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-neutral-50">
                            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-primary">Nenhuma evolução encontrada</h3>
                            <p className="text-muted-foreground mb-6">Este paciente ainda não possui registros clínicos.</p>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/patients/${id}/records/new`)}
                            >
                                Criar Primeira Evolução
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
