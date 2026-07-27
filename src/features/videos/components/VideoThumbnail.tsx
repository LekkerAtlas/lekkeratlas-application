import { getThumbnailUrls } from '@/features/videos/platforms/videoSourceAdapters';
import type { VideoPreview } from '@/features/videos/videoTypes';
import { useState } from 'react';

type VideoThumbnailProps = {
    video: VideoPreview;
};

export function VideoThumbnail({ video }: Readonly<VideoThumbnailProps>) {
    const thumbnailUrls = getThumbnailUrls(video.videoSources);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    const thumbnailUrl = thumbnailUrls[thumbnailIndex];

    if (!thumbnailUrl) {
        return (
            <div
                className="video-thumbnail video-thumbnail--placeholder"
                aria-hidden="true"
            />
        );
    }

    return (
        <div className="video-thumbnail">
            <img
                key={thumbnailUrl}
                className="video-thumbnail__image"
                src={thumbnailUrl}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setThumbnailIndex((index) => index + 1)}
            />
        </div>
    );
}
