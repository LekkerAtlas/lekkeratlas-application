import { appPaths } from '@/config/paths';
import { LoginButton } from '@/features/auth/components/LoginButton';
import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router';

export function LoginRoute() {
    const auth = useAuth();

    if (auth.isLoading) {
        return <p>Loading session...</p>;
    }

    if (auth.error) {
        return <p>Auth error: {auth.error.message}</p>;
    }

    if (auth.isAuthenticated) {
        return <Navigate to={appPaths.videos} replace />;
    }

    return (
        <main>
            <h1>Sign in</h1>
            <p>Sign in to browse and manage your videos.</p>
            <LoginButton />
        </main>
    );
}
