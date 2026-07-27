import { useAccessToken } from '@/features/auth/hooks/useAccessToken';
import { VideoBrowser } from '@/features/videos/components/VideoBrowser';
import { useVideosQuery } from '@/features/videos/hooks/useVideosQuery';

export function VideoBrowsingRoute() {
    const accessToken = useAccessToken();
    const videosQuery = useVideosQuery(accessToken);

    if (!accessToken) {
        return <p>No access token found.</p>;
    }

    if (videosQuery.isPending) {
        return <p>Loading videos...</p>;
    }

    if (videosQuery.isError) {
        return <p>Failed to load videos: {videosQuery.error.message}</p>;
    }

    return (
        <section>
            <h1>Videos</h1>
            <p>
                Browse content independently of the platforms where it is
                hosted.
            </p>

            <VideoBrowser videos={videosQuery.data} />
        </section>
    );
}
