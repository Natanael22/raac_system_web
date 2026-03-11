import { useState } from 'react'
import { Check, ChevronsUpDown, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import type { PatientResponse } from '@/types/api'

interface PatientComboboxProps {
    patients: PatientResponse[]
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    hasError?: boolean
    placeholder?: string
}

export function PatientCombobox({
    patients,
    value,
    onChange,
    disabled,
    hasError,
    placeholder = 'Selecione o paciente...',
}: PatientComboboxProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const selected = patients.find(p => p.id === value)

    const filtered = patients.filter(p => {
        const q = search.toLowerCase()
        return (
            p.name.toLowerCase().includes(q) ||
            (p.cpf ?? '').toLowerCase().includes(q) ||
            (p.cns ?? '').toLowerCase().includes(q) ||
            (p.prontuarioNumber ?? '').toLowerCase().includes(q)
        )
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal text-left',
                        !selected && 'text-muted-foreground',
                        hasError && 'border-danger focus-visible:ring-danger'
                    )}
                >
                    {selected ? (
                        <span className="flex items-center gap-2 truncate">
                            <User className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{selected.name}</span>
                            {selected.cpf && (
                                <span className="text-xs text-muted-foreground shrink-0">({selected.cpf})</span>
                            )}
                        </span>
                    ) : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[320px]"
                align="start"
                sideOffset={4}
            >
                {/* Search input */}
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, CPF, CNS ou prontuário..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-8 border-0 p-0 shadow-none focus-visible:ring-0 text-sm"
                        autoFocus
                    />
                </div>

                {/* Patient list */}
                <div className="overflow-y-auto max-h-64">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Nenhum paciente encontrado
                        </div>
                    ) : (
                        <div>
                            {/* Header */}
                            <div className="grid grid-cols-[1fr_auto] px-3 py-1.5 border-b bg-muted/50">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome</span>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CPF</span>
                            </div>
                            {/* Rows */}
                            {filtered.map(patient => (
                                <button
                                    key={patient.id}
                                    type="button"
                                    className={cn(
                                        'w-full grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 text-sm text-left',
                                        'hover:bg-accent hover:text-accent-foreground transition-colors',
                                        patient.id === value && 'bg-primary/5'
                                    )}
                                    onClick={() => {
                                        onChange(patient.id)
                                        setSearch('')
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'h-3.5 w-3.5 text-primary shrink-0',
                                            patient.id === value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    <span className="truncate font-medium">{patient.name}</span>
                                    <span className="text-xs text-muted-foreground shrink-0 font-mono">
                                        {patient.cpf ?? '—'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with count */}
                <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
                    {filtered.length} paciente{filtered.length !== 1 ? 's' : ''}
                    {search && ` encontrado${filtered.length !== 1 ? 's' : ''}`}
                </div>
            </PopoverContent>
        </Popover>
    )
}
