import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Menu, Bell, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppShell() {
    const { sidebarOpen } = useUiStore()
    const { user, tenant } = useAuthStore()

    // For mobile drawer
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-neutral-light flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:hidden",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <main
                className={cn(
                    'flex-1 flex flex-col transition-all duration-300',
                    'md:ml-20',
                    sidebarOpen ? 'md:ml-64' : 'md:ml-20'
                )}
            >
                <header className="h-16 bg-white border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center">
                        <button
                            className="p-2 -ml-2 mr-2 rounded-md focus:outline-none md:hidden"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={24} className="text-primary" />
                        </button>
                        <div className="text-sm text-neutral-dark hidden sm:block">
                            Tenant: <span className="font-semibold">{tenant || 'Clínica Demo'}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-neutral-dark hover:text-primary transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="flex items-center space-x-2 border-l border-neutral-200 pl-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-semibold text-primary">{user?.name || 'Administrador'}</span>
                                <span className="text-xs text-neutral-dark capitalize">{user?.role || 'admin'}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <UserIcon size={18} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-6 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
