import type {
    VideoSource,
    VideoSourcePlatform,
} from '@/features/videos/videoTypes';

type VideoSourceAdapter = {
    getThumbnailUrls: (source: VideoSource) => readonly string[];
};

const youtubeSourceAdapter: VideoSourceAdapter = {
    getThumbnailUrls: (source) => {
        const videoId = encodeURIComponent(source.id);

        return [
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        ];
    },
};

const videoSourceAdapters = {
    YOUTUBE: youtubeSourceAdapter,
} satisfies Partial<Record<VideoSourcePlatform, VideoSourceAdapter>>;

export function getThumbnailUrls(sources: VideoSource[]) {
    const thumbnailUrls = sources.flatMap((source) => {
        const adapter = videoSourceAdapters[source.sourcePlatform];

        return adapter?.getThumbnailUrls(source) ?? [];
    });

    return [...new Set(thumbnailUrls)];
}
