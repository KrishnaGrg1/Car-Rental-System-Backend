import type { Context, MiddlewareHandler } from "hono";
import { ZodError, type ZodSchema } from "zod";

import "../types/hono.d";

/**
 * Validation schema interface for request validation
 */
interface ValidationSchema {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
}

/**
 * Validation error response item
 */
interface ValidationErrorItem {
  field: string;
  message: string;
}

/**
 * Validation Middleware Factory
 * Creates middleware that validates request body, query, params, and headers
 * @param schema - Zod schemas for validation
 * @returns Middleware handler
 */
const validate = (schema: ValidationSchema = {}): MiddlewareHandler => {
  return async (c: Context, next) => {
    try {
      if (schema.body) {
        const body = await c.req.json();
        c.req.validatedBody = (await schema.body.parseAsync(body)) as Record<
          string,
          unknown
        >;
      }

      if (schema.query) {
        const query = c.req.query();
        c.req.validatedQuery = (await schema.query.parseAsync(query)) as Record<
          string,
          unknown
        >;
      }

      if (schema.params) {
        const params = c.req.param();
        c.req.validatedParams = (await schema.params.parseAsync(
          params,
        )) as Record<string, unknown>;
      }

      if (schema.headers) {
        const headersObj = Object.fromEntries(c.req.raw.headers);
        c.req.validatedHeaders = (await schema.headers.parseAsync(
          headersObj,
        )) as Record<string, unknown>;
      }

      await next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors: ValidationErrorItem[] = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return c.json(
          {
            message: "Validation failed",
            errors,
          },
          400,
        );
      }

      return c.json({ message: "Internal validation error" }, 500);
    }
  };
};

export default validate;
