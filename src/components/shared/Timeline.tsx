import type { ReactNode } from 'react'

export interface TimelineItem {
    id: string
    date: string
    title: string
    description?: string
    icon?: ReactNode
}

interface TimelineProps {
    items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
    return (
        <ol className="relative border-l border-neutral-200 ml-3">
            {items.map((item) => (
                <li key={item.id} className="mb-8 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-4 ring-neutral-light border border-neutral-200 text-secondary">
                        {item.icon}
                    </span>
                    <h3 className="flex items-center mb-1 text-base font-semibold text-primary">
                        {item.title}
                    </h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-neutral-dark">
                        {item.date}
                    </time>
                    {item.description && <p className="text-sm font-normal text-muted-foreground">{item.description}</p>}
                </li>
            ))}
        </ol>
    )
}
