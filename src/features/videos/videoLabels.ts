import type {
    VideoSourcePlatform,
    VideoType,
} from '@/features/videos/videoTypes';

const videoTypeLabels: Record<VideoType, string> = {
    LIVE_STREAM: 'Live stream',
    LIVE_STREAM_CLIP: 'Live stream clip',
    OFFICIAL_VIDEO: 'Official video',
    FAN_MADE_VIDEO: 'Fan-made video',
    LEKKER_SPELEN_RELATED: 'Lekker Spelen related',
    OTHER: 'Other',
};

const sourcePlatformLabels: Record<VideoSourcePlatform, string> = {
    YOUTUBE: 'YouTube',
};

export function getVideoTypeLabel(videoType: VideoType) {
    return videoTypeLabels[videoType];
}

export function getSourcePlatformLabel(platform: VideoSourcePlatform) {
    return sourcePlatformLabels[platform];
}
