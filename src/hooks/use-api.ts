import { useCallback, useState } from 'react';
import { z } from 'zod';
import { type ApiResponse, apiResponseSchema } from '@/lib/validations';

export type UseApiOptions<T, P = unknown> = {
  responseSchema?: z.ZodSchema<T>;
  requestSchema?: z.ZodSchema<P>;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
};

export type UseApiReturn<T, P = unknown> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (payload?: P) => Promise<T | null>;
  reset: () => void;
};

export function useApi<T, P = unknown>(
  url: string,
  options: UseApiOptions<T, P> = {}
): UseApiReturn<T, P> {
  const { responseSchema, requestSchema, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (payload?: P): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate request payload if schema provided
        if (requestSchema && payload !== undefined) {
          try {
            requestSchema.parse(payload);
          } catch (validationError) {
            if (validationError instanceof z.ZodError) {
              const errorMessage =
                validationError.errors[0]?.message || 'Invalid request data';
              setError(errorMessage);
              onError?.(errorMessage);
              return null;
            }
          }
        }

        // Make API request
        const response = await fetch(url, {
          method: payload ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload ? JSON.stringify(payload) : undefined,
        });

        const responseData = await response.json();

        // Validate API response structure
        const apiResponse = apiResponseSchema.parse(
          responseData
        ) as ApiResponse;

        if (!apiResponse.success) {
          setError(apiResponse.error);
          onError?.(apiResponse.error);
          return null;
        }

        // Validate response data if schema provided
        let validatedData: T;
        if (responseSchema) {
          try {
            validatedData = responseSchema.parse(apiResponse.data);
          } catch (validationError) {
            if (validationError instanceof z.ZodError) {
              const errorMessage = 'Invalid response data format';
              setError(errorMessage);
              onError?.(errorMessage);
              return null;
            }
            throw validationError;
          }
        } else {
          validatedData = apiResponse.data as T;
        }

        setData(validatedData);
        onSuccess?.(validatedData);
        return validatedData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [url, responseSchema, requestSchema, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}

// Convenience hooks for specific API endpoints
export function useUserApi() {
  return useApi<any>('/api/users');
}

export function useUserRegistration() {
  return useApi<any, any>('/api/users/register', {
    requestSchema: z.object({
      name: z.string().min(1),
      phone: z.string(),
      email: z.string().optional(),
      avatarUrl: z.string().optional(),
    }),
  });
}
