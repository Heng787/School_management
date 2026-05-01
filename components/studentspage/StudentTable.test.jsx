// Auto-generated test scaffolding
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentTable from './StudentTable.jsx';
import '@testing-library/jest-dom';

vi.mock('./StudentTableRow', () => ({
  default: ({ student }) => <tr data-testid="student-row"><td>{student.name}</td></tr>
}));

describe('StudentTable', () => {
  const defaultProps = {
    filteredStudents: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ],
    currentPage: 1,
    setCurrentPage: vi.fn(),
    pageSize: 10,
    setPageSize: vi.fn(),
    highlightedStudentId: null,
    displayClassesMap: {},
    staff: [],
    isAdmin: true,
    isOffice: false,
    selectedStudentIds: new Set(),
    isDeletingId: null,
    onSelectStudent: vi.fn(),
    onSelectAllOnPage: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onReportCard: vi.fn(),
    loading: false,
  };

  it('renders student rows correctly', () => {
    render(<StudentTable {...defaultProps} />);
    expect(screen.getAllByTestId('student-row')).toHaveLength(2);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows empty state when no students found', () => {
    render(<StudentTable {...defaultProps} filteredStudents={[]} />);
    expect(screen.getByText('No students found')).toBeInTheDocument();
  });

  it('handles pagination next button click', () => {
    render(<StudentTable {...defaultProps} filteredStudents={Array(15).fill({ id: '1', name: 'X' })} />);
    const nextBtn = screen.getByLabelText('Next Page');
    fireEvent.click(nextBtn);
    expect(defaultProps.setCurrentPage).toHaveBeenCalled();
  });

  it('shows loading skeletons', () => {
    render(<StudentTable {...defaultProps} loading={true} />);
    expect(screen.getAllByRole('row')).toHaveLength(11); // 1 header + 10 skeletons
  });
});

