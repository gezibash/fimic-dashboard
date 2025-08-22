import { ConvexHttpClient } from 'convex/browser';
import type { NextRequest } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { api } from '../../../../convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

export async function GET(_request: NextRequest) {
  try {
    // Call Convex query to get all users
    const users = await client.query(api.queries.getAllUsers);

    return createSuccessResponse(users);
  } catch (_error) {
    return createErrorResponse(
      'Failed to retrieve users',
      'INTERNAL_ERROR',
      500
    );
  }
}
