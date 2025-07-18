import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dropdown from './Dropdown';

describe('Dropdown', () => {
  it('renders trigger button', () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );

    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('shows content when trigger is clicked', () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );

    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('hides content when clicking outside', () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );

    fireEvent.click(screen.getByText('Open Menu'));
    fireEvent.click(document.body);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
  });

  it('calls onSelect when item is clicked', () => {
    const onSelect = vi.fn();
    render(
      <Dropdown>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item onSelect={onSelect}>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );

    fireEvent.click(screen.getByText('Open Menu'));
    fireEvent.click(screen.getByText('Item 1'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(
      <Dropdown>
        <Dropdown.Trigger className="custom-trigger">Open Menu</Dropdown.Trigger>
        <Dropdown.Content className="custom-content">
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );

    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Open Menu')).toHaveClass('custom-trigger');
    expect(screen.getByText('Item 1').parentElement).toHaveClass('custom-content');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Dropdown>
        <Dropdown.Trigger variant="outlined">Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );
    expect(screen.getByText('Open Menu')).toHaveClass('border');

    rerender(
      <Dropdown>
        <Dropdown.Trigger variant="ghost">Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );
    expect(screen.getByText('Open Menu')).toHaveClass('hover:bg-muted');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Dropdown>
        <Dropdown.Trigger size="sm">Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );
    expect(screen.getByText('Open Menu')).toHaveClass('text-sm');

    rerender(
      <Dropdown>
        <Dropdown.Trigger size="lg">Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );
    expect(screen.getByText('Open Menu')).toHaveClass('text-lg');
  });

  it('renders with disabled items', () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item disabled>Disabled Item</Dropdown.Item>
          <Dropdown.Item>Enabled Item</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    );

    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Disabled Item')).toHaveClass('opacity-50');
    expect(screen.getByText('Enabled Item')).not.toHaveClass('opacity-50');
  });
}); 