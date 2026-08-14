import { VideoPlayerUi } from '@/features/videos/components/video-player/components/VideoPlayerUi';
import type {
    VideoPlaybackActions,
    VideoPlaybackState,
    VideoPlayerAdapterProps,
} from '@/features/videos/components/video-player/types/videoPlayerTypes';
import {
    loadYouTubeIframeApi,
    type YouTubePlayer as YouTubePlayerInstance,
} from '@/features/videos/platforms/youtube/youtubeIframeApi';
import { useEffect, useRef, useState } from 'react';

const playbackSyncIntervalMilliseconds = 250;

export function YouTubePlayer({
    source,
    title,
}: Readonly<VideoPlayerAdapterProps>) {
    const playerMountRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YouTubePlayerInstance | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        let player: YouTubePlayerInstance | null = null;

        void loadYouTubeIframeApi()
            .then((api) => {
                if (isCancelled || !playerMountRef.current) {
                    return;
                }

                player = new api.Player(playerMountRef.current, {
                    width: '100%',
                    height: '100%',
                    videoId: source.id,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        playsinline: 1,
                        rel: 0,
                        origin: globalThis.location.origin,
                    },
                    events: {
                        onReady: (event) => {
                            playerRef.current = event.target;

                            // Autoplay video when starting a new player
                            event.target.playVideo();

                            setCurrentTime(event.target.getCurrentTime());
                            setDuration(event.target.getDuration());
                            setVolume(event.target.getVolume());
                            setIsMuted(event.target.isMuted());
                            setIsReady(true);
                        },

                        onStateChange: (event) => {
                            setIsPlaying(
                                event.data === api.PlayerState.PLAYING
                            );
                            setCurrentTime(event.target.getCurrentTime());
                            setDuration(event.target.getDuration());
                        },

                        onError: (event) => {
                            setIsPlaying(false);
                            setErrorMessage(
                                `YouTube could not play this video (error ${event.data}).`
                            );
                        },
                    },
                });
            })
            .catch((error: unknown) => {
                if (isCancelled) {
                    return;
                }

                setIsPlaying(false);
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : 'Failed to initialize the YouTube player.'
                );
            });

        return () => {
            isCancelled = true;
            player?.destroy();
            playerRef.current = null;
        };
    }, [source.id]);

    /**
     * The YouTube API does not continuously emit playback-position events.
     * Poll the current position while playback is active so the shared UI
     * remains synchronized with the platform player.
     */
    useEffect(() => {
        if (!isReady || !isPlaying) {
            return;
        }

        const interval = globalThis.setInterval(() => {
            const player = playerRef.current;

            if (!player) {
                return;
            }

            setCurrentTime(player.getCurrentTime());
            setDuration(player.getDuration());
        }, playbackSyncIntervalMilliseconds);

        return () => globalThis.clearInterval(interval);
    }, [isReady, isPlaying]);

    const playbackState: VideoPlaybackState = {
        isReady,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        errorMessage,
    };

    const playbackActions: VideoPlaybackActions = {
        play: () => {
            playerRef.current?.playVideo();
        },

        pause: () => {
            playerRef.current?.pauseVideo();
        },

        seekTo: (seconds) => {
            playerRef.current?.seekTo(seconds, true);
            setCurrentTime(seconds);
        },

        setVolume: (nextVolume) => {
            playerRef.current?.setVolume(nextVolume);
            setVolume(nextVolume);
        },

        mute: () => {
            playerRef.current?.mute();
            setIsMuted(true);
        },

        unmute: () => {
            playerRef.current?.unMute();
            setIsMuted(false);
        },
    };

    return (
        <VideoPlayerUi
            title={title}
            playbackState={playbackState}
            playbackActions={playbackActions}
            sourceLink={{
                label: 'YouTube',
                href: `https://youtu.be/${encodeURIComponent(
                    source.id
                )}?t=${currentTime.toFixed()}`,
            }}
        >
            <div ref={playerMountRef} />
        </VideoPlayerUi>
    );
}
