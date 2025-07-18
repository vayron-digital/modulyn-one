import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Table from './Table';

describe('Table', () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Age', accessor: 'age' },
    { header: 'Email', accessor: 'email' },
  ];

  const data = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  ];

  it('renders table with headers and data', () => {
    render(<Table columns={columns} data={data} />);

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();

    // Check data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles sorting', () => {
    const onSort = vi.fn();
    render(<Table columns={columns} data={data} onSort={onSort} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('renders with custom className', () => {
    render(<Table columns={columns} data={data} className="custom-class" />);
    const table = screen.getByRole('table');
    expect(table).toHaveClass('custom-class');
  });

  it('renders with loading state', () => {
    render(<Table columns={columns} data={data} isLoading={true} />);
    expect(screen.getByTestId('table-loading')).toBeInTheDocument();
  });

  it('renders with error state', () => {
    render(<Table columns={columns} data={data} error="Error loading data" />);
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });

  it('handles row click', () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={onRowClick} />);

    const row = screen.getByText('John Doe').closest('tr');
    fireEvent.click(row);
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('renders with pagination', () => {
    render(
      <Table
        columns={columns}
        data={data}
        pagination={{
          currentPage: 1,
          totalPages: 5,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
}); 