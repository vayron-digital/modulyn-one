import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from './Card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-lg border bg-card text-card-foreground shadow-sm');
  });

  it('renders with header', () => {
    render(
      <Card>
        <Card.Header>Card Header</Card.Header>
        <Card.Content>Card content</Card.Content>
      </Card>
    );

    expect(screen.getByText('Card Header')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(
      <Card>
        <Card.Content>Card content</Card.Content>
        <Card.Footer>Card Footer</Card.Footer>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>Card Title</Card.Title>
          <Card.Description>Card Description</Card.Description>
        </Card.Header>
        <Card.Content>Card content</Card.Content>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Card className="custom-class">Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toHaveClass('custom-class');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Card variant="outlined">Outlined</Card>);
    expect(screen.getByText('Outlined')).toHaveClass('border');

    rerender(<Card variant="elevated">Elevated</Card>);
    expect(screen.getByText('Elevated')).toHaveClass('shadow-lg');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Card size="sm">Small</Card>);
    expect(screen.getByText('Small')).toHaveClass('p-4');

    rerender(<Card size="lg">Large</Card>);
    expect(screen.getByText('Large')).toHaveClass('p-6');
  });
}); 