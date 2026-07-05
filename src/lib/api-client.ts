import { getRequiredConfigValue } from '@/config/runtime-config';

const API_BASE_URL = getRequiredConfigValue('API_BASE_URL');

type ApiOptions<TRequest> = Omit<RequestInit, 'body'> & {
    accessToken?: string | null;
    body?: TRequest;
};

export async function apiClient<TResponse, TRequest = unknown>(
    path: string,
    options: ApiOptions<TRequest> = {}
): Promise<TResponse> {
    const { accessToken, headers, body, ...requestOptions } = options;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...requestOptions,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
}
