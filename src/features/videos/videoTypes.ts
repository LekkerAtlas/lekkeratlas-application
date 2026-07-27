import type { ApiResponse } from '@/lib/api/types';

export type VideosResponse = ApiResponse<'/api/videos', 'get'>;
export type VideoPreview = VideosResponse[number];
export type VideoType = VideoPreview['videoType'];
export type VideoSource = VideoPreview['videoSources'][number];
export type VideoSourcePlatform = VideoSource['sourcePlatform'];
