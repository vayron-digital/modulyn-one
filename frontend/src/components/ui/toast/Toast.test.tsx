import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with message and type', () => {
    render(<Toast message="Test message" type="success" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByTestId('toast')).toHaveClass('bg-green-500');
  });

  it('renders with different types', () => {
    const { rerender } = render(<Toast message="Error message" type="error" />);
    expect(screen.getByTestId('toast')).toHaveClass('bg-red-500');

    rerender(<Toast message="Warning message" type="warning" />);
    expect(screen.getByTestId('toast')).toHaveClass('bg-yellow-500');

    rerender(<Toast message="Info message" type="info" />);
    expect(screen.getByTestId('toast')).toHaveClass('bg-blue-500');
  });

  it('auto-dismisses after duration', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test message" type="success" onDismiss={onDismiss} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('handles manual dismiss', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test message" type="success" onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<Toast message="Test message" type="success" className="custom-class" />);
    expect(screen.getByTestId('toast')).toHaveClass('custom-class');
  });

  it('renders with icon', () => {
    render(<Toast message="Test message" type="success" icon={<span>Icon</span>} />);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const onAction = vi.fn();
    render(
      <Toast
        message="Test message"
        type="success"
        action={{ label: 'Undo', onClick: onAction }}
      />
    );

    const actionButton = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(actionButton);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
}); 