import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders with image', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User avatar" />);
    const avatar = screen.getByAltText('User avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders with fallback when image fails to load', () => {
    render(<Avatar src="invalid-url" alt="User avatar" fallback="JD" />);
    const fallback = screen.getByText('JD');
    expect(fallback).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Avatar size="sm" src="https://example.com/avatar.jpg" alt="User avatar" />);
    expect(screen.getByAltText('User avatar')).toHaveClass('h-8 w-8');

    rerender(<Avatar size="md" src="https://example.com/avatar.jpg" alt="User avatar" />);
    expect(screen.getByAltText('User avatar')).toHaveClass('h-10 w-10');

    rerender(<Avatar size="lg" src="https://example.com/avatar.jpg" alt="User avatar" />);
    expect(screen.getByAltText('User avatar')).toHaveClass('h-12 w-12');
  });

  it('renders with custom className', () => {
    render(<Avatar className="custom-class" src="https://example.com/avatar.jpg" alt="User avatar" />);
    expect(screen.getByAltText('User avatar')).toHaveClass('custom-class');
  });

  it('renders with status indicator', () => {
    render(
      <Avatar
        src="https://example.com/avatar.jpg"
        alt="User avatar"
        status="online"
      />
    );
    const status = screen.getByTestId('avatar-status');
    expect(status).toHaveClass('bg-green-500');
  });

  it('renders with different status colors', () => {
    const { rerender } = render(
      <Avatar
        src="https://example.com/avatar.jpg"
        alt="User avatar"
        status="offline"
      />
    );
    expect(screen.getByTestId('avatar-status')).toHaveClass('bg-gray-500');

    rerender(
      <Avatar
        src="https://example.com/avatar.jpg"
        alt="User avatar"
        status="away"
      />
    );
    expect(screen.getByTestId('avatar-status')).toHaveClass('bg-yellow-500');

    rerender(
      <Avatar
        src="https://example.com/avatar.jpg"
        alt="User avatar"
        status="busy"
      />
    );
    expect(screen.getByTestId('avatar-status')).toHaveClass('bg-red-500');
  });

  it('renders with group', () => {
    render(
      <Avatar.Group>
        <Avatar src="https://example.com/avatar1.jpg" alt="User 1" />
        <Avatar src="https://example.com/avatar2.jpg" alt="User 2" />
        <Avatar src="https://example.com/avatar3.jpg" alt="User 3" />
      </Avatar.Group>
    );

    expect(screen.getByAltText('User 1')).toBeInTheDocument();
    expect(screen.getByAltText('User 2')).toBeInTheDocument();
    expect(screen.getByAltText('User 3')).toBeInTheDocument();
  });
}); 