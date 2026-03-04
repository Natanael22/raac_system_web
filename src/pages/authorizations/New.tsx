import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/PageHeader'
import { AuthorizationTracker } from '@/components/shared/AuthorizationTracker'
import { FileUploader } from '@/components/shared/FileUploader'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { authorizationService } from '@/services/authorizationService'
import { doctorService } from '@/services/doctorService'
import { insuranceConfigService } from '@/services/insuranceConfigService'
import type { AuthStatus, AuthResult } from '@/components/shared/AuthorizationTracker'

const schema = z.object({
    patientId: z.string().min(1, 'Informe o ID do paciente'),
    doctorId: z.string().min(1, 'Selecione o médico'),
    insuranceConfigId: z.string().min(1, 'Selecione o convênio'),
    procedureCode: z.string().min(1, 'Informe o código do procedimento'),
    cid: z.string().optional(),
})

type AuthorizationForm = z.infer<typeof schema>

export default function NewAuthorization() {
    const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)
    const [authResult, setAuthResult] = useState<AuthResult>(null)
    const [authId, setAuthId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<AuthorizationForm>({
        resolver: zodResolver(schema),
    })

    const { data: doctorsPage } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => doctorService.list({ size: 100 }),
        staleTime: 5 * 60_000,
    })

    const { data: insurancePage } = useQuery({
        queryKey: ['insurance-configs'],
        queryFn: () => insuranceConfigService.list({ size: 100 }),
        staleTime: 5 * 60_000,
    })

    const doctors = doctorsPage?.content ?? []
    const insurances = insurancePage?.content ?? []

    const onSubmit = async (data: AuthorizationForm) => {
        setLoading(true)
        setAuthStatus('enviando')
        setAuthResult(null)

        try {
            const result = await authorizationService.request({
                patientId: data.patientId,
                doctorId: data.doctorId,
                insuranceConfigId: data.insuranceConfigId,
                procedureCode: data.procedureCode,
                cid: data.cid,
            })

            const id = (result as { id?: string }).id
            if (id) {
                setAuthId(id)
            }

            setAuthStatus('aguardando')

            // Poll for status if we have an ID
            if (id) {
                const poll = setInterval(async () => {
                    try {
                        const statusResult = await authorizationService.getStatus(id)
                        const status = statusResult['status'] ?? statusResult['STATUS']
                        if (status === 'APROVADO') {
                            setAuthStatus('resultado')
                            setAuthResult('autorizado')
                            setLoading(false)
                            clearInterval(poll)
                            toast.success('Autorização aprovada!')
                        } else if (status === 'NEGADO' || status === 'CANCELADO') {
                            setAuthStatus('resultado')
                            setAuthResult('negado')
                            setLoading(false)
                            clearInterval(poll)
                            toast.error('Autorização negada.')
                        }
                    } catch {
                        // Keep polling on error
                    }
                }, 3000)

                // Timeout after 5 minutes
                setTimeout(() => {
                    clearInterval(poll)
                    if (loading) {
                        setAuthStatus('resultado')
                        setAuthResult('negado')
                        setLoading(false)
                        toast.error('Tempo esgotado. Verifique o status manualmente.')
                    }
                }, 5 * 60_000)
            } else {
                // Immediate result (synchronous endpoint)
                setAuthStatus('resultado')
                setAuthResult('autorizado')
                toast.success('Solicitação enviada com sucesso!')
                setLoading(false)
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } }
            const message = axiosError?.response?.data?.message ?? 'Erro ao solicitar autorização. Tente novamente.'
            toast.error(message)
            setAuthStatus(null)
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <PageHeader
                title="Nova Autorização"
                subtitle="Solicite autorização de procedimentos aos convênios."
            />

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-primary text-lg">Dados da Solicitação</CardTitle>
                        <CardDescription>Preencha os dados do paciente e procedimento</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="patientId">ID do Paciente</Label>
                                <Input
                                    id="patientId"
                                    placeholder="UUID do paciente"
                                    {...register('patientId')}
                                    className={errors.patientId ? 'border-danger focus-visible:ring-danger' : ''}
                                />
                                {errors.patientId && <p className="text-xs text-danger">{errors.patientId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="doctorId">Médico Solicitante</Label>
                                <Select onValueChange={(v) => setValue('doctorId', v)}>
                                    <SelectTrigger id="doctorId" className={errors.doctorId ? 'border-danger' : ''}>
                                        <SelectValue placeholder="Selecione o médico..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(d => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name} {d.specialty ? `— ${d.specialty}` : ''} (CRM: {d.crm})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.doctorId && <p className="text-xs text-danger">{errors.doctorId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="insuranceConfigId">Convênio</Label>
                                <Select onValueChange={(v) => setValue('insuranceConfigId', v)}>
                                    <SelectTrigger id="insuranceConfigId" className={errors.insuranceConfigId ? 'border-danger' : ''}>
                                        <SelectValue placeholder="Selecione o convênio..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {insurances.map(ins => (
                                            <SelectItem key={ins.id} value={ins.id}>
                                                {ins.operatorName} (ANS: {ins.operatorAnscode}) — {ins.environment}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.insuranceConfigId && <p className="text-xs text-danger">{errors.insuranceConfigId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="procedureCode">Código do Procedimento (CBHPM/TUSS)</Label>
                                <Input
                                    id="procedureCode"
                                    placeholder="ex: 10101012"
                                    {...register('procedureCode')}
                                    className={errors.procedureCode ? 'border-danger focus-visible:ring-danger' : ''}
                                />
                                {errors.procedureCode && <p className="text-xs text-danger">{errors.procedureCode.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cid">CID-10 <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                                <Input
                                    id="cid"
                                    placeholder="ex: J02"
                                    {...register('cid')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Anexar Pedido Médico <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                                <FileUploader
                                    onUpload={() => { }}
                                    maxFiles={2}
                                    accept={{ "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] }}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secondary text-white hover:bg-secondary/90"
                            >
                                {loading ? 'Enviando Solicitação...' : 'Solicitar Autorização'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {authStatus && (
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-primary text-lg">Andamento da Autorização</CardTitle>
                            <CardDescription>Acompanhamento em tempo real</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                            <AuthorizationTracker status={authStatus} result={authResult} />

                            {authStatus === 'resultado' && authResult === 'autorizado' && authId && (
                                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-xs text-muted-foreground mb-1">ID da Autorização</p>
                                    <p className="font-mono text-sm text-primary break-all">{authId}</p>
                                    <Button variant="outline" className="mt-4" onClick={() => window.print()}>
                                        Imprimir Comprovante
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
