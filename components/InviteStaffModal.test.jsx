// Auto-generated test scaffolding
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InviteStaffModal from './InviteStaffModal.jsx';
import { useData } from '../context/DataContext';
import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../context/DataContext', () => ({
  useData: vi.fn(),
}));

describe('InviteStaffModal', () => {
  const mockUpdateStaff = vi.fn();
  const mockOnClose = vi.fn();
  const mockStaff = { id: 't1', name: 'John Teacher', contact: 'john@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    useData.mockReturnValue({
      updateStaff: mockUpdateStaff,
    });
    vi.stubGlobal('alert', vi.fn());
  });

  it('renders correctly with staff name', () => {
    render(<InviteStaffModal staff={mockStaff} onClose={mockOnClose} />);
    expect(screen.getAllByText(/John Teacher/i).length).toBeGreaterThan(0);
  });

  it('shows error if passwords are too short', async () => {
    render(<InviteStaffModal staff={mockStaff} onClose={mockOnClose} />);
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: '123' } });
    fireEvent.change(passwordInputs[1], { target: { value: '123' } });
    
    fireEvent.click(screen.getByText('Save & Create Account'));
    
    expect(await screen.findByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<InviteStaffModal staff={mockStaff} onClose={mockOnClose} />);
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password456' } });
    
    fireEvent.click(screen.getByText('Save & Create Account'));
    
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('calls updateStaff and onClose on successful submission', async () => {
    mockUpdateStaff.mockResolvedValueOnce({});
    render(<InviteStaffModal staff={mockStaff} onClose={mockOnClose} />);
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Save & Create Account'));
    
    await waitFor(() => expect(mockUpdateStaff).toHaveBeenCalled());
    expect(mockOnClose).toHaveBeenCalled();
  });
});

