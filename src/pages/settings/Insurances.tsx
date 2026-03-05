import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insuranceConfigService } from '@/services/insuranceConfigService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { InsuranceConfigResponse } from '@/types/api'
import { toast } from 'sonner'

export default function InsuranceSettings() {
    const queryClient = useQueryClient()

    const { data: insurancesPage, isLoading } = useQuery({
        queryKey: ['insurance-configs'],
        queryFn: () => insuranceConfigService.list({ page: 0, size: 100 }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => insuranceConfigService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurance-configs'] })
            toast.success('Configuração removida com sucesso.')
        },
        onError: () => {
            toast.error('Erro ao remover configuração.')
        }
    })

    const columns: ColumnDef<InsuranceConfigResponse>[] = [
        {
            accessorKey: 'operatorName',
            header: 'Operadora',
            cell: ({ row }) => <span className="font-semibold">{row.original.operatorName}</span>
        },
        {
            accessorKey: 'operatorAnscode',
            header: 'Registro ANS',
        },
        {
            accessorKey: 'environment',
            header: 'Ambiente',
        },
        {
            id: 'status',
            header: 'Status',
            cell: () => <StatusBadge status="active" />
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => {
                            if (confirm('Deseja realmente excluir esta configuração?')) {
                                deleteMutation.mutate(row.original.id)
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Configurações de Convênios"
                subtitle="Gerencie os registros ANS e versões TISS das operadoras"
                action={
                    <Button className="bg-secondary hover:bg-secondary/90 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Novo Convênio
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={insurancesPage?.content || []}
                loading={isLoading}
                searchKey="operatorName"
            />
        </div>
    )
}
