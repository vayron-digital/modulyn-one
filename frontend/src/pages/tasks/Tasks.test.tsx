import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Tasks from './Tasks';
import { supabase } from '../lib/supabase';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              data: [
                {
                  id: '1',
                  title: 'Test Task',
                  description: 'Test Description',
                  status: 'pending',
                  priority: 'high',
                  due_date: '2024-03-20',
                  assigned_to: 'user1',
                },
              ],
              error: null,
              count: 1,
            })),
          })),
        })),
      })),
    })),
  },
}));

// Mock useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1' },
  }),
}));

describe('Tasks', () => {
  it('renders tasks list', async () => {
    render(
      <BrowserRouter>
        <Tasks />
      </BrowserRouter>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Check if task details are displayed
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    render(
      <BrowserRouter>
        <Tasks />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for search to be applied
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });
  });

  it('handles status filter', async () => {
    render(
      <BrowserRouter>
        <Tasks />
      </BrowserRouter>
    );

    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    fireEvent.change(statusFilter, { target: { value: 'completed' } });

    // Wait for filter to be applied
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });
  });

  it('handles priority filter', async () => {
    render(
      <BrowserRouter>
        <Tasks />
      </BrowserRouter>
    );

    const priorityFilter = screen.getByRole('combobox', { name: /priority/i });
    fireEvent.change(priorityFilter, { target: { value: 'high' } });

    // Wait for filter to be applied
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });
  });
}); 