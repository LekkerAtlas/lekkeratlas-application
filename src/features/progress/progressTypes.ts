import type { UseQueryResult } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/api/types";

export type ProgressResponse = ApiResponse<"/api/progress/{queueJobId}", "get">;

export type Progress = ProgressResponse["progress"];
export type ProgressStatusEvent = Progress["events"][number];
export type QueueJobStatus = Progress["latestStatus"];

export type ProgressQueryResult = UseQueryResult<ProgressResponse, Error>;