import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { insuranceConfigService } from '@/services/insuranceConfigService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { BriefcaseMedical, Shield } from 'lucide-react'
import type { InsuranceConfigRequest } from '@/types/api'

const formSchema = z.object({
    operatorName: z.string().min(2, 'Nome da Operadora é obrigatório'),
    operatorAnscode: z.string().min(2, 'Registro ANS é obrigatório'),
    environment: z.enum(['DEV', 'HML', 'PROD']),
    webserviceUrl: z.string().optional(),
    credentials: z.string().optional(),
    certPassword: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
})

type FormData = z.infer<typeof formSchema>

export default function InsuranceConfigForm() {
    const { id } = useParams<{ id: string }>()
    const isEditMode = Boolean(id && id !== 'new')
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: config, isLoading: isLoadingConfig } = useQuery({
        queryKey: ['insurance-config', id],
        queryFn: () => insuranceConfigService.get(id!),
        enabled: isEditMode,
    })

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            operatorName: '',
            operatorAnscode: '',
            environment: 'DEV',
            webserviceUrl: '',
            credentials: '',
            certPassword: '',
            status: 'ACTIVE',
        }
    })

    useEffect(() => {
        if (config) {
            setValue('operatorName', config.operatorName)
            setValue('operatorAnscode', config.operatorAnscode)
            if (config.environment && (config.environment === 'DEV' || config.environment === 'HML' || config.environment === 'PROD')) {
                setValue('environment', config.environment)
            }
            if (config.webserviceUrl) setValue('webserviceUrl', config.webserviceUrl)
            if (config.status && (config.status === 'ACTIVE' || config.status === 'INACTIVE')) {
                setValue('status', config.status)
            }
        }
    }, [config, setValue])

    const mutation = useMutation({
        mutationFn: (data: InsuranceConfigRequest) => {
            if (isEditMode) {
                return insuranceConfigService.update(id!, data)
            }
            return insuranceConfigService.create(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurance-configs'] })
            toast.success(`Configuração de Convênio ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`)
            navigate('/settings/insurances')
        },
        onError: () => {
            toast.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} configuração. Verifique os dados.`)
        }
    })

    const onSubmit = (data: FormData) => {
        mutation.mutate(data as unknown as InsuranceConfigRequest)
    }

    if (isEditMode && isLoadingConfig) {
        return <div className="p-8 animate-pulse space-y-4">
            <div className="h-8 bg-neutral-100 rounded w-1/4"></div>
            <div className="h-64 bg-neutral-50 rounded"></div>
        </div>
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title={isEditMode ? 'Editar Configuração de Convênio' : 'Nova Configuração de Convênio'}
                subtitle="Configure as credenciais TISS e endpoints de webservice da operadora"
                onBack={() => navigate('/settings/insurances')}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <BriefcaseMedical className="h-5 w-5" />
                            Dados da Operadora
                        </CardTitle>
                        <CardDescription>Informações básicas para identificação da operadora.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="operatorName">Nome da Operadora *</Label>
                            <Input
                                id="operatorName"
                                placeholder="Ex: Unimed Nacional"
                                {...register('operatorName')}
                                className={errors.operatorName ? 'border-danger' : ''}
                            />
                            {errors.operatorName && <p className="text-xs text-danger">{errors.operatorName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="operatorAnscode">Registro ANS *</Label>
                            <Input
                                id="operatorAnscode"
                                placeholder="Ex: 326305"
                                {...register('operatorAnscode')}
                                className={errors.operatorAnscode ? 'border-danger' : ''}
                            />
                            {errors.operatorAnscode && <p className="text-xs text-danger">{errors.operatorAnscode.message}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="environment">Ambiente *</Label>
                            <Controller
                                control={control}
                                name="environment"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={errors.environment ? 'border-danger' : ''}>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DEV">Desenvolvimento (DEV)</SelectItem>
                                            <SelectItem value="HML">Homologação (HML)</SelectItem>
                                            <SelectItem value="PROD">Produção (PROD)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.environment && <p className="text-xs text-danger">{errors.environment.message}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="status">Status</Label>
                            <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Ativo</SelectItem>
                                            <SelectItem value="INACTIVE">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Shield className="h-5 w-5" />
                            Credenciais TISS e WebService
                        </CardTitle>
                        <CardDescription>Configure os endpoints e as credenciais necessárias para autorização e faturamento.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="webserviceUrl">URL do WebService (TISS)</Label>
                            <Input
                                id="webserviceUrl"
                                placeholder="https://ws.operadora.com.br/tiss/v4"
                                {...register('webserviceUrl')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="credentials">Credenciais (Login/Hash)</Label>
                            <Input
                                id="credentials"
                                type="password"
                                placeholder="Credenciais de acesso"
                                {...register('credentials')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certPassword">Senha do Certificado Digital</Label>
                            <Input
                                id="certPassword"
                                type="password"
                                placeholder="Senha do PFX/A1"
                                {...register('certPassword')}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 pb-10">
                    <Button type="button" variant="outline" onClick={() => navigate('/settings/insurances')}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting || mutation.isPending} className="bg-primary text-white hover:bg-primary/90">
                        {isSubmitting || mutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
