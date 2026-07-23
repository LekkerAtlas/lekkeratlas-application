import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { ProgressStatus } from '@/features/progress/progressStatus';
import type {
    Progress,
    ProgressQueryResult,
    ProgressResponse,
} from '@/features/progress/progressTypes';

type UseProgressQueryOptions = {
    accessToken: string | null;
    queueJobId: string | null;
};

function getProgress(accessToken: string, queueJobId: string) {
    return apiClient<ProgressResponse>(`/api/progress/${queueJobId}`, {
        method: 'GET',
        accessToken,
    });
}

function isFinalProgressStatus(progress: Progress | undefined) {
    return progress
        ? new ProgressStatus(progress.latestStatus).isFinal()
        : false;
}

export function useProgressQuery({
    accessToken,
    queueJobId,
}: Readonly<UseProgressQueryOptions>): ProgressQueryResult {
    return useQuery({
        queryKey: ['/api/progress/{queueJobId}', queueJobId],
        queryFn: () => getProgress(accessToken!, queueJobId!),
        enabled: Boolean(accessToken && queueJobId),
        refetchInterval: (query) => {
            return isFinalProgressStatus(query.state.data?.progress)
                ? false
                : 500;
        },
    });
}
