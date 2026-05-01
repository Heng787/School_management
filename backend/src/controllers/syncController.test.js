/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import syncController from './syncController';
import syncService from '../services/syncService';

vi.mock('../services/syncService');

describe('SyncController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { params: {}, body: {}, user: { role: 'admin' } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  describe('getTable', () => {
    it('should get table data successfully for admin', async () => {
      req.params = { table: 'students' };
      syncService.getTable.mockResolvedValue([{ id: 1 }]);

      await syncController.getTable(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(syncService.getTable).toHaveBeenCalledWith('students');
    });

    it('should block non-admin from accessing config', async () => {
      req.params = { table: 'config' };
      req.user = { role: 'Teacher' };

      await syncController.getTable(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].name).toBe('ForbiddenError');
    });

    it('should scrub passwords when fetching staff', async () => {
      req.params = { table: 'staff' };
      syncService.getTable.mockResolvedValue([{ id: 1, name: 'User', password: 'secret' }]);

      await syncController.getTable(req, res, next);

      const response = res.json.mock.calls[0][0];
      expect(response.data[0].password).toBeUndefined();
    });
  });

  describe('syncTable', () => {
    it('should sync table successfully', async () => {
      req.params = { table: 'students' };
      req.body = [{ id: 1 }];
      syncService.syncTable.mockResolvedValue({ count: 1 });

      await syncController.syncTable(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(syncService.syncTable).toHaveBeenCalledWith('students', req.body);
    });

    it('should throw error if body is not an array', async () => {
      req.params = { table: 'students' };
      req.body = { id: 1 }; // not an array

      await syncController.syncTable(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].message).toContain('array');
    });
  });

  describe('deleteRecord', () => {
    it('should delete record successfully', async () => {
      req.params = { table: 'students', id: '123' };
      
      await syncController.deleteRecord(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(syncService.deleteRecord).toHaveBeenCalledWith('students', '123');
    });
  });
});
