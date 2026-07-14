import type { Progress } from './progressTypes';

type ProgressStatusValue = Progress['latestStatus'];

const terminalStatuses: readonly ProgressStatusValue[] = [
    'COMPLETED',
    'FAILED',
    'CANCELED',
];

export class ProgressStatus {
    private readonly value: ProgressStatusValue;

    constructor(value: ProgressStatusValue) {
        this.value = value;
    }

    get status(): ProgressStatusValue {
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
