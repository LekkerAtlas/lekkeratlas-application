import type { Progress, QueueJobStatus } from "./progressTypes";

export function isTerminalProgressStatus(progress: Progress | undefined) {
    if (!progress) {
        return false;
    }

    const ownStatusIsTerminal =
        progress.latestStatus === "COMPLETED" ||
        progress.latestStatus === "FAILED" ||
        progress.latestStatus === "CANCELED";

    return ownStatusIsTerminal && progress.childProgresses.every(isTerminalProgressStatus);
}

export function getProgressStatusLabel(status: QueueJobStatus) {
    switch (status) {
        case "QUEUED":
            return "Queued";
        case "RUNNING":
            return "Running";
        case "COMPLETED":
            return "Succeeded";
        case "FAILED":
            return "Failed";
        case "CANCELED":
            return "Canceled";
    }
}