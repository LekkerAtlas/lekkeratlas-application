import { useAuth } from "react-oidc-context";

export function LoginButton() {
    const auth = useAuth();

    if (auth.isLoading) return <button disabled>Loading...</button>;

    if (auth.isAuthenticated) {
        return (
            <button onClick={() => void auth.signoutRedirect()}>
                Logout
            </button>
        );
    }

    return (
        <button onClick={() => void auth.signinRedirect()}>
            Login
        </button>
    );
}