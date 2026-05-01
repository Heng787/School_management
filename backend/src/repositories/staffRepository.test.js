/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import supabase from '../lib/supabase';
import staffRepository from './staffRepository';

vi.hoisted(() => {
  process.env.NODE_ENV = 'test';
  process.env.SUPABASE_URL = 'http://mock.url';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';
  process.env.JWT_SECRET = 'mock-secret';
  process.env.GEMINI_API_KEY = 'mock-gemini';
});

describe('StaffRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return staff data when found by identifier', async () => {
    const mockData = { id: '1', name: 'John Doe' };
    
    const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockLimit = vi.fn().mockReturnValue({ single: mockSingle });
    const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockSelect = vi.fn().mockReturnValue({ or: mockOr });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelect
    });

    const result = await staffRepository.findByIdentifier('john');
    expect(result).toEqual(mockData);
    expect(supabase.from).toHaveBeenCalledWith('staff');
  });

  it('should return null when staff is not found (PGRST116)', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    const mockLimit = vi.fn().mockReturnValue({ single: mockSingle });
    const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockSelect = vi.fn().mockReturnValue({ or: mockOr });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelect
    });

    const result = await staffRepository.findByIdentifier('unknown');
    expect(result).toBeNull();
  });

  it('should throw AppError on database failure', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error', code: '500' } });
    const mockLimit = vi.fn().mockReturnValue({ single: mockSingle });
    const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockSelect = vi.fn().mockReturnValue({ or: mockOr });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelect
    });

    await expect(staffRepository.findByIdentifier('error')).rejects.toThrow('Database error finding staff');
  });
});
