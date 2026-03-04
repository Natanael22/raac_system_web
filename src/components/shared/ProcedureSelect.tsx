import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

const MOCK_PROCEDURES = [
    { value: '10101012', label: '10101012 - Consulta em consultório (no horário normal ou preestabelecido)' },
    { value: '10101020', label: '10101020 - Consulta em domicílio' },
    { value: '10101039', label: '10101039 - Consulta em pronto-socorro' },
    { value: '20104049', label: '20104049 - Eletrocardiograma de repouso' },
    { value: '30101069', label: '30101069 - Exérese de lesão de pele' },
    { value: '40804011', label: '40804011 - Radiografia de tórax (PA e Perfil)' },
]

interface ProcedureSelectProps {
    value?: string
    onChange: (value: string) => void
}

export function ProcedureSelect({ value, onChange }: ProcedureSelectProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal text-left h-auto min-h-10"
                >
                    {value
                        ? <span className="truncate pr-2">{MOCK_PROCEDURES.find((p) => p.value === value)?.label}</span>
                        : <span className="text-muted-foreground flex-auto">Selecione o procedimento (CBHPM/TUSS)...</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar procedimento..." />
                    <CommandList>
                        <CommandEmpty>Nenhum procedimento encontrado.</CommandEmpty>
                        <CommandGroup>
                            {MOCK_PROCEDURES.map((proc) => (
                                <CommandItem
                                    key={proc.value}
                                    value={proc.label}
                                    onSelect={() => {
                                        onChange(proc.value === value ? "" : proc.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            value === proc.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">{proc.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
