import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { doctorService } from '@/services/doctorService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ColumnDef } from '@tanstack/react-table'
import type { DoctorResponse } from '@/types/api'

export default function DoctorsList() {
    const navigate = useNavigate()
    const [page, setPage] = useState(0)
    const pageSize = 15
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['doctors', page],
        queryFn: () => doctorService.list({ page, size: pageSize }),
        staleTime: 5 * 60_000,
    })

    const handleOpenDialog = (doctor: DoctorResponse) => {
        setSelectedDoctor(doctor)
    }

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
                            title="Ver detalhes"
                            onClick={() => handleOpenDialog(row.original)}
                        >
                            <Eye className="w-4 h-4 mr-2 text-primary" />
                            Ver
                        </Button>
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

            {/* Dialog de Visualização do Médico */}
            <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Dados do Médico</DialogTitle>
                    </DialogHeader>
                    {selectedDoctor && (
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Nome</p>
                                    <p className="font-semibold text-base">{selectedDoctor.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">CRM</p>
                                    <p className="font-medium">{selectedDoctor.crm}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">UF CRM</p>
                                    <p className="font-medium">{selectedDoctor.ufCrm || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Especialidade</p>
                                    <p className="font-medium">{selectedDoctor.specialty || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">RQE</p>
                                    <p className="font-medium">{selectedDoctor.rqe || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                                    <p className="font-medium">{selectedDoctor.status || '—'}</p>
                                </div>
                            </div>
                            <div className="pt-3 flex justify-end">
                                <Button size="sm" onClick={() => navigate(`/settings/doctors/${selectedDoctor.id}`)}>
                                    Editar Cadastro
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
