import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { toast } from 'sonner'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
    tenantId: z.string().uuid('ID do tenant inválido (deve ser UUID)').optional().or(z.literal('')),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginForm) => {
        setLoading(true)

        try {
            const tenantId = data.tenantId && data.tenantId.trim() !== '' ? data.tenantId : undefined

            const response = await authService.login(
                { email: data.email, password: data.password, tenantId },
                tenantId
            )

            const { user, accessToken } = response

            // Determine role mapping from API enum to our internal types
            const roleMap: Record<string, 'admin' | 'atendente' | 'medico'> = {
                ADMIN: 'admin',
                MEDICO: 'medico',
                ATENDENTE: 'atendente',
                FATURAMENTO: 'atendente',
            }

            login(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: roleMap[user.role] ?? 'atendente',
                },
                accessToken,
                user.tenantId,
                [user.role],  // Use raw role from API as permission
                response.refreshToken   // persiste o refresh token também
            )

            toast.success(`Bem-vindo, ${user.name}!`)
            navigate('/dashboard')
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } }
            const message = axiosError?.response?.data?.message ?? 'Email ou senha inválidos. Tente novamente.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-light p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="bg-primary p-3 rounded-full shadow-lg">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-primary">RAAC System</CardTitle>
                        <CardDescription>
                            Insira suas credenciais para acessar o sistema
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Seu email corporativo"
                                    autoComplete="email"
                                    {...register('email')}
                                    className={errors.email ? 'border-danger focus-visible:ring-danger' : ''}
                                />
                                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2 text-left">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Senha</Label>
                                    <a href="#" className="text-xs text-secondary hover:underline">Esqueceu a senha?</a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    {...register('password')}
                                    className={errors.password ? 'border-danger focus-visible:ring-danger' : ''}
                                />
                                {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-2 text-left">
                                <Label htmlFor="tenantId" className="text-neutral-dark">
                                    Tenant ID <span className="text-xs font-normal">(opcional)</span>
                                </Label>
                                <Input
                                    id="tenantId"
                                    type="text"
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    {...register('tenantId')}
                                    className={errors.tenantId ? 'border-danger focus-visible:ring-danger' : ''}
                                />
                                {errors.tenantId && <p className="text-xs text-danger">{errors.tenantId.message}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-3">
                            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
