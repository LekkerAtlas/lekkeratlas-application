import type { VideosResponse } from '@/features/videos/videoTypes';
import { apiClient } from '@/lib/api-client';

const apiRoute = '/api/videos';

export function getVideos(accessToken: string) {
    return apiClient<VideosResponse>(apiRoute, {
        method: 'GET',
        accessToken,
    });
}
