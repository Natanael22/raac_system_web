import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insuranceConfigService } from '@/services/insuranceConfigService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, RefreshCcw, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ColumnDef } from '@tanstack/react-table'
import type { InsuranceConfigResponse } from '@/types/api'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function InsuranceSettings() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [selectedInsurance, setSelectedInsurance] = useState<InsuranceConfigResponse | null>(null)

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

    const handleOpenDialog = (insurance: InsuranceConfigResponse) => {
        setSelectedInsurance(insurance)
    }

    const handleTestConnection = (id: string) => {
        toast.info('Testando conexão com a operadora...')
        // TODO: implementar chamada de teste quando o endpoint estiver disponível
        console.log('Test connection for insurance config:', id)
    }

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
                <div className="flex justify-end gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Ver detalhes"
                        onClick={() => handleOpenDialog(row.original)}
                    >
                        <Eye className="w-4 h-4 mr-2 text-primary" />
                        Ver
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/settings/insurances/${row.original.id}`)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        title="Testar comunicação"
                        onClick={() => handleTestConnection(row.original.id)}
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Testar
                    </Button>
                </div>
            )
        }
    ]

    // suppress unused variable warning — deleteMutation kept for future use
    void deleteMutation

    return (
        <div className="space-y-6">
            <PageHeader
                title="Configurações de Convênios"
                subtitle="Gerencie os registros ANS e versões TISS das operadoras"
                action={
                    <Button
                        className="bg-secondary hover:bg-secondary/90 text-white"
                        onClick={() => navigate('/settings/insurances/new')}
                    >
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

            {/* Dialog de Visualização do Convênio */}
            <Dialog open={!!selectedInsurance} onOpenChange={(open) => !open && setSelectedInsurance(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Configuração de Convênio</DialogTitle>
                    </DialogHeader>
                    {selectedInsurance && (
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Operadora</p>
                                    <p className="font-semibold text-base">{selectedInsurance.operatorName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Código ANS</p>
                                    <p className="font-medium font-mono">{selectedInsurance.operatorAnscode}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Ambiente</p>
                                    <p className="font-medium">{selectedInsurance.environment}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">URL do Webservice</p>
                                    <p className="font-medium text-xs break-all">{selectedInsurance.webserviceUrl || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                                    <StatusBadge status={selectedInsurance.status === 'ACTIVE' ? 'active' : 'inactive'} />
                                </div>
                            </div>
                            <div className="pt-3 flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleTestConnection(selectedInsurance.id)}>
                                    <RefreshCcw className="w-4 h-4 mr-2" /> Testar Conexão
                                </Button>
                                <Button size="sm" onClick={() => navigate(`/settings/insurances/${selectedInsurance.id}`)}>
                                    Editar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
