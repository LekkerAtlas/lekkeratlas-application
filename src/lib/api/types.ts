import type { paths } from '@/lib/api/schema';

type PathKey = keyof paths & string;

type OpenApiPathToTemplate<Path extends string> =
    Path extends `${infer Start}{${string}}${infer End}`
        ? `${Start}${string}${OpenApiPathToTemplate<End>}`
        : Path;

type MatchingPath<Path extends string> = {
    [Key in PathKey]: Path extends Key
        ? Key
        : Path extends OpenApiPathToTemplate<Key>
          ? Key
          : never;
}[PathKey];

type PathOperation<
    Path extends string,
    Method extends keyof paths[MatchingPath<Path>],
> = paths[MatchingPath<Path>][Method];

export type ApiRequest<
    Path extends string,
    Method extends keyof paths[MatchingPath<Path>],
> =
    PathOperation<Path, Method> extends {
        requestBody: { content: { 'application/json': infer Body } };
    }
        ? Body
        : never;

export type ApiResponse<
    Path extends string,
    Method extends keyof paths[MatchingPath<Path>],
> =
    PathOperation<Path, Method> extends {
        responses: { 200: { content: infer Content } };
    }
        ? Content extends { 'application/json': infer Body }
            ? Body
            : Content extends { '*/*': infer Body }
              ? Body
              : never
        : never;
