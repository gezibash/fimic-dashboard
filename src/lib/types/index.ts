// Export all validation types for use across the application

// Re-export Zod for convenience when creating custom schemas
export { z } from 'zod';
export type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  Id,
  Pagination,
  UserIdParams,
  UserPhoneQuery,
  UserRegistrationInput,
  UserUpdateInput,
} from '@/lib/validations';
