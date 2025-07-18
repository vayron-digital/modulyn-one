import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Textarea from './Textarea';

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:opacity-50');
  });

  it('renders with error state', () => {
    render(<Textarea error placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    expect(textarea).toHaveClass('border-red-500');
  });

  it('renders with custom className', () => {
    render(<Textarea className="custom-class" placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    expect(textarea).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Textarea size="sm" placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toHaveClass('text-sm');

    rerender(<Textarea size="lg" placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toHaveClass('text-lg');
  });

  it('renders with label', () => {
    render(<Textarea label="Description" placeholder="Enter text" />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Textarea helperText="This is a helper text" placeholder="Enter text" />);
    expect(screen.getByText('This is a helper text')).toBeInTheDocument();
  });

  it('renders with required state', () => {
    render(<Textarea required placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    expect(textarea).toBeRequired();
  });

  it('renders with maxLength', () => {
    render(<Textarea maxLength={100} placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('renders with rows', () => {
    render(<Textarea rows={5} placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    expect(textarea).toHaveAttribute('rows', '5');
  });
}); 