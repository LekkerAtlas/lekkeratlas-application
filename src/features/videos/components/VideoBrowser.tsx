import { VideoPreviewCard } from '@/features/videos/components/VideoPreviewCard';
import type { VideoPreview } from '@/features/videos/videoTypes';
import '@/features/videos/videos.css';

type VideoBrowserProps = {
    videos: VideoPreview[];
};

export function VideoBrowser({ videos }: Readonly<VideoBrowserProps>) {
    if (videos.length === 0) {
        return (
            <p className="video-browser__empty">
                No video content is available yet.
            </p>
        );
    }

    return (
        <ul className="video-browser__grid">
            {videos.map((video) => (
                <li key={video.contentId}>
                    <VideoPreviewCard video={video} />
                </li>
            ))}
        </ul>
    );
}
