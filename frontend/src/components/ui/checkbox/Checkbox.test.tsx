import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('renders with default props', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders with label', () => {
    render(<Checkbox label="Check me" />);
    expect(screen.getByText('Check me')).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Checkbox defaultChecked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass('opacity-50');
  });

  it('renders with error state', () => {
    render(<Checkbox error />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('border-red-500');
  });

  it('renders with custom className', () => {
    render(<Checkbox className="custom-class" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Checkbox size="sm" />);
    expect(screen.getByRole('checkbox')).toHaveClass('h-4 w-4');

    rerender(<Checkbox size="lg" />);
    expect(screen.getByRole('checkbox')).toHaveClass('h-6 w-6');
  });

  it('renders with indeterminate state', () => {
    render(<Checkbox indeterminate />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-indeterminate', 'true');
  });

  it('renders with required state', () => {
    render(<Checkbox required />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeRequired();
  });
}); 