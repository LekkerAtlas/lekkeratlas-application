import { getVideosPage } from '@/features/videos/api/getVideos';
import { videoQueryKeys } from '@/features/videos/videoQueryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';

const videoPageSize = 24;

export function useInfiniteVideosQuery(accessToken: string | null) {
    return useInfiniteQuery({
        queryKey: videoQueryKeys.infiniteList(videoPageSize),
        queryFn: ({ pageParam }) =>
            getVideosPage(accessToken!, {
                page: pageParam,
                size: videoPageSize,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < videoPageSize) {
                return undefined;
            }

            return allPages.length;
        },
        enabled: Boolean(accessToken),
    });
}
