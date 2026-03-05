import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Plus, Shield, UserCog } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

// Mock user type since there is no specific userService.list yet
interface UserListItem {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR'
    active: boolean
}

const mockUsers: UserListItem[] = [
    { id: '1', name: 'Admin Principal', email: 'admin@raac.com.br', role: 'ADMIN', active: true },
    { id: '2', name: 'Recepcionista 1', email: 'recepcao@raac.com.br', role: 'RECEPTIONIST', active: true },
]

export default function UserSettings() {
    const columns: ColumnDef<UserListItem>[] = [
        {
            accessorKey: 'name',
            header: 'Nome',
        },
        {
            accessorKey: 'email',
            header: 'E-mail',
        },
        {
            accessorKey: 'role',
            header: 'Perfil',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-muted-foreground" />
                    {row.original.role}
                </div>
            )
        },
        {
            accessorKey: 'active',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.active ? 'active' : 'inactive'} />
        },
        {
            id: 'actions',
            cell: () => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                        <UserCog className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Usuários do Sistema"
                subtitle="Controle de acesso e permissões (RBAC)"
                action={
                    <Button className="bg-secondary hover:bg-secondary/90 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Novo Usuário
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={mockUsers}
                loading={false}
                searchKey="name"
            />
        </div>
    )
}
