// Auto-generated test scaffolding
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../ConfirmModal.jsx';
import '@testing-library/jest-dom';

describe('ConfirmModal', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      onConfirm: vi.fn(),
      title: 'Delete Item',
      message: 'Are you sure?',
    };
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render content when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm and onClose when confirm button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});

