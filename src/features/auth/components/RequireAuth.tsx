import { appPaths } from '@/config/paths';
import { useAuth } from 'react-oidc-context';
import { Navigate, Outlet } from 'react-router';

export function RequireAuth() {
    const auth = useAuth();

    if (auth.isLoading) {
        return <p>Loading session...</p>;
    }

    if (auth.error) {
        return <p>Auth error: {auth.error.message}</p>;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to={appPaths.login} replace />;
    }

    return <Outlet />;
}
