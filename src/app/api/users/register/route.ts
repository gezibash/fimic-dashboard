import { ConvexHttpClient } from 'convex/browser';
import type { NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
} from '@/lib/utils';
import { userRegistrationSchema } from '@/lib/validations/user';
import { api } from '../../../../../convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

function handleRegistrationError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('Phone number already registered')) {
      return createErrorResponse(
        'Phone number already registered',
        'PHONE_EXISTS',
        409
      );
    }

    if (error.message.includes('Email already registered')) {
      return createErrorResponse(
        'Email already registered',
        'EMAIL_EXISTS',
        409
      );
    }
  }

  return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validation = validateRequestBody(userRegistrationSchema, body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      let errorCode = 'VALIDATION_ERROR';

      if (firstError.code === 'too_small' && firstError.path.includes('name')) {
        errorCode = 'INVALID_NAME';
      } else if (firstError.path.includes('phone')) {
        errorCode = 'INVALID_PHONE_FORMAT';
      } else if (firstError.path.includes('email')) {
        errorCode = 'INVALID_EMAIL_FORMAT';
      }

      return createErrorResponse(firstError.message, errorCode, 400);
    }

    const { name, phone, email, avatarUrl } = validation.data;

    // Call Convex mutation
    const user = await client.mutation(api.users.registerUser, {
      name,
      phone,
      email,
      avatarUrl,
    });

    return createSuccessResponse(user);
  } catch (error) {
    return handleRegistrationError(error);
  }
}
