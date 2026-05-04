// Auto-generated test scaffolding
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardCard from '../DashboardCard.jsx';
import '@testing-library/jest-dom';

describe('DashboardCard', () => {
  it('should render title and value correctly', () => {
    render(<DashboardCard title="Total Students" value="1,234" icon={<span>Icon</span>} />);
    
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('should handle missing icon gracefully', () => {
    render(<DashboardCard title="Active Classes" value="42" />);
    expect(screen.getByText('Active Classes')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});

