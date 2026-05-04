// Auto-generated test scaffolding
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentModal from '.././StudentModal.jsx';
import { useData } from '../../../../../context/DataContext';
import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock( '../../../../context/DataContext', () => ({
  useData: vi.fn(),
}));

describe('StudentModal', () => {
  const mockAddStudent = vi.fn();
  const mockUpdateStudent = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useData.mockReturnValue({
      addStudent: mockAddStudent,
      updateStudent: mockUpdateStudent,
      levels: ['K1', 'K2'],
    });
  });

  it('renders correctly in creation mode', () => {
    render(<StudentModal onClose={mockOnClose} />);
    expect(screen.getByText(/Register New Student/i)).toBeInTheDocument();
  });

  it('renders correctly in update mode', () => {
    const student = { id: 's1', name: 'John Doe', sex: 'Male', status: 'Pending' };
    render(<StudentModal studentData={student} onClose={mockOnClose} />);
    expect(screen.getByText(/Update Student Record/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('shows error if name is missing', async () => {
    render(<StudentModal onClose={mockOnClose} />);
    const submitBtn = screen.getByText('Save Student');
    const form = submitBtn.closest('form');
    
    fireEvent.submit(form);
    
    const errorBanner = await screen.findByText(/Please provide at least a Name and Gender/i);
    expect(errorBanner).toBeInTheDocument();
  });

  it('calls addStudent on valid submission', async () => {
    render(<StudentModal onClose={mockOnClose} />);
    
    const nameLabel = screen.getByText(/Full Name/i);
    const nameInput = nameLabel.nextElementSibling;
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Alice Smith' } });
    
    const submitBtn = screen.getByText('Save Student');
    const form = submitBtn.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockAddStudent).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});

