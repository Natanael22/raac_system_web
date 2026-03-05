import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { medicalRecordService } from '@/services/medicalRecordService'
import { doctorService } from '@/services/doctorService'
import { patientService } from '@/services/patientService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const schema = z.object({
    doctorId: z.string().min(1, 'Selecione o médico'),
    notes: z.string().min(10, 'A evolução deve ter pelo menos 10 caracteres'),
    diagnosisJson: z.string().optional(),
})

type EvolutionForm = z.infer<typeof schema>

export default function NewEvolution() {
    const { id: patientId } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<EvolutionForm>({
        resolver: zodResolver(schema),
    })

    const { data: patient } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: () => patientService.get(patientId!),
        enabled: !!patientId,
    })

    const { data: doctorsPage } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => doctorService.list({ size: 100 }),
    })

    const doctors = doctorsPage?.content ?? []

    const mutation = useMutation({
        mutationFn: (data: EvolutionForm) => medicalRecordService.create({
            patientId: patientId!,
            doctorId: data.doctorId,
            notes: data.notes,
            diagnosisJson: data.diagnosisJson
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medical-records', patientId] })
            toast.success('Evolução registrada com sucesso!')
            navigate(`/patients/${patientId}/records`)
        },
        onError: () => {
            toast.error('Erro ao salvar evolução clínica.')
        }
    })

    const onSubmit = (data: EvolutionForm) => {
        mutation.mutate(data)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title="Nova Evolução Clínica"
                subtitle={`Registrando atendimento para: ${patient?.name || '...'}`}
                onBack={() => navigate(`/patients/${patientId}/records`)}
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-primary text-lg">Detalhes do Atendimento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="doctorId">Médico Responsável *</Label>
                            <Select onValueChange={(v) => setValue('doctorId', v)}>
                                <SelectTrigger className={errors.doctorId ? 'border-danger' : ''}>
                                    <SelectValue placeholder="Selecione o médico..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map(doc => (
                                        <SelectItem key={doc.id} value={doc.id}>Dr. {doc.name} (CRM: {doc.crm})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.doctorId && <p className="text-xs text-danger">{errors.doctorId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Evolução / Conduta Clínica *</Label>
                            <Textarea
                                id="notes"
                                placeholder="Descreva o atendimento, sintomas, conduta e prescrições..."
                                className={`min-h-[300px] resize-none ${errors.notes ? 'border-danger' : ''}`}
                                {...register('notes')}
                            />
                            {errors.notes && <p className="text-xs text-danger">{errors.notes.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="diagnosisJson">Diagnóstico / CID (JSON format strings)</Label>
                            <Textarea
                                id="diagnosisJson"
                                placeholder='ex: ["J02", "B34"]'
                                className="font-mono text-sm"
                                {...register('diagnosisJson')}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 bg-neutral-light/30 p-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/patients/${patientId}/records`)}
                        >
                            Descartar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-secondary text-white hover:bg-secondary/90 min-w-[150px]"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Salvando...' : 'Finalizar Evolução'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
