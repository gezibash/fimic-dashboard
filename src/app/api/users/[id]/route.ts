import { ConvexHttpClient } from 'convex/browser';
import { type NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? '');

function validateName(name: unknown) {
  return name !== undefined && (typeof name !== 'string' || !name.trim());
}

function validateEmail(email: unknown) {
  return (
    email !== undefined &&
    email &&
    typeof email === 'string' &&
    !EMAIL_REGEX.test(email)
  );
}

function handleConvexError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('User not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    if (error.message.includes('Email already registered')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered by another user',
          code: 'EMAIL_EXISTS',
        },
        { status: 409 }
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Failed to update user',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

// GET user by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
          code: 'MISSING_ID',
        },
        { status: 400 }
      );
    }

    // Call Convex query to get user by ID
    const user = await client.query(api.queries.getUserById, {
      id: id as Id<'users'>,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve user',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// PATCH (update) user by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, avatarUrl } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
          code: 'MISSING_ID',
        },
        { status: 400 }
      );
    }

    // Server-side validation
    if (validateName(name)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name must be a non-empty string',
          code: 'INVALID_NAME',
        },
        { status: 400 }
      );
    }

    // Email validation (if provided)
    if (validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT',
        },
        { status: 400 }
      );
    }

    // Call Convex mutation to update user
    const updatedUser = await client.mutation(api.users.updateUser, {
      userId: id as Id<'users'>,
      name: name ? name.trim() : undefined,
      email: email || undefined,
      avatarUrl: avatarUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
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
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
          code: 'MISSING_ID',
        },
        { status: 400 }
      );
    }

    // Call Convex mutation to delete user
    const result = await client.mutation(api.users.deleteUser, {
      userId: id as Id<'users'>,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Handle Convex errors
    if (error instanceof Error && error.message.includes('User not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
