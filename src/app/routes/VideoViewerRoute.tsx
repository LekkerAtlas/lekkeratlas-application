import { appPaths } from '@/config/paths';
import { useAccessToken } from '@/features/auth/hooks/useAccessToken';
import { VideoPlayer } from '@/features/videos/components/VideoPlayer';
import { useInfiniteVideosQuery } from '@/features/videos/hooks/useInfiniteVideosQuery';
import { Link, useParams } from 'react-router';

export function VideoViewerRoute() {
    const { contentId } = useParams<{ contentId: string }>();
    const accessToken = useAccessToken();
    const videosQuery = useInfiniteVideosQuery(accessToken);

    if (!contentId) {
        return <VideoNotFound />;
    }

    if (!accessToken) {
        return <p>No access token found.</p>;
    }

    if (videosQuery.isPending) {
        return <p>Loading video...</p>;
    }

    if (videosQuery.isError) {
        return <p>Failed to load video: {videosQuery.error.message}</p>;
    }

    const video = videosQuery.data.pages
        .flat()
        .find((candidate) => candidate.contentId === contentId);

    if (!video) {
        return <VideoNotFound />;
    }

    return (
        <section className="video-viewer-page">
            <Link to={appPaths.videos}>Back to videos</Link>

            <header className="video-viewer-page__header">
                <h1>{video.title}</h1>
                <p>{video.creatorInfo.displayName}</p>
            </header>

            <VideoPlayer video={video} />
        </section>
    );
}

function VideoNotFound() {
    return (
        <section>
            <h1>Video not found</h1>
            <p>The requested content could not be found.</p>
            <Link to={appPaths.videos}>Back to videos</Link>
        </section>
    );
}
