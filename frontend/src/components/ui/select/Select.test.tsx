import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Select from './Select';

describe('Select', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  it('renders with default props', () => {
    render(<Select options={options} placeholder="Select an option" />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveClass('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} placeholder="Select an option" />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Select options={options} disabled placeholder="Select an option" />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:opacity-50');
  });

  it('renders with error state', () => {
    render(<Select options={options} error placeholder="Select an option" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('renders with custom className', () => {
    render(<Select options={options} className="custom-class" placeholder="Select an option" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('displays selected value', () => {
    render(<Select options={options} value="2" placeholder="Select an option" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('2');
  });
}); 