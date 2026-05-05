import type { ChangeEventHandler } from "react";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useAccessToken } from "@/features/auth/hooks/useAccessToken";
import type { ApiRequest, ApiResponse } from "@/lib/api/types";
import { apiClient } from "@/lib/apiClient";

const apiRoute = "/api/channels";

type ChannelRequest = ApiRequest<typeof apiRoute, "post">;
type ChannelResponse = ApiResponse<typeof apiRoute, "post">;

function addChannel(accessToken: string, request: ChannelRequest) {
    return apiClient<ChannelResponse, ChannelRequest>(apiRoute, {
        method: "POST",
        accessToken,
        body: request
    });
}

export function AddChannelForm() {
    const accessToken = useAccessToken();
    const [channelRequest, setChannelRequest] = useState<ChannelRequest | null>(null);

    const channelQuery = useQuery({
        queryKey: [apiRoute, channelRequest],
        queryFn: () => addChannel(accessToken!, channelRequest!),
        enabled: Boolean(accessToken && channelRequest),
    });

    const handleSubmit: ChangeEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const channelId = formData.get("channelId");

        setChannelRequest({
            channelId: typeof channelId === "string" && channelId.trim() !== "" ? channelId.trim() : undefined,
        });
    };

    if (!accessToken) return <p>No access token found.</p>;

    if (channelQuery.isPending && channelRequest) return <p>Adding channel...</p>;

    if (channelQuery.isError) {
        return <p>Failed to add channel: {channelQuery.error.message}</p>;
    }

    if (channelQuery.isSuccess) {
        return <pre>{JSON.stringify(channelQuery.data.commandId, null, 2)}</pre>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="channelUrl">Channel ID</label>
            <input id="channelId" name="channelId" type="string" placeholder="https://www.youtube.com/@channel" />
            <button type="submit">Add channel</button>
        </form>
    );
}
