

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
    title: string
    subtitle?: string
    action?: React.ReactNode
    onBack?: () => void
}

export function PageHeader({ title, subtitle, action, onBack }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-4">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-full border border-neutral-200">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
            {action && (
                <div className="flex items-center gap-2">
                    {action}
                </div>
            )}
        </div>
    )
}
