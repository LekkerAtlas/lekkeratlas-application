import type { AuthProviderProps } from "react-oidc-context";
import { getRequiredConfigValue } from "@/config/runtime-config";

export const authConfig: AuthProviderProps = {
    authority: getRequiredConfigValue("AUTH_AUTHORITY"),
    client_id: getRequiredConfigValue("AUTH_CLIENT_ID"),
    redirect_uri: getRequiredConfigValue("AUTH_REDIRECT_URI"),
    post_logout_redirect_uri: getRequiredConfigValue("AUTH_POST_LOGOUT_REDIRECT_URI"),

    response_type: "code",
    scope: "openid profile email",

    automaticSilentRenew: true,

    onSigninCallback: () => {
        globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
    },
};