import type { VideoSource } from '@/features/videos/videoTypes';

export type VideoPlayerAdapterProps = {
    source: VideoSource;
    title: string;
};

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

export type VideoSourceLink = Readonly<{
    label: string;
    href: string;
}>;
