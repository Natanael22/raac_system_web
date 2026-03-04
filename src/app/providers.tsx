import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60_000, // 5 minutes by default
        },
    },
})

interface ProvidersProps {
    children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    )
}
