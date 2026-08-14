import { formatPlaybackTime } from '@/features/videos/components/video-player/lib/videoPlayerUtils';
import '@/features/videos/components/video-player/styles/VideoPlayerControls.css';
import type { VideoSourceLink } from '@/features/videos/components/video-player/types/videoPlayerTypes';
import {
    ExternalLink,
    Maximize,
    Minimize,
    Pause,
    Play,
    Volume2,
    VolumeX,
} from 'lucide-react';
import type { ChangeEventHandler } from 'react';

type VideoPlayerControlsProps = {
    isReady: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isFullscreen: boolean;
    sourceLink?: VideoSourceLink;
    onTogglePlayback: () => void;
    onSetVolume: (volume: number) => void;
    onToggleMute: () => void;
    onToggleFullscreen: () => void;
};

export function VideoPlayerControls({
    isReady,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    sourceLink,
    onTogglePlayback,
    onSetVolume,
    onToggleMute,
    onToggleFullscreen,
}: Readonly<VideoPlayerControlsProps>) {
    const handleVolumeChange: ChangeEventHandler<HTMLInputElement> = (
        event
    ) => {
        onSetVolume(Number(event.currentTarget.value));
    };

    const playbackLabel = isPlaying ? 'Pause' : 'Play';
    const playbackHint = `${playbackLabel} (K / Space)`;
    const muteLabel = isMuted ? 'Unmute' : 'Mute';
    const muteHint = `${muteLabel} (M)`;
    const fullscreenLabel = isFullscreen
        ? 'Exit fullscreen'
        : 'Enter fullscreen';
    const fullscreenHint = `${fullscreenLabel} (F)`;

    return (
        <div className="video-player__controls">
            <button
                className="video-player__control-button"
                type="button"
                onClick={onTogglePlayback}
                disabled={!isReady}
                aria-label={playbackHint}
                title={playbackHint}
            >
                {isPlaying ? (
                    <Pause aria-hidden="true" />
                ) : (
                    <Play aria-hidden="true" />
                )}
            </button>

            <span className="video-player__time">
                {formatPlaybackTime(currentTime)} /{' '}
                {formatPlaybackTime(duration)}
            </span>

            <button
                className="video-player__control-button"
                type="button"
                onClick={onToggleMute}
                disabled={!isReady}
                aria-label={muteHint}
                title={muteHint}
                aria-pressed={isMuted}
            >
                {isMuted ? (
                    <VolumeX aria-hidden="true" />
                ) : (
                    <Volume2 aria-hidden="true" />
                )}
            </button>

            <input
                className="video-player__volume"
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                disabled={!isReady}
                aria-label="Volume"
                title="Volume (↑ / ↓)"
            />

            <span className="video-player__controls-spacer" />

            {sourceLink && (
                <a
                    className="video-player__control-button"
                    href={sourceLink.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open on ${sourceLink.label}`}
                    title={`Open on ${sourceLink.label}`}
                >
                    <ExternalLink aria-hidden="true" />
                </a>
            )}

            <button
                className="video-player__control-button"
                type="button"
                onClick={onToggleFullscreen}
                disabled={!isReady}
                aria-label={fullscreenHint}
                title={fullscreenHint}
                aria-pressed={isFullscreen}
            >
                {isFullscreen ? (
                    <Minimize aria-hidden="true" />
                ) : (
                    <Maximize aria-hidden="true" />
                )}
            </button>
        </div>
    );
}
