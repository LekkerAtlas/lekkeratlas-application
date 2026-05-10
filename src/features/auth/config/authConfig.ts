import type { AuthProviderProps } from "react-oidc-context";

export const authConfig: AuthProviderProps = {
    authority: import.meta.env.VITE_AUTH_AUTHORITY,
    client_id: import.meta.env.VITE_AUTH_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_AUTH_REDIRECT_URI,
    post_logout_redirect_uri: import.meta.env.VITE_AUTH_POST_LOGOUT_REDIRECT_URI,

    response_type: "code",
    scope: "openid profile email",

    automaticSilentRenew: true,

    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
    },
};