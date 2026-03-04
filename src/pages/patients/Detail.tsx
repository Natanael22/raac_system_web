import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { patientService } from '@/services/patientService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { User, FileText, Calendar, Phone, MapPin, Activity } from 'lucide-react'

export default function PatientDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data: patient, isLoading, isError } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientService.get(id!),
        enabled: !!id,
        retry: 1
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
                        <Button variant="outline" onClick={() => navigate(`/patients/${id}/records`)}>
                            <FileText className="w-4 h-4 mr-2" /> Prontuário (Evoluções)
                        </Button>
                        <Button className="bg-secondary text-white hover:bg-secondary/90">
                            <Calendar className="w-4 h-4 mr-2" /> Agendar Consulta
                        </Button>
                    </div>
                }
            />

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
                                <p className="font-medium">{/* A API V1 PatientResponse não retorna email, mas podemos adaptar futuramente se necessário */}—</p>
                            </div>
                            <div className="col-span-2 pt-2 border-t">
                                <p className="text-muted-foreground text-xs uppercase font-semibold">Endereço</p>
                                <p className="font-medium flex items-center gap-1 mt-1 text-muted-foreground italic">
                                    <MapPin className="h-3 w-3" />
                                    (Campos de endereço não retornados na ref atual da API)
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
                            <p className="text-sm font-medium">Buscando...</p>
                        </div>
                        <div className="p-3 bg-neutral-light rounded-md">
                            <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Convênio Ativo</p>
                            <p className="text-sm font-medium">Buscando...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
