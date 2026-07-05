import { useAuth } from 'react-oidc-context';

export function useAccessToken() {
    const auth = useAuth();

    return auth.user?.access_token ?? null;
}
