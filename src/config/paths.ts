export const appPaths = {
    root: '/',
    login: '/login',
    videos: '/videos',
    video: '/videos/:videoId',
    addChannel: '/channels/new',
    settings: '/settings',
} as const;

export function getVideoPath(videoId: string) {
    return `/videos/${encodeURIComponent(videoId)}`;
}
