import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '@/components/Sidebar';
import { Page, UserRole } from '@/types';
import { DataContext } from '@/context/DataContext';

// Mock the DataContext provider
const mockContextValue = {
  currentUser: { id: '1', role: UserRole.Admin },
};

const renderWithContext = (ui) => {
  return render(
    <DataContext.Provider value={mockContextValue}>
      {ui}
    </DataContext.Provider>
  );
};

describe('Sidebar', () => {
  const mockNavigate = vi.fn();

  it('renders all main menu items for Admin', () => {
    renderWithContext(
      <Sidebar 
        navigate={mockNavigate} 
        currentPage={Page.Dashboard} 
        userRole={UserRole.Admin} 
        isOpen={true} 
        onClose={() => {}} 
      />
    );

    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Students')).toBeDefined();
    expect(screen.getByText('Staff')).toBeDefined();
    expect(screen.getByText('Classes')).toBeDefined();
    expect(screen.getByText('Schedule')).toBeDefined();
  });

  it('hides Staff link for Teacher', () => {
    renderWithContext(
      <Sidebar 
        navigate={mockNavigate} 
        currentPage={Page.Dashboard} 
        userRole={UserRole.Teacher} 
        isOpen={true} 
        onClose={() => {}} 
      />
    );

    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.queryByText('Staff')).toBeNull();
  });

  it('calls navigate when a link is clicked', () => {
    renderWithContext(
      <Sidebar 
        navigate={mockNavigate} 
        currentPage={Page.Dashboard} 
        userRole={UserRole.Admin} 
        isOpen={true} 
        onClose={() => {}} 
      />
    );

    fireEvent.click(screen.getByText('Students'));
    expect(mockNavigate).toHaveBeenCalledWith(Page.Students);
  });
});
