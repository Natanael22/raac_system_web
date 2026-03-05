import { Badge } from '@/components/ui/badge'

export type Status = 'pendente' | 'autorizado' | 'negado' | 'em_analise' | 'active' | 'inactive' | 'success' | 'warning' | 'danger' | 'info'

interface StatusBadgeProps {
    status: Status | string
    label?: string
}

export function StatusBadge({ status, label: customLabel }: StatusBadgeProps) {
    const s = status.toLowerCase()

    const statusConfig: Record<string, { label: string, className: string }> = {
        pendente: { label: 'Pendente', className: 'bg-warning hover:bg-warning/80 text-white border-transparent' },
        autorizado: { label: 'Autorizado', className: 'bg-success hover:bg-success/80 text-white border-transparent' },
        negado: { label: 'Negado', className: 'bg-danger hover:bg-danger/80 text-white border-transparent' },
        em_analise: { label: 'Em Análise', className: 'bg-secondary hover:bg-secondary/80 text-white border-transparent' },
        active: { label: 'Ativo', className: 'bg-success hover:bg-success/80 text-white border-transparent' },
        inactive: { label: 'Inativo', className: 'bg-neutral-400 hover:bg-neutral-500 text-white border-transparent' },
        success: { label: 'Sucesso', className: 'bg-success hover:bg-success/80 text-white border-transparent' },
        warning: { label: 'Aviso', className: 'bg-warning hover:bg-warning/80 text-white border-transparent' },
        danger: { label: 'Erro', className: 'bg-danger hover:bg-danger/80 text-white border-transparent' },
        info: { label: 'Info', className: 'bg-secondary hover:bg-secondary/80 text-white border-transparent' },
    }

    const config = statusConfig[s] || { label: s, className: 'bg-neutral-100 text-neutral-800' }
    const label = customLabel || config.label
    const className = config.className

    return <Badge className={className}>{label}</Badge>
}
