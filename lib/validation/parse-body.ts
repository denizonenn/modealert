import { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";

type ParseResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: NextResponse };

// Shared by every route that accepts a JSON body — malformed JSON and
// schema mismatches both return the same clean 400 shape instead of
// each route reinventing (or skipping) its own checks.
export async function parseJsonBody<T>(
  request: NextRequest,
  schema: ZodType<T>
): Promise<ParseResult<T>> {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return {
      error: NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    return {
      error: NextResponse.json(
        {
          error: "Invalid request.",
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}
