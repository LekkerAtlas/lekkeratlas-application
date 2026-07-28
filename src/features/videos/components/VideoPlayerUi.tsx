import '@/features/videos/components/video-player.css';
import {
    type ChangeEventHandler,
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    ExternalLink,
    Maximize,
    Minimize,
    Pause,
    Play,
    Volume2,
    VolumeX,
} from 'lucide-react';

const controlsInactivityDelayMilliseconds = 2500;

export type VideoPlaybackState = {
    isReady: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    errorMessage: string | null;
};

export type VideoPlaybackActions = {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    setVolume: (volume: number) => void;
    mute: () => void;
    unmute: () => void;
};

type VideoPlayerUiProps = {
    title: string;
    children: ReactNode;
    playbackState: VideoPlaybackState;
    playbackActions: VideoPlaybackActions;
    sourceLink?: Readonly<{
        label: string;
        href: string;
    }>;
};

export function VideoPlayerUi({
    title,
    children,
    playbackState,
    playbackActions,
    sourceLink,
}: Readonly<VideoPlayerUiProps>) {
    const playerShellRef = useRef<HTMLDivElement>(null);
    const controlsHideTimeoutRef = useRef<ReturnType<
        typeof globalThis.setTimeout
    > | null>(null);

    const [areControlsVisible, setAreControlsVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [uiErrorMessage, setUiErrorMessage] = useState<string | null>(null);

    const {
        isReady,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        errorMessage,
    } = playbackState;

    const displayedErrorMessage = uiErrorMessage ?? errorMessage;

    const clearControlsHideTimeout = useCallback(() => {
        if (controlsHideTimeoutRef.current === null) {
            return;
        }

        globalThis.clearTimeout(controlsHideTimeoutRef.current);
        controlsHideTimeoutRef.current = null;
    }, []);

    const scheduleControlsHide = useCallback(() => {
        clearControlsHideTimeout();

        if (!isPlaying) {
            return;
        }

        controlsHideTimeoutRef.current = globalThis.setTimeout(() => {
            setAreControlsVisible(false);
            controlsHideTimeoutRef.current = null;
        }, controlsInactivityDelayMilliseconds);
    }, [clearControlsHideTimeout, isPlaying]);

    const revealControls = useCallback(() => {
        setAreControlsVisible(true);
        scheduleControlsHide();
    }, [scheduleControlsHide]);

    useEffect(() => {
        if (isPlaying) {
            scheduleControlsHide();
        } else {
            clearControlsHideTimeout();
        }

        return clearControlsHideTimeout;
    }, [isPlaying, scheduleControlsHide, clearControlsHideTimeout]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                document.fullscreenElement === playerShellRef.current
            );
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange
            );
        };
    }, []);

    const togglePlayback = () => {
        if (isPlaying) {
            playbackActions.pause();
        } else {
            playbackActions.play();
        }
    };

    const handleSeek: ChangeEventHandler<HTMLInputElement> = (event) => {
        playbackActions.seekTo(Number(event.currentTarget.value));
    };

    const handleVolumeChange: ChangeEventHandler<HTMLInputElement> = (
        event
    ) => {
        const nextVolume = Number(event.currentTarget.value);

        playbackActions.setVolume(nextVolume);

        if (nextVolume === 0) {
            playbackActions.mute();
        } else {
            playbackActions.unmute();
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            if (volume === 0) {
                playbackActions.setVolume(50);
            }

            playbackActions.unmute();
        } else {
            playbackActions.mute();
        }
    };

    const toggleFullscreen = async () => {
        setUiErrorMessage(null);

        try {
            if (document.fullscreenElement === playerShellRef.current) {
                await document.exitFullscreen();
                return;
            }

            await playerShellRef.current?.requestFullscreen();
        } catch {
            setUiErrorMessage('Fullscreen is not available in this browser.');
        }
    };

    const shouldShowControls = !isPlaying || areControlsVisible;

    const playerClassName = shouldShowControls
        ? 'video-player video-player--controls-visible'
        : 'video-player video-player--controls-hidden';

    const playbackLabel = isPlaying ? 'Pause' : 'Play';
    const muteLabel = isMuted ? 'Unmute' : 'Mute';
    const fullscreenLabel = isFullscreen
        ? 'Exit fullscreen'
        : 'Enter fullscreen';

    return (
        <div
            ref={playerShellRef}
            className={playerClassName}
            aria-label={`Video player for ${title}`}
            onPointerMove={revealControls}
            onPointerDown={revealControls}
            onFocusCapture={revealControls}
            onKeyDown={revealControls}
        >
            <div className="video-player__viewport">
                <div className="video-player__media">{children}</div>

                <div
                    className="video-player__activity-surface"
                    onPointerMove={revealControls}
                    onPointerDown={revealControls}
                    aria-hidden="true"
                />

                <div className="video-player__overlay">
                    <input
                        className="video-player__seek"
                        type="range"
                        min={0}
                        max={Math.max(duration, 0)}
                        step={0.1}
                        value={Math.min(currentTime, duration || 0)}
                        onChange={handleSeek}
                        disabled={!isReady || duration <= 0}
                        aria-label="Seek video"
                    />

                    <div className="video-player__controls">
                        <button
                            className="video-player__control-button"
                            type="button"
                            onClick={togglePlayback}
                            disabled={!isReady}
                            aria-label={playbackLabel}
                            title={playbackLabel}
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
                            onClick={toggleMute}
                            disabled={!isReady}
                            aria-label={muteLabel}
                            title={muteLabel}
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
                            onClick={() => void toggleFullscreen()}
                            disabled={!isReady}
                            aria-label={fullscreenLabel}
                            title={fullscreenLabel}
                            aria-pressed={isFullscreen}
                        >
                            {isFullscreen ? (
                                <Minimize aria-hidden="true" />
                            ) : (
                                <Maximize aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {!isReady && !displayedErrorMessage && (
                    <div className="video-player__status">
                        Loading video player...
                    </div>
                )}

                {displayedErrorMessage && (
                    <div className="video-player__status video-player__status--error">
                        {displayedErrorMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

function formatPlaybackTime(value: number) {
    if (!Number.isFinite(value) || value < 0) {
        return '0:00';
    }

    const totalSeconds = Math.floor(value);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(
            seconds
        ).padStart(2, '0')}`;
    }

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
