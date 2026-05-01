import { describe, it, expect, act } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useFilters,
  useStudentSelection,
  useModalState,
  useImportState,
  usePaginationState
} from './useStudentsPageState';

describe('useFilters', () => {
  it('should manage filter state', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.setSearchTerm('John');
      result.current.setClassFilter('1A');
    });
    expect(result.current.searchTerm).toBe('John');
    expect(result.current.classFilter).toBe('1A');
    act(() => result.current.resetFilters());
    expect(result.current.searchTerm).toBe('');
  });
});

describe('useStudentSelection', () => {
  it('should toggle selection', () => {
    const { result } = renderHook(() => useStudentSelection());
    act(() => result.current.toggleSelect('1'));
    expect(result.current.selectedStudentIds.has('1')).toBe(true);
    act(() => result.current.toggleSelect('1'));
    expect(result.current.selectedStudentIds.has('1')).toBe(false);
  });

  it('should toggle all on page', () => {
    const { result } = renderHook(() => useStudentSelection());
    act(() => result.current.toggleSelectAllOnPage(['1', '2']));
    expect(result.current.selectedStudentIds.size).toBe(2);
    act(() => result.current.toggleSelectAllOnPage(['1', '2']));
    expect(result.current.selectedStudentIds.size).toBe(0);
  });
});

describe('useModalState', () => {
  it('should manage modal visibility', () => {
    const { result } = renderHook(() => useModalState());
    act(() => result.current.openStudentModal({ id: '1' }));
    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.editingStudent.id).toBe('1');
    act(() => result.current.closeStudentModal());
    expect(result.current.isModalOpen).toBe(false);
  });
});

describe('usePaginationState', () => {
  it('should manage pagination', () => {
    const { result } = renderHook(() => usePaginationState());
    act(() => result.current.setCurrentPage(5));
    expect(result.current.currentPage).toBe(5);
    act(() => result.current.resetPagination());
    expect(result.current.currentPage).toBe(1);
  });
});
