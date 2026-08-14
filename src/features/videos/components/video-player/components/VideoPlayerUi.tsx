import { VideoPlayerControls } from '@/features/videos/components/video-player/components/VideoPlayerControls';
import { VideoPlayerStatus } from '@/features/videos/components/video-player/components/VideoPlayerStatus';
import { VideoPlayerTimeline } from '@/features/videos/components/video-player/components/VideoPlayerTimeline';
import { clamp } from '@/features/videos/components/video-player/lib/videoPlayerUtils';
import '@/features/videos/components/video-player/styles/VideoPlayerUi.css';
import type {
    VideoPlaybackActions,
    VideoPlaybackState,
    VideoSourceLink,
} from '@/features/videos/components/video-player/types/videoPlayerTypes';
import {
    type ReactNode,
    useCallback,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
} from 'react';

const controlsInactivityDelayMilliseconds = 2500;
const paneClickDelayMilliseconds = 250;
const seekStepSeconds = 10;
const volumeStep = 5;

type VideoPlayerUiProps = {
    title: string;
    children: ReactNode;
    playbackState: VideoPlaybackState;
    playbackActions: VideoPlaybackActions;
    sourceLink?: VideoSourceLink;
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
    const paneClickTimeoutRef = useRef<ReturnType<
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

    const seekBy = (seconds: number) => {
        const unclampedTime = Math.max(0, currentTime + seconds);
        const nextTime =
            duration > 0 ? Math.min(unclampedTime, duration) : unclampedTime;

        playbackActions.seekTo(nextTime);
    };

    const setPlaybackVolume = (nextVolume: number) => {
        const clampedVolume = clamp(nextVolume, 0, 100);

        playbackActions.setVolume(clampedVolume);

        if (clampedVolume === 0) {
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

    const handleKeyboardShortcut = useEffectEvent((event: KeyboardEvent) => {
        if (isInteractiveKeyboardTarget(event.target)) {
            return;
        }

        const key = event.key.toLowerCase();
        const isSpaceKey = event.code === 'Space' || key === ' ';

        if ((isSpaceKey || key === 'k') && event.repeat) {
            return;
        }

        const isSupportedKey =
            isSpaceKey ||
            key === 'k' ||
            key === 'm' ||
            key === 'f' ||
            key === 'arrowleft' ||
            key === 'arrowright' ||
            key === 'arrowup' ||
            key === 'arrowdown';

        if (!isSupportedKey) {
            return;
        }

        event.preventDefault();
        revealControls();

        if (!isReady) {
            return;
        }

        switch (key) {
            case ' ':
            case 'k':
                togglePlayback();
                break;
            case 'm':
                toggleMute();
                break;
            case 'f':
                void toggleFullscreen();
                break;
            case 'arrowleft':
                seekBy(-seekStepSeconds);
                break;
            case 'arrowright':
                seekBy(seekStepSeconds);
                break;
            case 'arrowup':
                setPlaybackVolume(volume + volumeStep);
                break;
            case 'arrowdown':
                setPlaybackVolume(volume - volumeStep);
                break;
        }
    });

    useEffect(() => {
        globalThis.addEventListener('keydown', handleKeyboardShortcut);

        return () => {
            globalThis.removeEventListener('keydown', handleKeyboardShortcut);
        };
    }, []);

    const clearPaneClickTimeout = useCallback(() => {
        if (paneClickTimeoutRef.current === null) {
            return;
        }

        globalThis.clearTimeout(paneClickTimeoutRef.current);
        paneClickTimeoutRef.current = null;
    }, []);

    useEffect(() => {
        return clearPaneClickTimeout;
    }, [clearPaneClickTimeout]);

    const handlePaneClick = () => {
        playerShellRef.current?.focus();
        revealControls();
        clearPaneClickTimeout();

        paneClickTimeoutRef.current = globalThis.setTimeout(() => {
            if (isReady) {
                togglePlayback();
            }

            paneClickTimeoutRef.current = null;
        }, paneClickDelayMilliseconds);
    };

    const handlePaneDoubleClick = () => {
        playerShellRef.current?.focus();
        revealControls();
        clearPaneClickTimeout();

        if (isReady) {
            void toggleFullscreen();
        }
    };

    const shouldShowControls = !isPlaying || areControlsVisible;
    const playerClassName = shouldShowControls
        ? 'video-player video-player--controls-visible'
        : 'video-player video-player--controls-hidden';
    const playbackLabel = isPlaying ? 'Pause' : 'Play';

    return (
        <div
            ref={playerShellRef}
            className={playerClassName}
            tabIndex={0}
            aria-label={`Video player for ${title}`}
            aria-keyshortcuts="Space K M F ArrowLeft ArrowRight ArrowUp ArrowDown"
            onPointerMove={revealControls}
            onPointerDown={revealControls}
            onFocusCapture={revealControls}
        >
            <div className="video-player__viewport">
                <div className="video-player__media">{children}</div>

                <button
                    className="video-player__activity-surface"
                    type="button"
                    tabIndex={-1}
                    onClick={handlePaneClick}
                    onDoubleClick={handlePaneDoubleClick}
                    onPointerMove={revealControls}
                    onPointerDown={revealControls}
                    aria-label={playbackLabel}
                />

                <div className="video-player__overlay">
                    <VideoPlayerTimeline
                        isReady={isReady}
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={playbackActions.seekTo}
                    />

                    <VideoPlayerControls
                        isReady={isReady}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        duration={duration}
                        volume={volume}
                        isMuted={isMuted}
                        isFullscreen={isFullscreen}
                        sourceLink={sourceLink}
                        onTogglePlayback={togglePlayback}
                        onSetVolume={setPlaybackVolume}
                        onToggleMute={toggleMute}
                        onToggleFullscreen={() => void toggleFullscreen()}
                    />
                </div>

                <VideoPlayerStatus
                    isReady={isReady}
                    errorMessage={displayedErrorMessage}
                />
            </div>
        </div>
    );
}

function isInteractiveKeyboardTarget(target: EventTarget | null) {
    return (
        target instanceof HTMLElement &&
        Boolean(
            target.closest(
                'button, a, input, select, textarea, [contenteditable="true"]'
            )
        )
    );
}
