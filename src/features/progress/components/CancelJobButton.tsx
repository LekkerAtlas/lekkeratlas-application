import type { ApiRequest } from '@/lib/api/types';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProgressStatus } from '@/features/progress/progressStatus';
import { useAccessToken } from '@/features/auth/hooks/useAccessToken';
const apiRoute = '/api/job/{jobId}/cancel' as const;

type CancelJobRequest = ApiRequest<typeof apiRoute, 'post'>;

type CancelJobButtonProps = {
    jobId: string;
    status: ProgressStatus;
};

function cancelJob(jobId: string, accessToken: string) {
    return apiClient<void, CancelJobRequest>(
        apiRoute.replace('{jobId}', encodeURIComponent(jobId)),
        {
            method: 'POST',
            accessToken,
        }
    );
}

export function CancelJobButton({
    jobId,
    status,
}: Readonly<CancelJobButtonProps>) {
    const accessToken = useAccessToken();
    const queryClient = useQueryClient();

    const cancelJobMutation = useMutation({
        mutationFn: () => cancelJob(jobId, accessToken!),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['job', jobId],
            });

            /**
             * await queryClient.invalidateQueries({
             *     queryKey: ['jobs'],
             * });
             */
        },
    });

    return (
        <button
            type="button"
            onClick={() => cancelJobMutation.mutate()}
            disabled={cancelJobMutation.isPending}
            hidden={!status.canCancel()}
        >
            {cancelJobMutation.isPending ? 'Cancelling…' : 'Cancel job'}
        </button>
    );
}
