import { useAuth } from "react-oidc-context";

export function UserInfo() {
    const auth = useAuth();

    if (!auth.user) return null;

    console.log(auth.user)

    return (
        <pre>
            {JSON.stringify(
                {
                    name: auth.user.profile.name,
                    email: auth.user.profile.email,
                    subject: auth.user.profile.sub,
                },
                null,
                2,
            )}
        </pre>
    );
}