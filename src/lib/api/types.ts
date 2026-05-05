import type { paths } from "@/lib/api/schema";

export type ApiRequest<
    Path extends keyof paths,
    Method extends keyof paths[Path],
> = paths[Path][Method] extends {
    requestBody: { content: { "application/json": infer Body } };
}
    ? Body
    : never;

export type ApiResponse<
    Path extends keyof paths,
    Method extends keyof paths[Path],
> = paths[Path][Method] extends {
    responses: { 200: { content: infer Content } };
}
    ? Content extends { "application/json": infer Body }
    ? Body
    : Content extends { "*/*": infer Body }
    ? Body
    : never
    : never;