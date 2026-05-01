/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import authService from './authService';
import staffRepository from '../repositories/staffRepository';
import supabase from '../lib/supabase';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

vi.mock('../repositories/staffRepository');
vi.mock('../lib/supabase');
vi.mock('bcrypt');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Login', () => {
    it('should login admin with correct password', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { value: 'password123' }, error: null })
          })
        })
      });
      jwt.sign.mockReturnValue('mock-token');

      const result = await authService.login('admin', 'password123');
      
      expect(result.user.role).toBe('Admin');
      expect(result.token).toBe('mock-token');
    });

    it('should fail admin login with wrong password', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { value: 'password123' }, error: null })
          })
        })
      });

      await expect(authService.login('admin', 'wrong')).rejects.toThrow('Invalid admin credentials');
    });
  });

  describe('Staff Login', () => {
    it('should login staff with bcrypt password', async () => {
      const mockUser = { id: 's1', name: 'Staff', role: 'Teacher', password: '$2b$mockhash' };
      staffRepository.findByIdentifier.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      const result = await authService.login('staff', 'password');
      
      expect(result.user.name).toBe('Staff');
      expect(result.token).toBe('mock-token');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', mockUser.password);
    });

    it('should login staff with plaintext password (fallback)', async () => {
      const mockUser = { id: 's1', name: 'Staff', role: 'Teacher', password: 'plain' };
      staffRepository.findByIdentifier.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');

      const result = await authService.login('staff', 'plain');
      
      expect(result.user.name).toBe('Staff');
      expect(result.token).toBe('mock-token');
    });

    it('should throw error if staff not found', async () => {
      staffRepository.findByIdentifier.mockResolvedValue(null);
      await expect(authService.login('unknown', 'any')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if staff password incorrect', async () => {
      const mockUser = { id: 's1', name: 'Staff', role: 'Teacher', password: 'correct' };
      staffRepository.findByIdentifier.mockResolvedValue(mockUser);
      await expect(authService.login('staff', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });
});
