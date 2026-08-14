import '@/features/videos/components/video-player/styles/VideoPlayerStatus.css';

type VideoPlayerStatusProps = {
    isReady: boolean;
    errorMessage: string | null;
};

export function VideoPlayerStatus({
    isReady,
    errorMessage,
}: Readonly<VideoPlayerStatusProps>) {
    if (errorMessage) {
        return (
            <div className="video-player__status video-player__status--error">
                {errorMessage}
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className="video-player__status">Loading video player...</div>
        );
    }

    return null;
}
