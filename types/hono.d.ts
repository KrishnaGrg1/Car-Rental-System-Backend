import "hono";

declare module "hono" {
  interface HonoRequest {
    validatedBody: Record<string, unknown>;
    validatedQuery: Record<string, unknown>;
    validatedParams: Record<string, unknown>;
    validatedHeaders: Record<string, unknown>;
    userId: string;
  }
}
