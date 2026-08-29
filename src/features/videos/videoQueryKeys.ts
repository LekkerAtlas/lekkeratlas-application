export const videoQueryKeys = {
    all: ['videos'] as const,
    lists: () => [...videoQueryKeys.all, 'list'] as const,
    infiniteList: (pageSize: number) =>
        [...videoQueryKeys.lists(), 'infinite', pageSize] as const,
};
