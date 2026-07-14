import type { QueueJobProgressStatus } from './progressTypes';

const terminalStatuses: readonly QueueJobProgressStatus[] = [
    'COMPLETED',
    'FAILED',
    'CANCELED',
];

export class ProgressStatus {
    private readonly value: QueueJobProgressStatus;

    constructor(value: QueueJobProgressStatus) {
        this.value = value;
    }

    get status(): QueueJobProgressStatus {
        return this.value;
    }

    isFinal(): boolean {
        return terminalStatuses.includes(this.value);
    }

    canCancel(): boolean {
        return this.value === 'QUEUED' || this.value === 'RUNNING';
    }

    isQueued(): boolean {
        return this.value === 'QUEUED';
    }

    isRunning(): boolean {
        return this.value === 'RUNNING';
    }

    isCompleted(): boolean {
        return this.value === 'COMPLETED';
    }

    isFailed(): boolean {
        return this.value === 'FAILED';
    }

    isCanceled(): boolean {
        return this.value === 'CANCELED';
    }
}
