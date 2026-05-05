import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/useAccessToken";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/lib/api/types";

const apiRoute = "/api/me"

type MeResponse = ApiResponse<typeof apiRoute, "get">

function getMe(accessToken: string) {
    return apiClient<MeResponse>(apiRoute, { accessToken });
}

export function MeExample() {
    const accessToken = useAccessToken();

    const meQuery = useQuery({
        queryKey: ["me"],
        queryFn: () => getMe(accessToken!),
        enabled: Boolean(accessToken),
    });

    if (!accessToken) return <p>No access token found.</p>;

    if (meQuery.isLoading) return <p>Loading user...</p>;

    if (meQuery.isError) {
        return <p>Failed to load user: {meQuery.error.message}</p>;
    }

    return <pre>{JSON.stringify(meQuery.data, null, 2)}</pre>;
}
