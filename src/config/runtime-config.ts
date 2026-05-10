export interface RuntimeAppConfig {
    AUTH_AUTHORITY?: string;
    AUTH_CLIENT_ID?: string;
    AUTH_REDIRECT_URI?: string;
    AUTH_POST_LOGOUT_REDIRECT_URI?: string;
    API_BASE_URL?: string;
}

declare global {
    var __APP_CONFIG__: RuntimeAppConfig | undefined;
}

type RuntimeConfigKey = keyof RuntimeAppConfig;

const runtimeConfig = globalThis.__APP_CONFIG__;

function getViteConfigValue(key: RuntimeConfigKey): string | undefined {
    return import.meta.env[`VITE_${key}`] as string | undefined;
}

export function getRequiredConfigValue(key: RuntimeConfigKey): string {
    const value = getOptionalConfigValue(key);

    if (!value) {
        throw new Error(
            `Missing configuration value: ${key}. ` +
            `Expected either runtime config value "${key}" or Vite env variable "VITE_${key}" to be defined.`,
        );
    }

    return value;
}

export function getOptionalConfigValue(key: RuntimeConfigKey): string | undefined {
    return runtimeConfig?.[key] ?? getViteConfigValue(key);
}