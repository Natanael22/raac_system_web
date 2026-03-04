import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/shared/AppShell'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import PatientsList from '@/pages/patients/List'
import PatientNew from '@/pages/patients/New'
import PatientDetail from '@/pages/patients/Detail'
import NewAuthorization from '@/pages/authorizations/New'

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
                    { path: ':id/records', element: <Placeholder title="Patient Records" /> },
                ]
            },
            {
                path: 'records/new',
                element: <Placeholder title="New Patient Record" />,
            },
            {
                path: 'appointments',
                element: <Placeholder title="Appointments Calendar" />,
            },
            {
                path: 'waiting-room',
                element: <Placeholder title="Waiting Room" />,
            },
            {
                path: 'authorizations/new',
                element: <NewAuthorization />,
            },
            {
                path: 'billing',
                children: [
                    { path: 'guides', element: <Placeholder title="Billing Guides" /> },
                    { path: 'batches', element: <Placeholder title="Billing Batches" /> },
                    { path: 'reports', element: <Placeholder title="Billing Reports" /> },
                ]
            },
            {
                path: 'settings',
                children: [
                    { path: 'insurance', element: <Placeholder title="Insurance Settings" /> },
                    { path: 'users', element: <Placeholder title="Users Settings" /> },
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
