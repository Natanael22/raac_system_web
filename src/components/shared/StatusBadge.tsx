import { Badge } from '@/components/ui/badge'

export type Status = 'pendente' | 'autorizado' | 'negado' | 'em_analise'

interface StatusBadgeProps {
    status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const statusConfig = {
        pendente: { label: 'Pendente', className: 'bg-warning hover:bg-warning/80 text-white border-transparent' },
        autorizado: { label: 'Autorizado', className: 'bg-success hover:bg-success/80 text-white border-transparent' },
        negado: { label: 'Negado', className: 'bg-danger hover:bg-danger/80 text-white border-transparent' },
        em_analise: { label: 'Em Análise', className: 'bg-secondary hover:bg-secondary/80 text-white border-transparent' }
    }

    const { label, className } = statusConfig[status] || statusConfig.pendente

    return <Badge className={className}>{label}</Badge>
}
