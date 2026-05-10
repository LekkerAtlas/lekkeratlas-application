/**
 * Specifies runtime values that differ per environment
 */

export { };

declare global {
    interface Window {
        __APP_CONFIG__: {
            AUTH_AUTHORITY: string;
            AUTH_CLIENT_ID: string;
            AUTH_REDIRECT_URI: string;
            AUTH_POST_LOGOUT_REDIRECT_URI: string;
        };
    }
}