import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tabs from './Tabs';

describe('Tabs', () => {
  it('renders with default props', () => {
    render(
      <Tabs>
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
      </Tabs>
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches content when tab is clicked', () => {
    render(
      <Tabs>
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
      </Tabs>
    );

    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('calls onValueChange when tab is clicked', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs onValueChange={onValueChange}>
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
      </Tabs>
    );

    fireEvent.click(screen.getByText('Tab 2'));
    expect(onValueChange).toHaveBeenCalledWith('tab2');
  });

  it('renders with custom className', () => {
    render(
      <Tabs className="custom-class">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
      </Tabs>
    );

    expect(screen.getByRole('tablist')).toHaveClass('custom-class');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Tabs variant="outlined">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
      </Tabs>
    );
    expect(screen.getByRole('tablist')).toHaveClass('border');

    rerender(
      <Tabs variant="pills">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
      </Tabs>
    );
    expect(screen.getByRole('tablist')).toHaveClass('bg-muted');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Tabs size="sm">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
      </Tabs>
    );
    expect(screen.getByRole('tab')).toHaveClass('text-sm');

    rerender(
      <Tabs size="lg">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
      </Tabs>
    );
    expect(screen.getByRole('tab')).toHaveClass('text-lg');
  });
}); 