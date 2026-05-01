// Auto-generated test scaffolding
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar.jsx';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { fetchUnreadCount } from '../services/messageService';
import '@testing-library/jest-dom';

vi.mock('../context/DataContext', () => ({
  useData: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

vi.mock('../services/messageService', () => ({
  fetchUnreadCount: vi.fn(),
  ADMIN_KEY: 'admin_key',
}));

vi.mock('./StudentSearch', () => ({
  default: () => <div data-testid="student-search" />
}));

describe('Navbar', () => {
  const defaultProps = {
    userRole: 'ADMIN',
    onLogout: vi.fn(),
    navigate: vi.fn(),
    onToggleSidebar: vi.fn(),
    isSidebarOpen: true,
    currentPage: 'Dashboard',
  };

  const mockContexts = (overrides = {}) => {
    useData.mockReturnValue({
      loading: false,
      isSyncing: false,
      lastSyncedAt: new Date(),
      error: null,
      currentUser: { id: 'admin', name: 'Test Admin', role: 'ADMIN' },
      ...overrides.data,
    });
    useTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
      ...overrides.theme,
    });
    fetchUnreadCount.mockResolvedValue(5);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockContexts();
  });

  it('should render user name and role', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('Test Admin')).toBeInTheDocument();
    expect(screen.getAllByText('admin')[0]).toBeInTheDocument(); // Role is capitalized in display? No, check Navbar.jsx line 172
  });

  it('should call onToggleSidebar when menu button is clicked', () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Collapse sidebar'));
    expect(defaultProps.onToggleSidebar).toHaveBeenCalled();
  });

  it('should show unread message count badge', async () => {
    render(<Navbar {...defaultProps} />);
    const badge = await screen.findByText('5');
    expect(badge).toBeInTheDocument();
  });

  it('should open profile menu when clicked', () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('User profile menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('should call onLogout when Sign Out is clicked', () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('User profile menu'));
    fireEvent.click(screen.getByText('Sign Out'));
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });
});

