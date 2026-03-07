import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientService } from '@/services/patientService'
import { patientInsuranceService } from '@/services/patientInsuranceService'
import type { PatientInsuranceRequest } from '@/services/patientInsuranceService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { PatientRequest } from '@/types/api'

// --- Schema do Paciente ---
const patientSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    cpf: z.string().optional(),
    cns: z.string().optional(),
    birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
    sex: z.enum(['MALE', 'FEMALE', 'OTHER'], {
        required_error: 'Sexo é obrigatório',
    }),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    prontuarioNumber: z.string().optional(),
    addressStreet: z.string().optional(),
    addressNumber: z.string().optional(),
    addressCity: z.string().optional(),
    addressState: z.string().optional(),
})

// --- Schema do Convênio (opcional) ---
const insuranceSchema = z.object({
    operatorName: z.string().optional(),
    cardNumber: z.string().optional(),
    plan: z.string().optional(),
    validity: z.string().optional(),
    accommodation: z.string().optional(),
})

type PatientForm = z.infer<typeof patientSchema>
type InsuranceForm = z.infer<typeof insuranceSchema>

export default function PatientNew() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<PatientForm>({ resolver: zodResolver(patientSchema) })

    const { register: registerInsurance } = useForm<InsuranceForm>({
        resolver: zodResolver(insuranceSchema),
    })

    const onSubmit = async (data: PatientForm) => {
        setLoading(true)
        try {
            const payload: PatientRequest = {
                name: data.name,
                birthDate: data.birthDate,
                sex: data.sex,
                cpf: data.cpf || undefined,
                cns: data.cns || undefined,
                phone: data.phone || undefined,
                email: data.email || undefined,
                prontuarioNumber: data.prontuarioNumber || undefined,
                addressStreet: data.addressStreet || undefined,
                addressNumber: data.addressNumber || undefined,
                addressCity: data.addressCity || undefined,
                addressState: data.addressState || undefined,
            }

            const newPatient = await patientService.create(payload)

            // Captura os campos do convênio diretamente do formulário HTML
            const form = document.querySelector('form') as HTMLFormElement
            const operatorName = (form?.elements.namedItem('operatorName') as HTMLInputElement)?.value
            const cardNumber = (form?.elements.namedItem('cardNumber') as HTMLInputElement)?.value

            // Salva o convênio apenas se o campo obrigatório (operadora) foi preenchido
            if (operatorName && cardNumber) {
                const insurancePayload: PatientInsuranceRequest = {
                    operatorName,
                    cardNumber,
                    plan: (form?.elements.namedItem('plan') as HTMLInputElement)?.value || undefined,
                    validity: (form?.elements.namedItem('validity') as HTMLInputElement)?.value || undefined,
                    accommodation: (form?.elements.namedItem('accommodation') as HTMLInputElement)?.value || undefined,
                    status: 'ACTIVE',
                }
                await patientInsuranceService.create(newPatient.id, insurancePayload)
            }

            toast.success('Paciente cadastrado com sucesso!')
            navigate(`/patients/${newPatient.id}`)
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } }
            const message = axiosError?.response?.data?.message ?? 'Erro ao cadastrar paciente.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title="Novo Paciente"
                subtitle="Cadastro de novo paciente no sistema"
                onBack={() => navigate('/patients')}
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* ── Dados Pessoais ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-primary text-lg">Dados Pessoais</CardTitle>
                        <CardDescription>Informações básicas do paciente</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name">Nome Completo *</Label>
                            <Input
                                id="name"
                                placeholder="Ex: João da Silva"
                                {...register('name')}
                                className={errors.name ? 'border-danger' : ''}
                            />
                            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" placeholder="000.000.000-00" {...register('cpf')} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cns">CNS (Cartão Nacional de Saúde)</Label>
                            <Input id="cns" placeholder="000 0000 0000 0000" {...register('cns')} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthDate">Data de Nascimento *</Label>
                            <Input
                                id="birthDate"
                                type="date"
                                {...register('birthDate')}
                                className={errors.birthDate ? 'border-danger' : ''}
                            />
                            {errors.birthDate && <p className="text-xs text-danger">{errors.birthDate.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sex">Sexo *</Label>
                            <Select onValueChange={(v) => setValue('sex', v as PatientForm['sex'])}>
                                <SelectTrigger className={errors.sex ? 'border-danger' : ''}>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Masculino</SelectItem>
                                    <SelectItem value="FEMALE">Feminino</SelectItem>
                                    <SelectItem value="OTHER">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.sex && <p className="text-xs text-danger">{errors.sex.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" placeholder="(00) 00000-0000" {...register('phone')} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="paciente@email.com"
                                {...register('email')}
                                className={errors.email ? 'border-danger' : ''}
                            />
                            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prontuarioNumber">Nº do Prontuário Externo</Label>
                            <Input id="prontuarioNumber" placeholder="Opcional" {...register('prontuarioNumber')} />
                        </div>
                    </CardContent>

                    {/* ── Endereço ── */}
                    <CardHeader className="pt-0">
                        <CardTitle className="text-primary text-lg">Endereço</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="addressStreet">Rua/Logradouro</Label>
                            <Input id="addressStreet" {...register('addressStreet')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressNumber">Número</Label>
                            <Input id="addressNumber" {...register('addressNumber')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressCity">Cidade</Label>
                            <Input id="addressCity" {...register('addressCity')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressState">Estado (UF)</Label>
                            <Input
                                id="addressState"
                                placeholder="Ex: SP"
                                maxLength={2}
                                {...register('addressState')}
                            />
                        </div>
                    </CardContent>

                    {/* ── Convênio (opcional) ── */}
                    <CardHeader className="pt-0">
                        <CardTitle className="text-primary text-lg">Convênio</CardTitle>
                        <CardDescription>Opcional — preencha se o paciente possui plano de saúde</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="operatorName">Operadora</Label>
                            <Input
                                id="operatorName"
                                placeholder="Ex: Unimed, Bradesco Saúde"
                                {...registerInsurance('operatorName')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Número da Carteirinha</Label>
                            <Input
                                id="cardNumber"
                                placeholder="Ex: 0012345678901"
                                {...registerInsurance('cardNumber')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="plan">Plano</Label>
                            <Input
                                id="plan"
                                placeholder="Ex: Enfermaria Plus"
                                {...registerInsurance('plan')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accommodation">Acomodação</Label>
                            <Input
                                id="accommodation"
                                placeholder="Ex: Enfermaria, Apartamento"
                                {...registerInsurance('accommodation')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="validity">Validade do Plano</Label>
                            <Input
                                id="validity"
                                type="date"
                                {...registerInsurance('validity')}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-3 mt-4 bg-neutral-light/50 p-6 rounded-b-lg">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/patients')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-secondary text-white hover:bg-secondary/90 min-w-[150px]"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Paciente'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
