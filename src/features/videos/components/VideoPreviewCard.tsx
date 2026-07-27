import { getVideoPath } from '@/config/paths';
import { VideoSourceList } from '@/features/videos/components/VideoSourceList';
import { VideoThumbnail } from '@/features/videos/components/VideoThumbnail';
import { getVideoTypeLabel } from '@/features/videos/videoLabels';
import type { VideoPreview } from '@/features/videos/videoTypes';
import { Link } from 'react-router';

type VideoPreviewCardProps = {
    video: VideoPreview;
};

export function VideoPreviewCard({ video }: Readonly<VideoPreviewCardProps>) {
    return (
        <article className="video-preview-card">
            <Link
                className="video-preview-card__link"
                to={getVideoPath(video.contentId)}
            >
                <VideoThumbnail video={video} />

                <div className="video-preview-card__body">
                    <p className="video-preview-card__type">
                        {getVideoTypeLabel(video.videoType)}
                    </p>
                    <h2 className="video-preview-card__title">{video.title}</h2>
                    <p className="video-preview-card__creator">
                        {video.creatorInfo.displayName}
                    </p>
                </div>
            </Link>

            <VideoSourceList sources={video.videoSources} />
        </article>
    );
}
