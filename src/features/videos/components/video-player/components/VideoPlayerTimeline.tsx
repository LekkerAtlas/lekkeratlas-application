import {
    clamp,
    formatPlaybackTime,
} from '@/features/videos/components/video-player/lib/videoPlayerUtils';
import '@/features/videos/components/video-player/styles/VideoPlayerTimeline.css';
import type { VideoPlaybackActions } from '@/features/videos/components/video-player/types/videoPlayerTypes';
import {
    type ChangeEventHandler,
    type CSSProperties,
    type PointerEventHandler,
    useState,
} from 'react';

type TimelineStyle = CSSProperties & {
    '--video-player-progress': string;
};

type TimelinePreview = {
    time: number;
    percentage: number;
};

type TimelinePreviewStyle = CSSProperties & {
    '--video-player-preview-position': string;
};

type VideoPlayerTimelineProps = {
    isReady: boolean;
    currentTime: number;
    duration: number;
    onSeek: VideoPlaybackActions['seekTo'];
};

export function VideoPlayerTimeline({
    isReady,
    currentTime,
    duration,
    onSeek,
}: Readonly<VideoPlayerTimelineProps>) {
    const [timelinePreview, setTimelinePreview] =
        useState<TimelinePreview | null>(null);
    const [scrubTime, setScrubTime] = useState<number | null>(null);

    const updateTimelinePreview: PointerEventHandler<HTMLDivElement> = (
        event
    ) => {
        if (!isReady || duration <= 0 || scrubTime !== null) {
            return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();

        if (bounds.width <= 0) {
            return;
        }

        const percentage = clamp(
            ((event.clientX - bounds.left) / bounds.width) * 100,
            0,
            100
        );

        setTimelinePreview({
            time: (percentage / 100) * duration,
            percentage,
        });
    };

    const handleSeek: ChangeEventHandler<HTMLInputElement> = (event) => {
        const nextTime = Number(event.currentTarget.value);

        setScrubTime(nextTime);
        setTimelinePreview(createTimelinePreview(nextTime, duration));
    };

    const handleSeekPointerUp: PointerEventHandler<HTMLInputElement> = (
        event
    ) => {
        const nextTime = Number(event.currentTarget.value);

        onSeek(nextTime);
        setScrubTime(null);
    };

    const handleSeekPointerCancel = () => {
        setScrubTime(null);
        setTimelinePreview(null);
    };

    const handleTimelinePointerLeave = () => {
        if (scrubTime === null) {
            setTimelinePreview(null);
        }
    };

    const displayedSeekTime = scrubTime ?? currentTime;
    const playbackProgress =
        duration > 0 ? clamp((displayedSeekTime / duration) * 100, 0, 100) : 0;

    const timelineStyle: TimelineStyle = {
        '--video-player-progress': `${playbackProgress}%`,
    };

    const timelinePreviewStyle: TimelinePreviewStyle | undefined =
        timelinePreview
            ? {
                  '--video-player-preview-position': `${timelinePreview.percentage}%`,
              }
            : undefined;

    return (
        <div
            className="video-player__timeline"
            onPointerMove={updateTimelinePreview}
            onPointerLeave={handleTimelinePointerLeave}
        >
            {timelinePreview && (
                <output
                    className="video-player__timeline-preview"
                    style={timelinePreviewStyle}
                    aria-hidden="true"
                >
                    {formatPlaybackTime(timelinePreview.time)}
                </output>
            )}

            <input
                className="video-player__seek"
                style={timelineStyle}
                type="range"
                min={0}
                max={Math.max(duration, 0)}
                step={0.1}
                value={Math.min(displayedSeekTime, duration || 0)}
                onChange={handleSeek}
                onPointerUp={handleSeekPointerUp}
                onPointerCancel={handleSeekPointerCancel}
                disabled={!isReady || duration <= 0}
                aria-label="Seek video"
                title="Seek (← / →)"
            />
        </div>
    );
}

function createTimelinePreview(
    time: number,
    duration: number
): TimelinePreview | null {
    if (duration <= 0) {
        return null;
    }

    return {
        time,
        percentage: clamp((time / duration) * 100, 0, 100),
    };
}
