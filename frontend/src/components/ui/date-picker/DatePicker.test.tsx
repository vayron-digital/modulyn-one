import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DatePicker from './DatePicker';

describe('DatePicker', () => {
  it('renders with default props', () => {
    render(<DatePicker placeholder="Select date" />);
    const input = screen.getByPlaceholderText(/select date/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50');
  });

  it('handles date selection', () => {
    const handleChange = vi.fn();
    render(<DatePicker onChange={handleChange} placeholder="Select date" />);
    const input = screen.getByPlaceholderText(/select date/i);
    fireEvent.change(input, { target: { value: '2024-03-20' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<DatePicker disabled placeholder="Select date" />);
    const input = screen.getByPlaceholderText(/select date/i);
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('renders with error state', () => {
    render(<DatePicker error placeholder="Select date" />);
    const input = screen.getByPlaceholderText(/select date/i);
    expect(input).toHaveClass('border-red-500');
  });

  it('renders with custom className', () => {
    render(<DatePicker className="custom-class" placeholder="Select date" />);
    const input = screen.getByPlaceholderText(/select date/i);
    expect(input).toHaveClass('custom-class');
  });

  it('displays selected date', () => {
    render(<DatePicker value="2024-03-20" placeholder="Select date" />);
    const input = screen.getByPlaceholderText(/select date/i);
    expect(input).toHaveValue('2024-03-20');
  });

  it('handles min date constraint', () => {
    render(<DatePicker min="2024-03-01" placeholder="Select date" />);
    const input = screen.getByPlaceholderText(/select date/i);
    expect(input).toHaveAttribute('min', '2024-03-01');
  });

  it('handles max date constraint', () => {
    render(<DatePicker max="2024-03-31" placeholder="Select date" />);
    const input = screen.getByPlaceholderText(/select date/i);
    expect(input).toHaveAttribute('max', '2024-03-31');
  });
}); 