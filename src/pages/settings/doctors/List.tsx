import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { doctorService } from '@/services/doctorService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Plus, Edit } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { DoctorResponse } from '@/types/api'

export default function DoctorsList() {
    const navigate = useNavigate()
    const [page, setPage] = useState(0)
    const pageSize = 15

    const { data, isLoading } = useQuery({
        queryKey: ['doctors', page],
        queryFn: () => doctorService.list({ page, size: pageSize }),
        staleTime: 5 * 60_000,
    })

    const columns: ColumnDef<DoctorResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Nome do Médico',
            cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>
        },
        {
            accessorKey: 'crm',
            header: 'CRM',
        },
        {
            accessorKey: 'specialty',
            header: 'Especialidade',
            cell: ({ row }) => row.getValue('specialty') ?? <span className="text-muted-foreground">—</span>,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            title="Editar Médico"
                            onClick={() => navigate(`/settings/doctors/${row.original.id}`)}
                        >
                            <Edit className="w-4 h-4 mr-2 text-primary" />
                            Editar
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Médicos"
                subtitle={data ? `${data.totalElements} profissional(is) cadastrado(s)` : 'Gerenciamento de corpo clínico'}
                onBack={() => navigate('/settings/users')}
                action={
                    <Button
                        className="bg-secondary hover:bg-secondary/90 text-white"
                        onClick={() => navigate('/settings/doctors/new')}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Novo Médico
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={data?.content ?? []}
                loading={isLoading}
                searchKey="name"
                searchPlaceholder="Buscar por nome ou CRM..."
            />

            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Página {data.number + 1} de {data.totalPages} · {data.totalElements} registros
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={data.first}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={data.last}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Próximo
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
