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
    const formattedDuration = formatDuration(video.durationSeconds);

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
            <span
                className="video-thumbnail__duration"
                aria-label={`Duration ${formattedDuration}`}
            >
                {formattedDuration}
            </span>
        </div>
    );
}

function formatDuration(value: number) {
    const totalSeconds = Number.isFinite(value)
        ? Math.max(0, Math.floor(value))
        : 0;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const minuteAndSecondParts = [minutes, seconds].map((part) =>
        String(part).padStart(2, '0')
    );

    if (hours === 0) {
        return minuteAndSecondParts.join(':');
    }

    return [String(hours).padStart(2, '0'), ...minuteAndSecondParts].join(':');
}
