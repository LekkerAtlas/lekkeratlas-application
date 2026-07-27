export const appPaths = {
    root: '/',
    login: '/login',
    videos: '/videos',
    video: '/videos/:contentId',
    addChannel: '/channels/new',
    settings: '/settings',
} as const;

export function getVideoPath(contentId: string) {
    return `/videos/${encodeURIComponent(contentId)}`;
}
