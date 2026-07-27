export const videoQueryKeys = {
    all: ['videos'] as const,
    lists: () => [...videoQueryKeys.all, 'list'] as const,
    list: () => [...videoQueryKeys.lists()] as const,
};
