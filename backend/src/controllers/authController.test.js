/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import authController from './authController';
import authService from '../services/authService';

vi.mock('../services/authService');

describe('AuthController', () => {
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

  it('should login successfully with valid credentials', async () => {
    req.body = { identifier: 'admin', password: 'password' };
    const mockResult = { token: 'token', user: {} };
    authService.login.mockResolvedValue(mockResult);

    await authController.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockResult
    });
  });

  it('should call next with error if login fails', async () => {
    req.body = { identifier: 'admin', password: 'wrong' };
    const error = new Error('Auth failed');
    authService.login.mockRejectedValue(error);

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should call next with ValidationError if fields missing', async () => {
    req.body = { identifier: 'admin' }; // missing password

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].message).toContain('required');
  });
});
