import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface DateTimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export function DateTimePicker({ label, error, className, ...props }: DateTimePickerProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <Label htmlFor={props.id} className={cn(error && "text-danger")}>{label}</Label>}
            <Input
                type="datetime-local"
                className={cn(className, error && "border-danger focus-visible:ring-danger")}
                {...props}
            />
            {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>
    )
}
