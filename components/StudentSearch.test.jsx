// Auto-generated test scaffolding
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentSearch from './StudentSearch.jsx';
import { useData } from '../context/DataContext';
import '@testing-library/jest-dom';

vi.mock('../context/DataContext', () => ({
  useData: vi.fn(),
}));

describe('StudentSearch', () => {
  const mockNavigate = vi.fn();
  const mockSetHighlightedStudentId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useData.mockReturnValue({
      students: [{ id: 's1', name: 'John Doe' }],
      staff: [{ id: 't1', name: 'Jane Smith', role: 'Teacher' }],
      classes: [{ id: 'c1', name: 'Grade 10A', level: '10' }],
      enrollments: [],
      setHighlightedStudentId: mockSetHighlightedStudentId,
      setHighlightedStaffId: vi.fn(),
      setHighlightedClassId: vi.fn(),
    });
  });

  it('shows results when typing 2+ characters', async () => {
    render(<StudentSearch navigate={mockNavigate} />);
    const input = screen.getByPlaceholderText(/Search/);
    fireEvent.change(input, { target: { value: 'Jo' } });
    
    const results = await screen.findAllByRole('listitem');
    const johnDoeResult = results.find(r => r.textContent.includes('John Doe'));
    expect(johnDoeResult).toBeDefined();
  });

  it('navigates and highlights on result selection', async () => {
    render(<StudentSearch navigate={mockNavigate} />);
    const input = screen.getByPlaceholderText(/Search/);
    fireEvent.change(input, { target: { value: 'Jo' } });
    
    const results = await screen.findAllByRole('listitem');
    const johnDoeResult = results.find(r => r.textContent.includes('John Doe'));
    fireEvent.click(johnDoeResult);
    
    expect(mockSetHighlightedStudentId).toHaveBeenCalledWith('s1');
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('closes results when clicking outside', async () => {
    render(<StudentSearch navigate={mockNavigate} />);
    const input = screen.getByPlaceholderText(/Search/);
    fireEvent.change(input, { target: { value: 'Jo' } });
    
    await screen.findAllByRole('listitem');
    fireEvent.mouseDown(document.body);
    
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});

