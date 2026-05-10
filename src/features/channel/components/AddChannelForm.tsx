import type { ChangeEventHandler } from "react";
import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import { useAccessToken } from "@/features/auth/hooks/useAccessToken";
import { ProgressQueryView } from "@/features/progress/components/ProgressQueryView";
import { isTerminalProgressStatus } from "@/features/progress/progressStatus";
import type { ProgressResponse } from "@/features/progress/progressTypes";
import type { ApiRequest, ApiResponse } from "@/lib/api/types";
import { apiClient } from "@/lib/apiClient";

const apiRoute = "/api/channels";

type ChannelRequest = ApiRequest<typeof apiRoute, "post">;
type ChannelResponse = ApiResponse<typeof apiRoute, "post">;

function addChannel(accessToken: string, request: ChannelRequest) {
    return apiClient<ChannelResponse, ChannelRequest>(apiRoute, {
        method: "POST",
        accessToken,
        body: request,
    });
}

function getProgress(accessToken: string, queueJobId: string) {
    return apiClient<ProgressResponse>(`/api/progress/${queueJobId}`, {
        method: "GET",
        accessToken,
    });
}

export function AddChannelForm() {
    const accessToken = useAccessToken();
    const [queueJobId, setQueueJobId] = useState<string | null>(null);

    const addChannelMutation = useMutation({
        mutationFn: (request: ChannelRequest) => addChannel(accessToken!, request),
        onSuccess: (response) => {
            setQueueJobId(response.queueJobId ?? null);
        },
    });

    const progressQuery = useQuery({
        queryKey: ["/api/progress/{queueJobId}", queueJobId],
        queryFn: () => getProgress(accessToken!, queueJobId!),
        enabled: Boolean(accessToken && queueJobId),
        refetchInterval: (query) => {
            return isTerminalProgressStatus(query.state.data?.progress) ? false : 500;
        },
    });

    const handleSubmit: ChangeEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const channelId = formData.get("channelId");

        const request = {
            channelId: typeof channelId === "string" && channelId.trim() !== "" ? channelId.trim() : undefined,
        };

        setQueueJobId(null);
        addChannelMutation.mutate(request);
    };

    if (!accessToken) return <p>No access token found.</p>;

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="space-y-2">
                    <label htmlFor="channelId" className="block text-sm font-medium">
                        Channel ID
                    </label>

                    <input
                        id="channelId"
                        name="channelId"
                        type="text"
                        placeholder="https://www.youtube.com/@channel"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={addChannelMutation.isPending}
                    className="mt-4 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                    {addChannelMutation.isPending ? "Adding channel..." : "Add channel"}
                </button>

                {addChannelMutation.isError && (
                    <p className="mt-3 text-sm text-red-600">
                        Failed to add channel: {addChannelMutation.error.message}
                    </p>
                )}
            </form>

            {queueJobId && <ProgressQueryView query={progressQuery} />}
        </div>
    );
}