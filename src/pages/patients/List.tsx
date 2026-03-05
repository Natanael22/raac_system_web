import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { patientService } from '@/services/patientService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Plus, Eye } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { PatientResponse } from '@/types/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useNavigate } from 'react-router-dom'

export default function PatientsList() {
    const navigate = useNavigate()
    const [page, setPage] = useState(0)
    const pageSize = 15

    const { data, isLoading, isError } = useQuery({
        queryKey: ['patients', page],
        queryFn: () => patientService.list({ page, size: pageSize }),
        staleTime: 5 * 60_000,
    })

    const columns: ColumnDef<PatientResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Nome do Paciente',
        },
        {
            accessorKey: 'cpf',
            header: 'CPF',
            cell: ({ row }) => row.getValue('cpf') ?? <span className="text-muted-foreground">—</span>,
        },
        {
            accessorKey: 'prontuarioNumber',
            header: 'Prontuário',
            cell: ({ row }) => row.getValue('prontuarioNumber') ?? <span className="text-muted-foreground">—</span>,
        },
        {
            accessorKey: 'birthDate',
            header: 'Data de Nascimento',
            cell: ({ row }) => {
                const dateStr = row.getValue('birthDate') as string
                if (!dateStr) return <span className="text-muted-foreground">—</span>
                try {
                    return format(new Date(dateStr + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })
                } catch {
                    return dateStr
                }
            },
        },
        {
            accessorKey: 'phone',
            header: 'Telefone',
            cell: ({ row }) => row.getValue('phone') ?? <span className="text-muted-foreground">—</span>,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Ver detalhes"
                            onClick={() => navigate(`/patients/${row.original.id}`)}
                        >
                            <Eye className="w-4 h-4 text-primary" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    if (isError) {
        return (
            <div className="space-y-6">
                <PageHeader title="Pacientes" />
                <div className="p-6 border rounded-lg border-danger/30 bg-danger/5 text-danger text-sm">
                    Erro ao carregar pacientes. Verifique sua conexão com o servidor.
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pacientes"
                subtitle={data ? `${data.totalElements} paciente(s) encontrado(s)` : 'Gerenciamento de pacientes'}
                action={
                    <Button
                        className="bg-secondary hover:bg-secondary/90 text-white"
                        onClick={() => navigate('/patients/new')}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Novo Paciente
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={data?.content ?? []}
                loading={isLoading}
                searchKey="name"
                searchPlaceholder="Buscar por nome, CPF ou prontuário..."
            />

            {/* Manual pagination controls (server-side) */}
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
