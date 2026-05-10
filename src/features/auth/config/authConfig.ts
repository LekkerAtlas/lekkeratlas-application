import type { AuthProviderProps } from "react-oidc-context";

declare global {

    var __APP_CONFIG__: RuntimeAppConfig | undefined;
}

interface RuntimeAppConfig {
    AUTH_AUTHORITY?: string;
    AUTH_CLIENT_ID?: string;
    AUTH_REDIRECT_URI?: string;
    AUTH_POST_LOGOUT_REDIRECT_URI?: string;
    API_BASE_URL?: string;
}

const runtimeConfig = globalThis.__APP_CONFIG__;

function requireConfigValue(
    key: string,
    runtimeValue?: string,
    viteValue?: string,
): string {
    const value = runtimeValue ?? viteValue;

    if (!value) {
        throw new Error(
            `Missing auth configuration value: ${key}. ` +
            "Expected either runtime config or Vite env variable to be defined.",
        );
    }

    return value;
}

export const authConfig: AuthProviderProps = {
    authority: requireConfigValue(
        "AUTH_AUTHORITY",
        runtimeConfig?.AUTH_AUTHORITY,
        import.meta.env.VITE_AUTH_AUTHORITY,
    ),

    client_id: requireConfigValue(
        "AUTH_CLIENT_ID",
        runtimeConfig?.AUTH_CLIENT_ID,
        import.meta.env.VITE_AUTH_CLIENT_ID,
    ),

    redirect_uri: requireConfigValue(
        "AUTH_REDIRECT_URI",
        runtimeConfig?.AUTH_REDIRECT_URI,
        import.meta.env.VITE_AUTH_REDIRECT_URI,
    ),

    post_logout_redirect_uri: requireConfigValue(
        "AUTH_POST_LOGOUT_REDIRECT_URI",
        runtimeConfig?.AUTH_POST_LOGOUT_REDIRECT_URI,
        import.meta.env.VITE_AUTH_POST_LOGOUT_REDIRECT_URI,
    ),

    response_type: "code",
    scope: "openid profile email",

    automaticSilentRenew: true,

    onSigninCallback: () => {
        globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
    },
};