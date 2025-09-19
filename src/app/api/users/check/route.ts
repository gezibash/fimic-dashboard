import { ConvexHttpClient } from 'convex/browser';
import type { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
} from '@/lib/utils';
import { checkUserSchema } from '@/lib/validations/user';
import { api } from '../../../../../convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

export async function POST(request: NextRequest) {
  console.log('=== /api/users/check endpoint called ===');
  console.log('Method:', request.method);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));

  try {
    const body = await request.json();
    console.log('Received payload:', JSON.stringify(body, null, 2));

    // Validate request body
    const validation = validateRequestBody(checkUserSchema, body);
    console.log(
      'Validation result:',
      validation.success ? 'SUCCESS' : 'FAILED'
    );

    if (!validation.success) {
      console.log('Validation errors:', validation.error.issues);
      return createErrorResponse(
        validation.error.issues[0]?.message || 'Invalid request data',
        'VALIDATION_ERROR',
        400
      );
    }

    const { phone } = validation.data;
    console.log('Validated phone number:', phone);

    // Call Convex query to check if user exists by phone
    console.log('Querying Convex for user with phone:', phone);
    const user = await client.query(api.users.getUserByPhone, { phone });
    console.log(
      'Convex query result:',
      user ? `User found: ${user._id}` : 'No user found'
    );

    const response = {
      exists: !!user,
      name: user?.name || null,
      user: user || null,
    };
    console.log('Sending response:', JSON.stringify(response, null, 2));

    return createSuccessResponse(response);
  } catch (error) {
    console.error('Error in /api/users/check:', error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      console.log('JSON parsing error detected');
      return createErrorResponse(
        'Invalid JSON in request body',
        'INVALID_JSON',
        400
      );
    }

    console.log('Internal server error occurred');
    return createErrorResponse(
      'Failed to check user existence',
      'INTERNAL_ERROR',
      500
    );
  } finally {
    console.log('=== /api/users/check endpoint finished ===\n');
  }
}
