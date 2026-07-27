import { getVideos } from '@/features/videos/api/getVideos';
import { videoQueryKeys } from '@/features/videos/videoQueryKeys';
import { useQuery } from '@tanstack/react-query';

export function useVideosQuery(accessToken: string | null) {
    return useQuery({
        queryKey: videoQueryKeys.list(),
        queryFn: () => getVideos(accessToken!),
        enabled: Boolean(accessToken),
    });
}
