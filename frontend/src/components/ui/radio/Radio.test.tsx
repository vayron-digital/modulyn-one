import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Radio from './Radio';

describe('Radio', () => {
  it('renders with default props', () => {
    render(<Radio name="test" value="1" />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeInTheDocument();
    expect(radio).not.toBeChecked();
  });

  it('renders with label', () => {
    render(<Radio name="test" value="1" label="Option 1" />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Radio name="test" value="1" defaultChecked />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeChecked();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Radio name="test" value="1" onChange={handleChange} />);
    const radio = screen.getByRole('radio');
    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Radio name="test" value="1" disabled />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
    expect(radio).toHaveClass('opacity-50');
  });

  it('renders with error state', () => {
    render(<Radio name="test" value="1" error />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveClass('border-red-500');
  });

  it('renders with custom className', () => {
    render(<Radio name="test" value="1" className="custom-class" />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Radio name="test" value="1" size="sm" />);
    expect(screen.getByRole('radio')).toHaveClass('h-4 w-4');

    rerender(<Radio name="test" value="1" size="lg" />);
    expect(screen.getByRole('radio')).toHaveClass('h-6 w-6');
  });

  it('renders with required state', () => {
    render(<Radio name="test" value="1" required />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeRequired();
  });

  it('works in a radio group', () => {
    render(
      <div>
        <Radio name="test" value="1" label="Option 1" />
        <Radio name="test" value="2" label="Option 2" />
      </div>
    );

    const radio1 = screen.getByLabelText('Option 1');
    const radio2 = screen.getByLabelText('Option 2');

    fireEvent.click(radio1);
    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();

    fireEvent.click(radio2);
    expect(radio1).not.toBeChecked();
    expect(radio2).toBeChecked();
  });
}); 