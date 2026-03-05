import { useQuery } from '@tanstack/react-query'

import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Plus, Eye, FileText } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { BillingGuide } from '@/types/api'

export default function BillingGuides() {
    // In a real app, this would be paginated
    // For now, we'll assume a list return or adapt the service
    const { data: guides, isLoading } = useQuery({
        queryKey: ['billing-guides'],
        queryFn: async () => {
            // Mocking a list response since service currently only has 'create'
            // In a real scenario, we'd add 'list' to billingService
            return [] as BillingGuide[]
        },
    })

    const columns: ColumnDef<BillingGuide>[] = [
        {
            accessorKey: 'guideNumber',
            header: 'Nº da Guia',
            cell: ({ row }) => row.original.guideNumber || '—',
        },
        {
            accessorKey: 'guideType',
            header: 'Tipo',
        },
        {
            accessorKey: 'totalValue',
            header: 'Valor Total',
            cell: ({ row }) => {
                const val = row.original.totalValue
                return val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val) : '—'
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status.toLowerCase() as any} />,
        },
        {
            id: 'actions',
            cell: () => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <FileText className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Guias de Faturamento"
                subtitle="Gerenciamento de guias TISS geradas"
                action={
                    <Button className="bg-secondary hover:bg-secondary/90 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Nova Guia Manual
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={guides || []}
                loading={isLoading}
                searchKey="guideNumber"
                searchPlaceholder="Buscar por número da guia..."
            />
        </div>
    )
}
