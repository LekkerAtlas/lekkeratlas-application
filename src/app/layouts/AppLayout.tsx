import { AppNavbar } from '@/app/components/AppNavbar';
import { Outlet } from 'react-router';
import '@/app/layouts/app-layout.css';

export function AppLayout() {
    return (
        <div className="app-shell">
            <AppNavbar />

            <main className="app-content">
                <Outlet />
            </main>
        </div>
    );
}
