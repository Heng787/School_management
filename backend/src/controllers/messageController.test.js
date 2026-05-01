/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import messageController from './messageController';
import messageService from '../services/messageService';

vi.mock('../services/messageService');

describe('MessageController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { query: {}, body: {}, params: {}, user: { id: 'u1', role: 'admin' } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  it('should get messages', async () => {
    req.query = { userId: 'u1', isAdmin: 'true' };
    messageService.getMessages.mockResolvedValue([]);

    await messageController.getMessages(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(messageService.getMessages).toHaveBeenCalledWith('u1', true);
  });

  it('should send a message', async () => {
    req.body = { content: 'Hi', recipientId: 'u2', senderName: 'Admin' };
    messageService.sendMessage.mockResolvedValue({ id: 'm1' });

    await messageController.sendMessage(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(messageService.sendMessage).toHaveBeenCalledWith({
      ...req.body,
      senderId: 'u1',
      isAdmin: true
    });
  });

  it('should mark messages as read', async () => {
    req.body = { ids: ['1', '2'] };
    
    await messageController.markRead(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(messageService.markRead).toHaveBeenCalledWith(['1', '2']);
  });

  it('should upload attachment', async () => {
    req.file = { originalname: 'test.png' };
    messageService.uploadAttachment.mockResolvedValue('http://url');

    await messageController.uploadAttachment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { url: 'http://url' }
    });
  });

  it('should return 400 if no file provided in uploadAttachment', async () => {
    req.file = null;

    await messageController.uploadAttachment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
