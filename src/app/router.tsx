import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/shared/AppShell'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import PatientsList from '@/pages/patients/List'
import PatientNew from '@/pages/patients/New'
import PatientDetail from '@/pages/patients/Detail'
import NewAuthorization from '@/pages/authorizations/New'
import WaitingRoom from '@/pages/waiting-room/WaitingRoom'
import Appointments from '@/pages/appointments/Appointments'

import PatientRecords from '@/pages/medical-records/PatientRecords'
import NewEvolution from '@/pages/medical-records/NewEvolution'
import BillingGuides from '@/pages/billing/Guides'
import BillingBatches from '@/pages/billing/Batches'
import InsuranceSettings from '@/pages/settings/Insurances'
import UserSettings from '@/pages/settings/Users'

const Placeholder = ({ title }: { title: string }) => (
    <div className="p-8 flex items-center justify-center">
        <h1 className="text-2xl font-bold">{title}</h1>
    </div>
)

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/',
        element: <AppShell />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'patients',
                children: [
                    { index: true, element: <PatientsList /> },
                    { path: 'new', element: <PatientNew /> },
                    { path: ':id', element: <PatientDetail /> },
                    {
                        path: ':id/records',
                        children: [
                            { index: true, element: <PatientRecords /> },
                            { path: 'new', element: <NewEvolution /> },
                        ]
                    },
                ]
            },
            {
                path: 'records/new',
                element: <Placeholder title="New Patient Record" />,
            },
            {
                path: 'appointments',
                element: <Appointments />,
            },
            {
                path: 'waiting-room',
                element: <WaitingRoom />,
            },
            {
                path: 'authorizations/new',
                element: <NewAuthorization />,
            },
            {
                path: 'billing',
                children: [
                    { path: 'guides', element: <BillingGuides /> },
                    { path: 'batches', element: <BillingBatches /> },
                    { path: 'reports', element: <Placeholder title="Billing Reports" /> },
                ]
            },
            {
                path: 'settings',
                children: [
                    { path: 'insurances', element: <InsuranceSettings /> },
                    { path: 'users', element: <UserSettings /> },
                ]
            },
        ]
    },
    {
        path: '/unauthorized',
        element: <Placeholder title="Unauthorized - 403" />,
    },
    {
        path: '*',
        element: <Placeholder title="Not Found - 404" />,
    }
])
