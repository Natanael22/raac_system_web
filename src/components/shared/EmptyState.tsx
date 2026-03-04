import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    title: string
    description: string
    icon?: ReactNode
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-lg bg-neutral-light/50 border-neutral-200 border-dashed">
            {icon && <div className="mb-4 text-neutral-dark opacity-50">{icon}</div>}
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <p className="text-sm text-neutral-dark max-w-sm mt-1 mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="secondary">
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
