import type { VideosResponse } from '@/features/videos/videoTypes';
import { apiClient } from '@/lib/api-client';

const apiRoute = '/api/videos';

type GetVideosPageOptions = {
    page: number;
    size: number;
};

export function getVideos(accessToken: string) {
    return apiClient<VideosResponse>(apiRoute, {
        method: 'GET',
        accessToken,
    });
}

export function getVideosPage(
    accessToken: string,
    { page, size }: Readonly<GetVideosPageOptions>
) {
    const searchParams = new URLSearchParams({
        page: String(page),
        size: String(size),
    });

    return apiClient<VideosResponse>(`${apiRoute}?${searchParams.toString()}`, {
        method: 'GET',
        accessToken,
    });
}
