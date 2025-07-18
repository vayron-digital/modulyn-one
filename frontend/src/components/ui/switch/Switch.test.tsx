import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Switch from './Switch';

describe('Switch', () => {
  it('renders with default props', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  });

  it('renders with label', () => {
    render(<Switch label="Toggle me" />);
    expect(screen.getByText('Toggle me')).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Switch defaultChecked />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Switch onChange={handleChange} />);
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveClass('opacity-50');
  });

  it('renders with error state', () => {
    render(<Switch error />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('border-red-500');
  });

  it('renders with custom className', () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Switch size="sm" />);
    expect(screen.getByRole('switch')).toHaveClass('h-4 w-8');

    rerender(<Switch size="lg" />);
    expect(screen.getByRole('switch')).toHaveClass('h-6 w-12');
  });

  it('renders with different colors', () => {
    const { rerender } = render(<Switch color="blue" />);
    expect(screen.getByRole('switch')).toHaveClass('bg-blue-500');

    rerender(<Switch color="green" />);
    expect(screen.getByRole('switch')).toHaveClass('bg-green-500');

    rerender(<Switch color="red" />);
    expect(screen.getByRole('switch')).toHaveClass('bg-red-500');
  });

  it('renders with thumb icon', () => {
    render(<Switch thumbIcon={<span>Icon</span>} />);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(<Switch loading />);
    expect(screen.getByTestId('switch-loading')).toBeInTheDocument();
  });
}); 