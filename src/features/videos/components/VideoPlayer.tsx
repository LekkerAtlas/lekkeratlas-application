import type { VideoPlayerAdapterProps } from '@/features/videos/components/video-player/types/videoPlayerTypes';
import { YouTubePlayer } from '@/features/videos/platforms/youtube/YouTubePlayer';
import '@/features/videos/videos.css';
import type {
    VideoPreview,
    VideoSourcePlatform,
} from '@/features/videos/videoTypes';
import type { ComponentType } from 'react';

type VideoPlayerAdapter = ComponentType<VideoPlayerAdapterProps>;

type VideoPlayerProps = {
    video: VideoPreview;
};

const videoPlayerAdapters: Partial<
    Record<VideoSourcePlatform, VideoPlayerAdapter>
> = {
    YOUTUBE: YouTubePlayer,
};

export function VideoPlayer({ video }: Readonly<VideoPlayerProps>) {
    for (const source of video.videoSources) {
        const PlayerAdapter = videoPlayerAdapters[source.sourcePlatform];

        if (PlayerAdapter) {
            return (
                <PlayerAdapter
                    key={`${source.sourcePlatform}:${source.id}`}
                    source={source}
                    title={video.title}
                />
            );
        }
    }

    return (
        <p className="video-player__unavailable">
            No supported playback source is available for this content.
        </p>
    );
}
