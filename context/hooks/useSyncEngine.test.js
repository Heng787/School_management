import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyncEngine } from './useSyncEngine';
import { apiService } from '../../services/apiService';
import { localStore } from '../../services/core';

vi.mock('../../services/apiService');
vi.mock('../../services/core');

describe('useSyncEngine', () => {
  const mockDataSetters = {
    setEnrollments: vi.fn(),
    setClasses: vi.fn(),
    setStudents: vi.fn(),
    setGrades: vi.fn(),
    setAttendance: vi.fn(),
  };

  const mockDataState = {
    students: [], staff: [], staffPermissions: [], classes: [],
    events: [], grades: [], attendance: [], enrollments: [],
    subjects: [], levels: [], timeSlots: [], adminPassword: ''
  };

  const setError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Default online
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('should trigger sync on data change after debounce', async () => {
    apiService.syncAll.mockResolvedValue({});
    
    renderHook(() => useSyncEngine(false, setError, mockDataState, mockDataSetters));

    // Debounce timer
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(apiService.syncAll).toHaveBeenCalled();
  });

  it('should set error if sync fails', async () => {
    apiService.syncAll.mockRejectedValue(new Error('Sync Error'));
    
    const { result } = renderHook(() => useSyncEngine(false, setError, mockDataState, mockDataSetters));

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(setError).toHaveBeenCalledWith(expect.stringContaining('Sync failed'));
  });

  it('should periodic refresh if not dirty', async () => {
    localStore.isDirty.mockReturnValue(false);
    apiService.getStudents.mockResolvedValue([{ id: 1 }]);
    
    renderHook(() => useSyncEngine(false, setError, mockDataState, mockDataSetters));

    // Fast-forward 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(apiService.getStudents).toHaveBeenCalled();
    expect(mockDataSetters.setStudents).toHaveBeenCalled();
  });

  it('should NOT refresh if dirty', async () => {
    localStore.isDirty.mockReturnValue(true);
    
    renderHook(() => useSyncEngine(false, setError, mockDataState, mockDataSetters));

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(apiService.getStudents).not.toHaveBeenCalled();
  });
});
