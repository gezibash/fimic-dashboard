import { z } from 'zod';

// Phone number regex patterns from existing code
const SWISS_PHONE_REGEX = /^\+41[1-9]\d{8}$/;
const KOSOVO_PHONE_REGEX = /^\+383[4-9]\d{7,8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Base phone validation schema
export const phoneSchema = z
  .string()
  .refine(
    (phone) => SWISS_PHONE_REGEX.test(phone) || KOSOVO_PHONE_REGEX.test(phone),
    {
      message:
        'Invalid phone number format. Please use Swiss (+41XXXXXXXXX) or Kosovo (+383XXXXXXXX) format',
    }
  );

// Email validation schema
export const emailSchema = z
  .string()
  .regex(EMAIL_REGEX, 'Invalid email format')
  .optional();

// User registration schema
export const userRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  phone: phoneSchema,
  email: emailSchema,
  avatarUrl: z.url('Invalid URL format').optional(),
});

// User query by phone schema
export const userPhoneQuerySchema = z.object({
  phone: phoneSchema,
});

// API response schemas
export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.enum([
    'INVALID_NAME',
    'MISSING_PHONE',
    'INVALID_PHONE_FORMAT',
    'INVALID_EMAIL_FORMAT',
    'PHONE_EXISTS',
    'EMAIL_EXISTS',
    'USER_NOT_FOUND',
    'INTERNAL_ERROR',
  ]),
});

export const apiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export const apiResponseSchema = z.union([apiErrorSchema, apiSuccessSchema]);

// User update schema (all fields optional except id)
export const userUpdateSchema = z.object({
  name: z.string().min(1).trim().optional(),
  email: emailSchema,
  avatarUrl: z.string().url('Invalid URL format').optional(),
});

// ID parameter schema
export const userIdParamsSchema = z.object({
  id: z.string().min(1),
});

// OTP verification schema
export const otpVerificationSchema = z.object({
  phone: phoneSchema,
  otp: z.string().min(1, 'OTP is required'),
  timestamp: z.number().int().positive(),
});

// Check user existence schema
export const checkUserSchema = z.object({
  phone: z
    .string()
    .regex(
      /^(\+41\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}|\+383\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3})$/,
      'Invalid phone number format. Please use Swiss (+41) or Kosovo (+383) format'
    ),
});

// Type exports using Zod inference
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type UserPhoneQuery = z.infer<typeof userPhoneQuerySchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;
export type CheckUserInput = z.infer<typeof checkUserSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess = z.infer<typeof apiSuccessSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
