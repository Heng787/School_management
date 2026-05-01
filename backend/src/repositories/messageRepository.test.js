/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import supabase from '../lib/supabase';
import messageRepository from './messageRepository';

vi.hoisted(() => {
  process.env.NODE_ENV = 'test';
  process.env.SUPABASE_URL = 'http://mock.url';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';
  process.env.JWT_SECRET = 'mock-secret';
  process.env.GEMINI_API_KEY = 'mock-gemini';
});

describe('MessageRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find messages for a specific user', async () => {
    const mockData = [{ id: 1, content: 'Hello' }];
    
    // Create a chainable mock that is also a thenable (Promise)
    const createQueryMock = (data) => {
      const mock = {
        then: (onFullfilled) => Promise.resolve({ data, error: null }).then(onFullfilled),
        catch: (onRejected) => Promise.resolve({ data, error: null }).catch(onRejected),
        order: vi.fn().mockImplementation(() => mock),
        or: vi.fn().mockImplementation(() => mock),
        select: vi.fn().mockImplementation(() => mock),
      };
      return mock;
    };

    const queryMock = createQueryMock(mockData);
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue(queryMock)
    });

    // Case 1: isAdmin = true
    const res1 = await messageRepository.findByUser('user123', true);
    expect(res1).toEqual(mockData);

    // Case 2: isAdmin = false
    const res2 = await messageRepository.findByUser('user123', false);
    expect(res2).toEqual(mockData);
    expect(queryMock.or).toHaveBeenCalled();
  });

  it('should create a message', async () => {
    const mockData = { id: 1, content: 'Hi' };
    const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      insert: mockInsert
    });

    const payload = { content: 'Hi', recipient_id: 'user1' };
    const result = await messageRepository.create(payload);
    expect(result).toEqual(mockData);
  });

  it('should upload attachment', async () => {
    const mockPublicUrl = 'http://mock.url/file.png';
    const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } });
    const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'path/file.png' }, error: null });
    
    vi.spyOn(supabase.storage, 'from').mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    });

    const file = { buffer: Buffer.from('test'), originalname: 'test.png', mimetype: 'image/png' };
    const result = await messageRepository.uploadAttachment(file);
    
    expect(result).toBe(mockPublicUrl);
  });

  it('should count unread messages', async () => {
    const mockHead = vi.fn().mockResolvedValue({ count: 5, error: null });
    const mockEq2 = vi.fn().mockReturnValue({ head: mockHead });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelect
    });

    const count = await messageRepository.countUnread('user123');
    expect(count).toBe(5);
    expect(mockEq1).toHaveBeenCalledWith('recipient_id', 'user123');
    expect(mockEq2).toHaveBeenCalledWith('is_read', false);
  });

  it('should mark messages as read', async () => {
    const mockIn = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ in: mockIn });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      update: mockUpdate
    });

    await messageRepository.markRead(['1', '2']);
    expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
    expect(mockIn).toHaveBeenCalledWith('id', ['1', '2']);
  });

  it('should patch a message', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      update: mockUpdate
    });

    await messageRepository.patch('1', { content: 'updated' });
    expect(mockUpdate).toHaveBeenCalledWith({ content: 'updated' });
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });

  it('should remove a message', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      delete: mockDelete
    });

    await messageRepository.remove('1');
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });

  it('should get config by key', async () => {
    const mockData = { value: 'some_value' };
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelect
    });

    const result = await messageRepository.getConfigByKey('test_key');
    expect(result).toEqual(mockData);
    expect(mockEq).toHaveBeenCalledWith('key', 'test_key');
  });

  it('should delete all rows in a table', async () => {
    const mockNeq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ neq: mockNeq });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      delete: mockDelete
    });

    await messageRepository.deleteAllInTable('some_table');
    expect(mockNeq).toHaveBeenCalledWith('id', '__nonexistent__');
  });
});
