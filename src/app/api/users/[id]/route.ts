import { ConvexHttpClient } from 'convex/browser';
import type { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
  validateRouteParams,
} from '@/lib/utils';
import { userIdParamsSchema, userUpdateSchema } from '@/lib/validations/user';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

function handleConvexError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('User not found')) {
      return createErrorResponse('User not found', 'USER_NOT_FOUND', 404);
    }

    if (error.message.includes('Email already registered')) {
      return createErrorResponse(
        'Email already registered by another user',
        'EMAIL_EXISTS',
        409
      );
    }
  }

  return createErrorResponse('Failed to update user', 'INTERNAL_ERROR', 500);
}

// GET user by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeParams = await params;

    // Validate route parameters
    const validation = validateRouteParams(userIdParamsSchema, routeParams);
    if (!validation.success) {
      return createErrorResponse('User ID is required', 'MISSING_ID', 400);
    }

    const { id } = validation.data;

    // Call Convex query to get user by ID
    const user = await client.query(api.queries.getUserById, {
      id: id as Id<'users'>,
    });

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

// PATCH (update) user by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeParams = await params;
    const body = await request.json();

    // Validate route parameters
    const paramsValidation = validateRouteParams(
      userIdParamsSchema,
      routeParams
    );
    if (!paramsValidation.success) {
      return createErrorResponse('User ID is required', 'MISSING_ID', 400);
    }

    // Validate request body
    const bodyValidation = validateRequestBody(userUpdateSchema, body);
    if (!bodyValidation.success) {
      const firstError = bodyValidation.error.issues[0];
      let errorCode = 'VALIDATION_ERROR';
      if (firstError.path.includes('name')) {
        errorCode = 'INVALID_NAME';
      } else if (firstError.path.includes('email')) {
        errorCode = 'INVALID_EMAIL_FORMAT';
      }

      return createErrorResponse(firstError.message, errorCode, 400);
    }

    const { id } = paramsValidation.data;
    const { name, email, avatarUrl } = bodyValidation.data;

    // Call Convex mutation to update user
    const updatedUser = await client.mutation(api.users.updateUser, {
      userId: id as Id<'users'>,
      name,
      email,
      avatarUrl,
    });

    return createSuccessResponse(updatedUser);
  } catch (error) {
    return handleConvexError(error);
  }
}

// DELETE user by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const routeParams = await params;

    // Validate route parameters
    const validation = validateRouteParams(userIdParamsSchema, routeParams);
    if (!validation.success) {
      return createErrorResponse('User ID is required', 'MISSING_ID', 400);
    }

    const { id } = validation.data;

    // Call Convex mutation to delete user
    const result = await client.mutation(api.users.deleteUser, {
      userId: id as Id<'users'>,
    });

    return createSuccessResponse(result);
  } catch (error) {
    // Handle Convex errors
    if (error instanceof Error && error.message.includes('User not found')) {
      return createErrorResponse('User not found', 'USER_NOT_FOUND', 404);
    }

    return createErrorResponse('Failed to delete user', 'INTERNAL_ERROR', 500);
  }
}
