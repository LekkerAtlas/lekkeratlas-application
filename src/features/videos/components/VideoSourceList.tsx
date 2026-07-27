import { getSourcePlatformLabel } from '@/features/videos/videoLabels';
import type {
    VideoSource,
    VideoSourcePlatform,
} from '@/features/videos/videoTypes';

type VideoSourceListProps = {
    sources: VideoSource[];
};

function countSourcesByPlatform(sources: VideoSource[]) {
    const counts = new Map<VideoSourcePlatform, number>();

    for (const source of sources) {
        counts.set(
            source.sourcePlatform,
            (counts.get(source.sourcePlatform) ?? 0) + 1
        );
    }

    return [...counts.entries()];
}

export function VideoSourceList({ sources }: Readonly<VideoSourceListProps>) {
    const platformCounts = countSourcesByPlatform(sources);

    if (platformCounts.length === 0) {
        return (
            <p className="video-preview-card__sources">
                No playable source available
            </p>
        );
    }

    return (
        <ul
            className="video-preview-card__sources"
            aria-label="Available platforms"
        >
            {platformCounts.map(([platform, count]) => (
                <li key={platform} className="video-source-badge">
                    {getSourcePlatformLabel(platform)}
                    {count > 1 && ` ×${count}`}
                </li>
            ))}
        </ul>
    );
}
