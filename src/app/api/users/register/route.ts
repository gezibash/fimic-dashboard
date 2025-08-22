import { ConvexHttpClient } from 'convex/browser';
import { type NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../../convex/_generated/api';

const PHONE_REGEX = /^(\+41[1-9]\d{8}|\+383[4-9]\d{7,8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
}
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, avatarUrl } = body;

    // Server-side validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required and must be a non-empty string',
          code: 'INVALID_NAME',
        },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number is required',
          code: 'MISSING_PHONE',
        },
        { status: 400 }
      );
    }

    // Phone format validation
    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid phone number format. Please use Swiss (+41XXXXXXXXX) or Kosovo (+383XXXXXXXX) format',
          code: 'INVALID_PHONE_FORMAT',
        },
        { status: 400 }
      );
    }

    // Email validation (if provided)
    if (email && typeof email === 'string') {
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid email format',
            code: 'INVALID_EMAIL_FORMAT',
          },
          { status: 400 }
        );
      }
    }

    // Call Convex mutation
    const user = await client.mutation(api.users.registerUser, {
      name: name.trim(),
      phone,
      email: email || undefined,
      avatarUrl: avatarUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {

    // Handle Convex errors
    if (error instanceof Error) {
      if (error.message.includes('Phone number already registered')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Phone number already registered',
            code: 'PHONE_EXISTS',
          },
          { status: 409 }
        );
      }

      if (error.message.includes('Email already registered')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email already registered',
            code: 'EMAIL_EXISTS',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
