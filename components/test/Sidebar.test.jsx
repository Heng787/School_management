// Auto-generated test scaffolding
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar.jsx';
import { useData } from '../../../context/DataContext';
import { fetchUnreadCount } from '../../../services/messageService';
import { Page, UserRole } from '../../../types';
import '@testing-library/jest-dom';

vi.mock('../../context/DataContext', () => ({
  useData: vi.fn(),
}));

vi.mock('../../services/messageService', () => ({
  fetchUnreadCount: vi.fn(),
  ADMIN_KEY: 'admin_key',
}));

describe('Sidebar', () => {
  const defaultProps = {
    navigate: vi.fn(),
    currentPage: Page.Dashboard,
    userRole: UserRole.Admin,
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useData.mockReturnValue({
      currentUser: { id: 'admin', name: 'Admin', role: UserRole.Admin }
    });
    fetchUnreadCount.mockResolvedValue(0);
  });

  it('renders correctly for Admin', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText(Page.Dashboard)).toBeInTheDocument();
    expect(screen.getByText(Page.Students)).toBeInTheDocument();
    expect(screen.getByText(Page.Staff)).toBeInTheDocument();
  });

  it('hides Staff link for non-Admin/Office', () => {
    render(<Sidebar {...defaultProps} userRole={UserRole.Teacher} />);
    expect(screen.queryByText(Page.Staff)).not.toBeInTheDocument();
  });

  it('calls navigate when a nav item is clicked', () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(screen.getByText(Page.Students));
    expect(defaultProps.navigate).toHaveBeenCalledWith(Page.Students);
  });

  it('toggles Reports sub-menu', () => {
    render(<Sidebar {...defaultProps} />);
    const reportsBtn = screen.getByText(Page.Reports);
    fireEvent.click(reportsBtn);
    expect(screen.getByText('Marks Entry')).toBeInTheDocument();
  });
});

