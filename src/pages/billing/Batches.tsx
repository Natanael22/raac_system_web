import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billingService } from '@/services/billingService'
import { insuranceConfigService } from '@/services/insuranceConfigService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { BillingBatch } from '@/types/api'
import { useState } from 'react'
import { toast } from 'sonner'


export default function BillingBatches() {
    const queryClient = useQueryClient()
    const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>('')

    const { data: batches, isLoading } = useQuery({
        queryKey: ['billing-batches'],
        queryFn: async () => {
            // Mocking list for now as service only has create/validate/submit
            return [] as BillingBatch[]
        },
    })

    const { data: insurancesPage } = useQuery({
        queryKey: ['insurance-configs'],
        queryFn: () => insuranceConfigService.list({ size: 100 }),
    })

    const createBatchMutation = useMutation({
        mutationFn: (data: { insuranceConfigId: string; month: number; year: number }) =>
            billingService.createBatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing-batches'] })
            toast.success('Lote criado com sucesso!')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar lote.')
        }
    })

    const submitBatchMutation = useMutation({
        mutationFn: (id: string) => billingService.submitBatch(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing-batches'] })
            toast.success('Lote enviado com sucesso!')
        },
    })

    const handleCreateBatch = () => {
        if (!selectedInsuranceId) {
            toast.error('Selecione um convênio.')
            return
        }

        const now = new Date()
        createBatchMutation.mutate({
            insuranceConfigId: selectedInsuranceId,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
        })
    }

    const columns: ColumnDef<BillingBatch>[] = [
        {
            accessorKey: 'id',
            header: 'ID do Lote',
            cell: ({ row }) => <span className="font-mono text-xs">{row.original.id.substring(0, 8)}...</span>,
        },
        {
            id: 'competence',
            header: 'Competência',
            cell: ({ row }) => `${row.original.competenceMonth}/${row.original.competenceYear}`,
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
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    {row.original.status === 'CRIADO' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-secondary border-secondary/20 hover:bg-secondary/10"
                            onClick={() => submitBatchMutation.mutate(row.original.id)}
                            disabled={submitBatchMutation.isPending}
                        >
                            <Send className="w-4 h-4 mr-2" /> Enviar
                        </Button>
                    )}
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Lotes de Faturamento"
                subtitle="Fechamento e envio de XML TISS para operadoras"
            />

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Novo Fechamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Convênio</Label>
                            <Select value={selectedInsuranceId} onValueChange={setSelectedInsuranceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o convênio..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {insurancesPage?.content.map(ins => (
                                        <SelectItem key={ins.id} value={ins.id}>{ins.operatorName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full bg-secondary text-white hover:bg-secondary/90"
                            onClick={handleCreateBatch}
                            disabled={createBatchMutation.isPending}
                        >
                            {createBatchMutation.isPending ? 'Criando...' : 'Gerar Novo Lote'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <DataTable
                        columns={columns}
                        data={batches || []}
                        loading={isLoading}
                    />
                </Card>
            </div>
        </div>
    )
}
