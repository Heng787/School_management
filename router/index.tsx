import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// We import the pages to configure the standard route tree
import App from '../App';
import DashboardPage from '../pages/DashboardPage';
import StudentsPage from '../pages/StudentsPage';
import TeachersPage from '../pages/TeachersPage';
import ClassesPage from '../pages/ClassesPage';
import ReportsPage from '../pages/ReportsPage';
import SchedulePage from '../pages/SchedulePage';
import SettingsPage from '../pages/SettingsPage';
import LoginPage from '../pages/LoginPage';

/**
 * React Router Configuration.
 * 
 * Note: As requested, this router is NOT applied to App.tsx yet.
 * When you are ready to transition to React Router:
 * 1. Go to src/index.tsx and wrap your app with:
 *    <RouterProvider router={router} />
 * 2. In App.tsx, replace the `renderPage()` logic with an `<Outlet />` element.
 * 3. Update all your `navigate(Page.Dashboard)` calls to use `const navigate = useNavigate()` instead.
 */
export const router = createBrowserRouter([
    {
        path: '/',
        // If you apply this router, App will act as the layout shell
        element: <App />,
        children: [
            { path: 'dashboard', element: <DashboardPage navigate={() => { }} /> },
            { path: 'students', element: <StudentsPage /> },
            { path: 'staff', element: <TeachersPage /> },
            { path: 'classes', element: <ClassesPage /> },
            { path: 'reports', element: <ReportsPage /> },
            { path: 'schedule', element: <SchedulePage /> },
            // To properly handle currentUser.role and logout inside SettingsPage, those props or context can be injected via Context Provider instead of direct prop drilling if preferred.
            { path: 'settings', element: <SettingsPage onLogout={() => { }} userRole={'admin'} /> },

            // Default redirect
            { index: true, element: <Navigate to="/dashboard" replace /> }
        ]
    },
    {
        // Login route outside the main App layout wrapper
        path: '/login',
        element: <LoginPage onLogin={() => { }} />
    }
]);
