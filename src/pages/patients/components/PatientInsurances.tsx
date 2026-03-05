import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientInsuranceService } from '@/services/patientInsuranceService'
import { InsuranceCard } from '@/components/shared/InsuranceCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const schema = z.object({
    operatorName: z.string().min(1, 'Nome da Operadora é obrigatório'),
    cardNumber: z.string().min(1, 'Número da Carteirinha é obrigatório'),
    plan: z.string().optional(),
    validity: z.string().optional(),
    accommodation: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function PatientInsurances({ patientId }: { patientId: string }) {
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)

    const { data: insurances, isLoading } = useQuery({
        queryKey: ['patient-insurances', patientId],
        queryFn: () => patientInsuranceService.list(patientId),
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    })

    const mutation = useMutation({
        mutationFn: (data: FormValues) => patientInsuranceService.create(patientId, {
            ...data,
            status: 'ACTIVE'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-insurances', patientId] })
            toast.success('Carteirinha adicionada com sucesso!')
            setOpen(false)
            reset()
        },
        onError: () => {
            toast.error('Erro ao adicionar carteirinha.')
        }
    })

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data)
    }

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-neutral-100 rounded-lg"></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary">Carteirinhas de Convênio</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-secondary text-white hover:bg-secondary/90">
                            <Plus className="w-4 h-4 mr-2" /> Nova Carteirinha
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Convênio</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="operatorName">Operadora *</Label>
                                <Input
                                    id="operatorName"
                                    placeholder="Ex: Unimed, Bradesco"
                                    {...register('operatorName')}
                                    className={errors.operatorName ? 'border-danger' : ''}
                                />
                                {errors.operatorName && <p className="text-xs text-danger">{errors.operatorName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Número da Carteirinha *</Label>
                                <Input
                                    id="cardNumber"
                                    placeholder="Ex: 0000 0000 0000 0000"
                                    {...register('cardNumber')}
                                    className={errors.cardNumber ? 'border-danger' : ''}
                                />
                                {errors.cardNumber && <p className="text-xs text-danger">{errors.cardNumber.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="plan">Plano</Label>
                                    <Input id="plan" {...register('plan')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validity">Validade</Label>
                                    <Input id="validity" type="date" {...register('validity')} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accommodation">Acomodação</Label>
                                <Input id="accommodation" placeholder="Ex: Apartamento, Enfermaria" {...register('accommodation')} />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="bg-primary text-white hover:bg-primary/90"
                                >
                                    {mutation.isPending ? 'Salvando...' : 'Salvar Carteirinha'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {!insurances || insurances.length === 0 ? (
                <div className="text-center py-10 bg-neutral-50 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">O paciente não possui convênios cadastrados.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {insurances.map(ins => (
                        <InsuranceCard
                            key={ins.id}
                            insurance={{
                                name: ins.operatorName,
                                plan: ins.plan || 'Não informado',
                                number: ins.cardNumber,
                                // Defaulting to "indeterminado" if validity is not set or parsing fails
                                expiryDate: ins.validity ? format(new Date(ins.validity + 'T00:00:00'), 'dd/MM/yyyy') : '2100-01-01'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
