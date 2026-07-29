import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputError } from '../input-error';

describe('InputError', () => {
  it('renders error message when provided', () => {
    render(<InputError message="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders nothing when no message provided', () => {
    const { container } = render(<InputError />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when message is empty string', () => {
    const { container } = render(<InputError message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('applies destructive styling', () => {
    render(<InputError message="Error text" />);
    const element = screen.getByText('Error text');
    expect(element.className).toContain('text-destructive');
    expect(element.className).toContain('text-xs');
  });

  it('applies custom className', () => {
    render(<InputError message="Error" className="custom-class" />);
    const element = screen.getByText('Error');
    expect(element.className).toContain('custom-class');
  });

  it('has data-slot attribute', () => {
    render(<InputError message="Error" />);
    expect(screen.getByText('Error')).toHaveAttribute('data-slot', 'input-error');
  });
});
