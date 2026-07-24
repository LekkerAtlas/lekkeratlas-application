import { appPaths } from '@/config/paths';
import { Link, useParams } from 'react-router';

export function VideoViewerRoute() {
    const { videoId } = useParams();

    return (
        <section>
            <h1>Video viewer</h1>
            <p>Video ID: {videoId}</p>
            <Link to={appPaths.videos}>Back to videos</Link>
        </section>
    );
}
