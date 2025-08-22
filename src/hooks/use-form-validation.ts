import { useCallback, useState } from 'react';
import { z } from 'zod';

export type UseFormValidationOptions<T> = {
  schema: z.ZodSchema<T>;
  initialValues?: Partial<T>;
  onSubmit?: (values: T) => void | Promise<void>;
};

export type UseFormValidationReturn<T> = {
  values: Partial<T>;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateAll: () => boolean;
  handleSubmit: (event?: React.FormEvent) => Promise<void>;
  reset: () => void;
};

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  initialValues = {},
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const validateField = useCallback(
    <K extends keyof T>(field: K): boolean => {
      try {
        // Create a partial schema for single field validation
        const fieldSchema = schema.pick({ [field]: true } as any);
        const fieldValue = { [field]: values[field] };
        fieldSchema.parse(fieldValue);

        // Remove error if validation passes
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors[0];
          setErrors((prev) => ({
            ...prev,
            [field as string]: fieldError.message,
          }));
        }
        return false;
      }
    },
    [schema, values]
  );

  const validateAll = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, values]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      try {
        if (validateAll() && onSubmit) {
          // Type-safe parsed values from Zod
          const validatedValues = schema.parse(values);
          await onSubmit(validatedValues);
        }
      } catch (_error) {
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, validateAll, onSubmit, schema, values]
  );

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid =
    Object.keys(errors).length === 0 && Object.keys(values).length > 0;

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    validateField,
    validateAll,
    handleSubmit,
    reset,
  };
}
