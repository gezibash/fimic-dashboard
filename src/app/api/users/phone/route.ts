import { ConvexHttpClient } from 'convex/browser';
import type { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  validateSearchParams,
} from '@/lib/utils';
import { userPhoneQuerySchema } from '@/lib/validations/user';
import { api } from '../../../../../convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate search parameters with Zod
    const validation = validateSearchParams(userPhoneQuerySchema, searchParams);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return createErrorResponse(
        firstError.message,
        firstError.path.includes('phone')
          ? 'INVALID_PHONE_FORMAT'
          : 'VALIDATION_ERROR',
        400
      );
    }

    const { phone } = validation.data;

    // Call Convex query to find user by phone
    const user = await client.query(api.users.getUserByPhone, { phone });

    if (!user) {
      return createErrorResponse('User not found', 'USER_NOT_FOUND', 404);
    }

    return createSuccessResponse(user);
  } catch (_error) {
    return createErrorResponse(
      'Failed to retrieve user',
      'INTERNAL_ERROR',
      500
    );
  }
}
