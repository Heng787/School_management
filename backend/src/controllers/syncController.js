const syncService = require('../services/syncService');
const { ValidationError, ForbiddenError } = require('../utils/errors');

class SyncController {
  async getTable(req, res, next) {
    try {
      const { table } = req.params;
      const allowedTables = [
        'students', 'classes', 'enrollments', 'attendance',
        'grades', 'staff', 'config', 'events', 'staff_permissions', 'messages',
      ];
      
      if (!allowedTables.includes(table)) {
        throw new ValidationError('Invalid table requested');
      }

      // If a non-admin requests staff or config, we block them.
      if (['staff', 'config', 'staff_permissions'].includes(table) && req.user.role !== 'admin') {
         // In a more granular setup, teachers might see basic staff info, but we restrict it here for demo security.
         if (table === 'staff') {
            // We can let them see staff but throw error if they try to edit
         } else {
            throw new ForbiddenError('Access denied');
         }
      }

      const data = await syncService.getTable(table);
      
      // Never send passwords down to the client, even for admins
      if (table === 'staff') {
        data.forEach(user => delete user.password);
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async syncTable(req, res, next) {
    try {
      const { table } = req.params;
      const dataToSync = req.body;

      if (!Array.isArray(dataToSync)) {
        throw new ValidationError('Request body must be an array of records');
      }

      // Basic Role Validation Example
      if (table === 'staff' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only admins can modify staff records');
      }

      const result = await syncService.syncTable(table, dataToSync);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req, res, next) {
    try {
      const { table, id } = req.params;

      if (table === 'staff' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only admins can modify staff records');
      }

      await syncService.deleteRecord(table, id);

      res.status(200).json({
        success: true,
        message: 'Deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  async getConfigKey(req, res, next) {
    try {
      const { key } = req.params;
      const data = await syncService.getConfigKey(key);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async clearTable(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Only admins can perform a factory reset');
      }
      const { table } = req.params;
      await syncService.clearTable(table);
      res.status(200).json({ success: true, message: `Table ${table} cleared` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SyncController();
