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

// Mock data, in a real app this would be fetched via React Query from backend
const MOCK_CID = [
    { value: 'J01', label: 'J01 - Sinusite aguda' },
    { value: 'J02', label: 'J02 - Faringite aguda' },
    { value: 'J03', label: 'J03 - Amigdalite aguda' },
    { value: 'J04', label: 'J04 - Laringite e traqueíte agudas' },
    { value: 'J06', label: 'J06 - Infecções agudas das vias aéreas superiores' },
    { value: 'A09', label: 'A09 - Diarreia e gastroenterite de origem presumivelmente infecciosa' },
    { value: 'K21', label: 'K21 - Doença de refluxo gastroesofágico' },
    { value: 'M54', label: 'M54 - Dorsalgia' },
]

interface CIDAutocompleteProps {
    value?: string
    onChange: (value: string) => void
}

export function CIDAutocomplete({ value, onChange }: CIDAutocompleteProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal text-left"
                >
                    {value
                        ? MOCK_CID.find((cid) => cid.value === value)?.label
                        : <span className="text-muted-foreground flex-auto">Selecione ou busque um CID-10...</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar por código ou descrição..." />
                    <CommandList>
                        <CommandEmpty>Nenhum CID encontrado.</CommandEmpty>
                        <CommandGroup>
                            {MOCK_CID.map((cid) => (
                                <CommandItem
                                    key={cid.value}
                                    value={cid.label}
                                    onSelect={() => {
                                        onChange(cid.value === value ? "" : cid.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            value === cid.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {cid.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
