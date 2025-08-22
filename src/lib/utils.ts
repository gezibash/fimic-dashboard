import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Validation utilities for API routes
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

export function validateSearchParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const params = Object.fromEntries(searchParams);
  const result = schema.safeParse(params);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

export function createErrorResponse(
  message: string,
  code: string,
  status: number
) {
  return Response.json(
    {
      success: false,
      error: message,
      code,
    },
    { status }
  );
}

export function createSuccessResponse<T>(data: T) {
  return Response.json({
    success: true,
    data,
  });
}

export function validateRouteParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(params);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}
