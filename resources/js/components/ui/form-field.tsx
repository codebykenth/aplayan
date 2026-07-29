import { Children, cloneElement, isValidElement } from 'react';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/ui/input-error';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({
  label,
  error,
  required,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  const child = Children.only(children);

  const enhancedChild = isValidElement(child)
    ? cloneElement(
        child as React.ReactElement<{ 'aria-invalid'?: boolean }>,
        { 'aria-invalid': !!error || undefined },
      )
    : child;

  return (
    <div className={cn('flex flex-col gap-2', className)} data-slot="form-field">
      {label && (
        <Label htmlFor={htmlFor} data-slot="form-field-label">
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {enhancedChild}
      <InputError message={error} />
    </div>
  );
}
