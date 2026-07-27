export type YouTubePlayer = {
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getVolume: () => number;
    setVolume: (volume: number) => void;
    isMuted: () => boolean;
    mute: () => void;
    unMute: () => void;
    destroy: () => void;
};

type YouTubePlayerEvent = {
    target: YouTubePlayer;
};

type YouTubePlayerStateChangeEvent = YouTubePlayerEvent & {
    data: number;
};

type YouTubePlayerErrorEvent = YouTubePlayerEvent & {
    data: number;
};

type YouTubePlayerOptions = {
    width: string | number;
    height: string | number;
    videoId: string;
    playerVars: Record<string, string | number>;
    events: {
        onReady: (event: YouTubePlayerEvent) => void;
        onStateChange: (event: YouTubePlayerStateChangeEvent) => void;
        onError: (event: YouTubePlayerErrorEvent) => void;
    };
};

export type YouTubeIframeApi = {
    Player: new (
        element: HTMLElement,
        options: YouTubePlayerOptions
    ) => YouTubePlayer;
    PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
    };
};

type YouTubeWindow = Window & {
    YT?: YouTubeIframeApi;
    onYouTubeIframeAPIReady?: () => void;
};

const iframeApiUrl = 'https://www.youtube.com/iframe_api';
let iframeApiPromise: Promise<YouTubeIframeApi> | null = null;

export function loadYouTubeIframeApi(): Promise<YouTubeIframeApi> {
    const youtubeWindow = window as YouTubeWindow;

    if (youtubeWindow.YT?.Player) {
        return Promise.resolve(youtubeWindow.YT);
    }

    if (iframeApiPromise) {
        return iframeApiPromise;
    }

    iframeApiPromise = new Promise((resolve, reject) => {
        const previousReadyHandler = youtubeWindow.onYouTubeIframeAPIReady;

        youtubeWindow.onYouTubeIframeAPIReady = () => {
            previousReadyHandler?.();

            if (youtubeWindow.YT?.Player) {
                resolve(youtubeWindow.YT);
                return;
            }

            reject(new Error('YouTube IFrame API loaded without a player.'));
        };

        const existingScript = document.querySelector<HTMLScriptElement>(
            `script[src="${iframeApiUrl}"]`
        );

        if (existingScript) {
            existingScript.addEventListener('error', () => {
                reject(new Error('Failed to load the YouTube IFrame API.'));
            });
            return;
        }

        const script = document.createElement('script');
        script.src = iframeApiUrl;
        script.async = true;
        script.addEventListener('error', () => {
            reject(new Error('Failed to load the YouTube IFrame API.'));
        });
        document.head.append(script);
    });

    return iframeApiPromise;
}
