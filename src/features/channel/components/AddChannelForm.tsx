import type { ChangeEventHandler } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useAccessToken } from '@/features/auth/hooks/useAccessToken';
import type { ApiRequest, ApiResponse } from '@/lib/api/types';
import { apiClient } from '@/lib/api-client';

const apiRoute = '/api/channels';

type ChannelRequest = ApiRequest<typeof apiRoute, 'post'>;
type ChannelResponse = ApiResponse<typeof apiRoute, 'post'>;

type AddChannelFormProps = {
    onAccepted: (queueJobId: string) => void;
    onSubmitting?: () => void;
};

function addChannel(accessToken: string, request: ChannelRequest) {
    return apiClient<ChannelResponse, ChannelRequest>(apiRoute, {
        method: 'POST',
        accessToken,
        body: request,
    });
}

export function AddChannelForm({
    onAccepted,
    onSubmitting,
}: Readonly<AddChannelFormProps>) {
    const accessToken = useAccessToken();

    const addChannelMutation = useMutation({
        mutationFn: (request: ChannelRequest) =>
            addChannel(accessToken!, request),
        onSuccess: (response) => {
            if (response.queueJobId) {
                onAccepted(response.queueJobId);
            }
        },
    });

    const handleSubmit: ChangeEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const channelId = formData.get('channelId');

        const request: ChannelRequest = {
            channelId:
                typeof channelId === 'string' && channelId.trim() !== ''
                    ? channelId.trim()
                    : undefined,
        };

        onSubmitting?.();
        addChannelMutation.mutate(request);
    };

    if (!accessToken) return <p>No access token found.</p>;

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-xl border bg-white p-4 shadow-sm"
        >
            <div className="space-y-2">
                <label
                    htmlFor="channelId"
                    className="block text-sm font-medium"
                >
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
                {addChannelMutation.isPending
                    ? 'Adding channel...'
                    : 'Add channel'}
            </button>

            {addChannelMutation.isError && (
                <p className="mt-3 text-sm text-red-600">
                    Failed to add channel: {addChannelMutation.error.message}
                </p>
            )}
        </form>
    );
}
