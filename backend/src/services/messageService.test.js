/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import messageService from './messageService';
import messageRepository from '../repositories/messageRepository';

vi.mock('../repositories/messageRepository');

describe('MessageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get messages', async () => {
    const mockData = [{ id: '1' }];
    messageRepository.findByUser.mockResolvedValue(mockData);
    
    const result = await messageService.getMessages('user1', false);
    expect(result).toBe(mockData);
    expect(messageRepository.findByUser).toHaveBeenCalledWith('user1', false);
  });

  it('should get unread count', async () => {
    messageRepository.countUnread.mockResolvedValue(3);
    const count = await messageService.getUnreadCount('user1', false);
    expect(count).toBe(3);
    expect(messageRepository.countUnread).toHaveBeenCalledWith('user1');
  });

  it('should send a message', async () => {
    const payload = {
      senderId: 's1',
      senderName: 'Sender',
      recipientId: 'r1',
      content: 'Hello'
    };
    messageRepository.create.mockResolvedValue({ id: 'msg1' });

    const result = await messageService.sendMessage(payload);
    expect(result.id).toBe('msg1');
    expect(messageRepository.create).toHaveBeenCalled();
  });

  it('should throw error if required fields missing when sending', async () => {
    await expect(messageService.sendMessage({})).rejects.toThrow('senderName, recipientId, and content are required');
  });

  it('should mark messages as read', async () => {
    await messageService.markRead(['1', '2']);
    expect(messageRepository.markRead).toHaveBeenCalledWith(['1', '2']);
  });

  it('should clear valid table', async () => {
    await messageService.clearTable('students');
    expect(messageRepository.deleteAllInTable).toHaveBeenCalledWith('students');
  });

  it('should throw error for invalid table clear', async () => {
    await expect(messageService.clearTable('users')).rejects.toThrow("Table 'users' cannot be cleared");
  });

  it('should upload attachment', async () => {
    const file = { originalname: 'test.png' };
    messageRepository.uploadAttachment.mockResolvedValue('url');
    const result = await messageService.uploadAttachment(file);
    expect(result).toBe('url');
  });
});
