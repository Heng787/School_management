/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import aiController from './aiController';
import geminiService from '../services/geminiService';

vi.mock('../services/geminiService');

describe('AiController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  it('should infer gender successfully', async () => {
    req.body = { name: 'John' };
    geminiService.inferGender.mockResolvedValue('Male');

    await aiController.inferGender(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { gender: 'Male' }
    });
  });

  it('should call next with ValidationError if name missing', async () => {
    req.body = {};

    await aiController.inferGender(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].message).toBe('Name is required');
  });
});
