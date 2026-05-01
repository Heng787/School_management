/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import supabase from '../lib/supabase';
import syncRepository from './syncRepository';

vi.hoisted(() => {
  process.env.NODE_ENV = 'test';
  process.env.SUPABASE_URL = 'http://mock.url';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';
  process.env.JWT_SECRET = 'mock-secret';
  process.env.GEMINI_API_KEY = 'mock-gemini';
});

describe('SyncRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all data from a table (getTableData)', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelect
    });

    const result = await syncRepository.getTableData('test_table');
    expect(result).toEqual(mockData);
    expect(supabase.from).toHaveBeenCalledWith('test_table');
  });

  it('should upsert data to a table (upsertTableData)', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      upsert: mockUpsert
    });

    const data = [{ id: 1, name: 'New' }];
    await syncRepository.upsertTableData('test_table', data);
    expect(mockUpsert).toHaveBeenCalledWith(data, { onConflict: 'id' });
  });

  it('should delete data from a table (deleteTableData)', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      delete: mockDelete
    });

    await syncRepository.deleteTableData('test_table', 1);
    expect(mockEq).toHaveBeenCalledWith('id', 1);
  });
});
