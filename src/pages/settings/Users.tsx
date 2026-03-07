import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Shield, Edit, Send } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'

// Mock user type since there is no specific userService.list yet
interface UserListItem {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR'
    active: boolean
}

const initialMockUsers: UserListItem[] = [
    { id: '1', name: 'Admin Principal', email: 'admin@raac.com.br', role: 'ADMIN', active: true },
    { id: '2', name: 'Recepcionista 1', email: 'recepcao@raac.com.br', role: 'RECEPTIONIST', active: true },
]

export default function UserSettings() {
    const [users, setUsers] = useState<UserListItem[]>(initialMockUsers)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
    const [formData, setFormData] = useState<Partial<UserListItem>>({})

    const handleOpenDialog = (user?: UserListItem) => {
        if (user) {
            setEditingUser(user)
            setFormData({ ...user })
        } else {
            setEditingUser(null)
            setFormData({ active: true, role: 'RECEPTIONIST' })
        }
        setIsDialogOpen(true)
    }

    const handleSave = () => {
        if (!formData.name || !formData.email) {
            toast.error('Preencha os campos obrigatórios')
            return
        }

        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } as UserListItem : u))
            toast.success('Usuário atualizado com sucesso (Mock)')
        } else {
            const newUser: UserListItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: formData.name!,
                email: formData.email!,
                role: formData.role as 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR',
                active: formData.active ?? true,
            }
            setUsers([...users, newUser])
            toast.success('Usuário criado com sucesso (Mock)')
        }
        setIsDialogOpen(false)
    }



    const handleResetSenha = (email: string) => {
        toast.success(`Link de redefinição de senha enviado para ${email}`)
    }

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
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">

                    <Button variant="ghost" size="sm" title="Editar Usuário" onClick={() => handleOpenDialog(row.original)}>
                        <Edit className="w-4 h-4 mr-2 text-primary" />
                        Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" title="Resetar Senha" onClick={() => handleResetSenha(row.original.email)}>
                        <Send className="w-4 h-4 mr-2" />
                        Reset Senha
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
                    <Button className="bg-secondary hover:bg-secondary/90 text-white" onClick={() => handleOpenDialog()}>
                        <Plus className="w-4 h-4 mr-2" /> Novo Usuário
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={users}
                loading={false}
                searchKey="name"
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome *</Label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nome completo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>E-mail *</Label>
                            <Input
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@raac.com.br"
                                type="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Perfil</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v: UserListItem['role']) => setFormData({ ...formData, role: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                    <SelectItem value="RECEPTIONIST">Recepcionista</SelectItem>
                                    <SelectItem value="DOCTOR">Médico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <div className="space-y-0.5">
                                <Label>Status do Usuário</Label>
                                <p className="text-sm text-muted-foreground">
                                    Usuários inativos não podem acessar o sistema
                                </p>
                            </div>
                            <Switch
                                checked={formData.active}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, active: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
