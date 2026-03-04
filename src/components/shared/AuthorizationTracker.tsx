import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AuthStatus = 'enviando' | 'aguardando' | 'resultado'
export type AuthResult = 'autorizado' | 'negado' | null

interface AuthorizationTrackerProps {
    status: AuthStatus
    result?: AuthResult
}

export function AuthorizationTracker({ status, result }: AuthorizationTrackerProps) {
    const steps = [
        { id: 'enviando', label: 'Enviando Guia' },
        { id: 'aguardando', label: 'Análise da Operadora' },
        { id: 'resultado', label: 'Resultado' }
    ]

    const currentStepIndex = steps.findIndex(s => s.id === status)

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            <div className="relative flex justify-between">
                {/* Connecting Lines */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 -z-10 -translate-y-1/2 rounded-full hidden sm:block"></div>
                <div
                    className="absolute top-1/2 left-0 h-1 bg-secondary -z-10 -translate-y-1/2 transition-all duration-500 rounded-full hidden sm:block"
                    style={{ width: `${Math.max(0, currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex

                    let Icon = isCompleted ? CheckCircle2 : (isCurrent ? Loader2 : Clock)
                    let iconColor = isCompleted ? 'text-success' : (isCurrent ? 'text-secondary animate-spin' : 'text-neutral-dark opacity-50')
                    let bgColor = isCompleted ? 'bg-success/10 border-success' : (isCurrent ? 'bg-secondary/10 border-secondary' : 'bg-white border-neutral-300')

                    // Handle final state
                    if (step.id === 'resultado' && isCurrent) {
                        if (result === 'autorizado') {
                            Icon = CheckCircle2
                            iconColor = 'text-success'
                            bgColor = 'bg-success/10 border-success'
                        } else if (result === 'negado') {
                            Icon = XCircle
                            iconColor = 'text-danger'
                            bgColor = 'bg-danger/10 border-danger'
                        }
                    }

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div className={cn(
                                "w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 transition-colors duration-300",
                                bgColor
                            )}>
                                <Icon size={24} className={iconColor} />
                            </div>
                            <span className={cn(
                                "text-sm font-medium text-center max-w-[120px]",
                                isCurrent ? "text-primary" : "text-neutral-dark opacity-70"
                            )}>
                                {step.label}
                            </span>
                            {step.id === 'resultado' && isCurrent && result && (
                                <span className={cn(
                                    "text-xs font-bold mt-1 uppercase",
                                    result === 'autorizado' ? "text-success" : "text-danger"
                                )}>
                                    {result}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
