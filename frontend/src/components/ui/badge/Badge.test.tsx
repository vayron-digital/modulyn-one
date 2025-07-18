import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from './Badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('border');

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('text-xs');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('text-base');
  });

  it('renders with custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });

  it('renders with icon', () => {
    render(<Badge icon={<span>Icon</span>}>With Icon</Badge>);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('renders with different colors', () => {
    const { rerender } = render(<Badge color="blue">Blue</Badge>);
    expect(screen.getByText('Blue')).toHaveClass('bg-blue-500');

    rerender(<Badge color="green">Green</Badge>);
    expect(screen.getByText('Green')).toHaveClass('bg-green-500');

    rerender(<Badge color="red">Red</Badge>);
    expect(screen.getByText('Red')).toHaveClass('bg-red-500');
  });
}); 