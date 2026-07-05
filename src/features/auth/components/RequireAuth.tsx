import { useAuth } from 'react-oidc-context';

export function RequireAuth({ children }: React.PropsWithChildren) {
    const auth = useAuth();

    if (auth.isLoading) return <p>Loading session...</p>;

    if (auth.error) {
        console.log(`Auth error: ${auth.error.message}`);
        return <p>Auth error: {auth.error.message}</p>;
    }

    if (auth.isAuthenticated) {
        return <>{children}</>;
    }
}
