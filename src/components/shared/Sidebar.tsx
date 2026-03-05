import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Clock,
    FileCheck,
    Receipt,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/appointments', label: 'Agenda', icon: Calendar },
    { path: '/waiting-room', label: 'Sala de Espera', icon: Clock },
    { path: '/authorizations/new', label: 'Autorizações', icon: FileCheck },
    { path: '/billing/guides', label: 'Faturamento', icon: Receipt },
    { path: '/patients', label: 'Pacientes', icon: Users },
    { path: '/settings/users', label: 'Usuários', icon: Users },
    { path: '/settings/doctors', label: 'Médicos', icon: Users },
    { path: '/settings/insurances', label: 'Convênios', icon: Settings },
]

export function Sidebar() {
    const { sidebarOpen, toggleSidebar } = useUiStore()

    return (
        <aside
            className={cn(
                'fixed inset-y-0 left-0 bg-primary text-primary-foreground transition-all duration-300 z-50 flex flex-col',
                sidebarOpen ? 'w-64' : 'w-20'
            )}
        >
            <div className="flex items-center justify-between h-16 px-4 py-4 bg-primary/95 border-b border-white/10">
                {sidebarOpen ? (
                    <span className="text-lg font-bold tracking-wider truncate">RAAC System</span>
                ) : (
                    <span className="text-lg font-bold tracking-wider mx-auto">RS</span>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 hidden md:block" // Hidden on mobile, drawer handled differently
                >
                    {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.path} className="px-3">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center rounded-md px-3 py-2 text-sm transition-colors',
                                        isActive
                                            ? 'bg-secondary text-white'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white',
                                        !sidebarOpen && 'justify-center'
                                    )
                                }
                            >
                                <item.icon size={20} className={cn(sidebarOpen && 'mr-3')} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className={cn("text-xs text-white/50", !sidebarOpen && "text-center")}>
                    {sidebarOpen ? 'v1.0.0' : 'v1.0'}
                </div>
            </div>
        </aside>
    )
}
