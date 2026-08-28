import { useAccessToken } from '@/features/auth/hooks/useAccessToken';
import { VideoBrowser } from '@/features/videos/components/VideoBrowser';
import { useInfiniteVideosQuery } from '@/features/videos/hooks/useInfiniteVideosQuery';

export function VideoBrowsingRoute() {
    const accessToken = useAccessToken();
    const videosQuery = useInfiniteVideosQuery(accessToken);

    if (!accessToken) {
        return <p>No access token found.</p>;
    }

    if (videosQuery.isPending) {
        return <p>Loading videos...</p>;
    }

    if (videosQuery.isError && !videosQuery.data) {
        return <p>Failed to load videos: {videosQuery.error.message}</p>;
    }

    const videos = videosQuery.data?.pages.flat() ?? [];
    const loadMoreError = videosQuery.isFetchNextPageError
        ? videosQuery.error
        : null;
    const loadMoreVideos = () => {
        if (videosQuery.hasNextPage && !videosQuery.isFetching) {
            videosQuery.fetchNextPage();
        }
    };

    return (
        <section>
            <h1>Videos</h1>
            <p>
                Browse content independently of the platforms where it is
                hosted.
            </p>

            <VideoBrowser
                videos={videos}
                hasNextPage={videosQuery.hasNextPage}
                isFetching={videosQuery.isFetching}
                isFetchingNextPage={videosQuery.isFetchingNextPage}
                loadMoreError={loadMoreError}
                onLoadMore={loadMoreVideos}
            />
        </section>
    );
}
