/// Generic API response types that can be reused
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const idSchema = z.string().min(1);

export type Pagination = z.infer<typeof paginationSchema>;
export type Id = z.infer<typeof idSchema>;
