/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import syncService from './syncService';
import syncRepository from '../repositories/syncRepository';
import { sanitizeData } from '../utils/sanitizer';

vi.mock('../repositories/syncRepository');
vi.mock('../utils/sanitizer', () => ({
  sanitizeData: vi.fn(d => d)
}));

describe('SyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get table data for allowed table', async () => {
    const mockData = [{ id: 1 }];
    syncRepository.getTableData.mockResolvedValue(mockData);
    
    const result = await syncService.getTable('students');
    expect(result).toBe(mockData);
    expect(syncRepository.getTableData).toHaveBeenCalledWith('students');
  });

  it('should throw error for forbidden table in getTable', async () => {
    await expect(syncService.getTable('secrets')).rejects.toThrow('Access to table secrets is forbidden');
  });

  it('should sync table with sanitized data', async () => {
    const data = [{ id: 1, name: '<script>alert(1)</script>' }];
    syncRepository.upsertTableData.mockResolvedValue(data);
    
    await syncService.syncTable('students', data);
    expect(sanitizeData).toHaveBeenCalledWith(data);
    expect(syncRepository.upsertTableData).toHaveBeenCalledWith('students', data);
  });

  it('should delete record from allowed table', async () => {
    await syncService.deleteRecord('students', '123');
    expect(syncRepository.deleteTableData).toHaveBeenCalledWith('students', '123');
  });

  it('should throw error for forbidden table in deleteRecord', async () => {
    await expect(syncService.deleteRecord('secrets', '123')).rejects.toThrow('Access to table secrets is forbidden');
  });
});
