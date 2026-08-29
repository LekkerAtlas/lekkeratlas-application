import { VideoPreviewCard } from '@/features/videos/components/VideoPreviewCard';
import type { VideoPreview } from '@/features/videos/videoTypes';
import '@/features/videos/videos.css';
import { useEffect, useRef } from 'react';

type VideoBrowserProps = {
    videos: VideoPreview[];
    hasNextPage: boolean;
    isFetching: boolean;
    isFetchingNextPage: boolean;
    loadMoreError: Error | null;
    onLoadMore: () => void;
};

export function VideoBrowser({
    videos,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    loadMoreError,
    onLoadMore,
}: Readonly<VideoBrowserProps>) {
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadMoreElement = loadMoreRef.current;

        if (!loadMoreElement || !hasNextPage || isFetching || loadMoreError) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    onLoadMore();
                }
            },
            { rootMargin: '400px 0px' }
        );

        observer.observe(loadMoreElement);

        return () => observer.disconnect();
    }, [hasNextPage, isFetching, loadMoreError, onLoadMore]);

    if (videos.length === 0) {
        return (
            <p className="video-browser__empty">
                No video content is available yet.
            </p>
        );
    }

    return (
        <>
            <ul className="video-browser__grid">
                {videos.map((video) => (
                    <li key={video.contentId}>
                        <VideoPreviewCard video={video} />
                    </li>
                ))}
            </ul>

            {loadMoreError ? (
                <div className="video-browser__load-more">
                    <p>Failed to load more videos: {loadMoreError.message}</p>
                    <button
                        type="button"
                        onClick={onLoadMore}
                        disabled={isFetching}
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <div ref={loadMoreRef} className="video-browser__load-more">
                    {isFetchingNextPage && (
                        <output>Loading more videos...</output>
                    )}
                    {!hasNextPage && <p>All videos loaded.</p>}
                </div>
            )}
        </>
    );
}
