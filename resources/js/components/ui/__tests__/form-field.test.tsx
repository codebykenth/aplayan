import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../form-field';
import { Input } from '../input';

describe('FormField', () => {
  it('renders label and children', () => {
    render(
      <FormField label="Name">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    render(
      <FormField label="Email" required>
        <Input />
      </FormField>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(
      <FormField label="Name" error="Name is required">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('sets aria-invalid on child when error exists', () => {
    render(
      <FormField label="Name" error="Name is required">
        <Input data-testid="input" />
      </FormField>,
    );
    expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(
      <FormField label="Name">
        <Input data-testid="input" />
      </FormField>,
    );
    expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid');
  });

  it('passes htmlFor to Label', () => {
    render(
      <FormField label="Name" htmlFor="name-input">
        <Input id="name-input" />
      </FormField>,
    );
    const label = screen.getByText('Name');
    expect(label).toHaveAttribute('for', 'name-input');
  });

  it('renders without label when not provided', () => {
    const { container } = render(
      <FormField>
        <Input />
      </FormField>,
    );
    const labels = container.querySelectorAll('[data-slot="label"]');
    expect(labels.length).toBe(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormField label="Name" className="custom-class">
        <Input />
      </FormField>,
    );
    expect(container.querySelector('[data-slot="form-field"]')?.className).toContain('custom-class');
  });
});
