const syncRepository = require('../repositories/syncRepository');
const { sanitizeData } = require('../utils/sanitizer');

class SyncService {
  async getTable(table) {
    const allowedTables = [
      'students', 'classes', 'enrollments', 'attendance',
      'grades', 'staff', 'config', 'events', 'staff_permissions', 'messages',
    ];
    if (!allowedTables.includes(table)) {
      throw new Error(`Access to table ${table} is forbidden`);
    }

    return syncRepository.getTableData(table);
  }

  async syncTable(table, data) {
    const allowedTables = ['students', 'classes', 'enrollments', 'attendance', 'grades', 'staff', 'config'];
    if (!allowedTables.includes(table)) {
      throw new Error(`Access to table ${table} is forbidden`);
    }

    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    return syncRepository.upsertTableData(table, sanitizeData(data));
  }

  async deleteRecord(table, id) {
    const allowedTables = [
      'students', 'classes', 'enrollments', 'attendance',
      'grades', 'staff', 'config', 'events', 'staff_permissions', 'messages',
    ];
    if (!allowedTables.includes(table)) {
      throw new Error(`Access to table ${table} is forbidden`);
    }
    return syncRepository.deleteTableData(table, id);
  }

  async getConfigKey(key) {
    const messageRepository = require('../repositories/messageRepository');
    return messageRepository.getConfigByKey(key);
  }

  async clearTable(table) {
    const messageService = require('./messageService');
    return messageService.clearTable(table);
  }
}

module.exports = new SyncService();
