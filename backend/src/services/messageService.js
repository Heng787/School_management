const messageRepository = require('../repositories/messageRepository');
const { ValidationError, ForbiddenError } = require('../utils/errors');

const ADMIN_KEY = 'admin';

// All allowed tables for the factory-reset endpoint
const CLEARABLE_TABLES = [
  'students', 'staff', 'classes', 'enrollments',
  'attendance', 'grades', 'config', 'events',
  'staff_permissions', 'messages',
];

class MessageService {
  async getMessages(userId, isAdmin) {
    return messageRepository.findByUser(userId, isAdmin);
  }

  async getUnreadCount(userId, isAdmin) {
    const dbId = isAdmin ? ADMIN_KEY : userId;
    return messageRepository.countUnread(dbId);
  }

  async sendMessage(payload) {
    const { senderId, senderName, recipientId, type, content, metadata, isAdmin } = payload;

    if (!senderName || !recipientId || !content) {
      throw new ValidationError('senderName, recipientId, and content are required');
    }

    const dbPayload = {
      id: payload.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sender_id: isAdmin ? ADMIN_KEY : senderId,
      sender_name: senderName,
      recipient_id:
        recipientId === 'admin' || recipientId === ADMIN_KEY ? ADMIN_KEY : recipientId,
      type: type || 'text',
      content,
      metadata: metadata || {},
      is_read: false,
    };

    return messageRepository.create(dbPayload);
  }

  async markRead(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('ids must be a non-empty array');
    }
    await messageRepository.markRead(ids);
  }

  async updateMessage(id, fields, requestingUserId, isAdmin) {
    if (!id) throw new ValidationError('Message ID is required');

    const allowedFields = {};
    if (fields.content !== undefined) allowedFields.content = fields.content;
    if (fields.metadata !== undefined) allowedFields.metadata = fields.metadata;
    if (fields.is_read !== undefined) allowedFields.is_read = fields.is_read;

    if (Object.keys(allowedFields).length === 0) {
      throw new ValidationError('No valid fields provided for update');
    }

    await messageRepository.patch(id, allowedFields);
  }

  async deleteMessage(id) {
    if (!id) throw new ValidationError('Message ID is required');
    await messageRepository.remove(id);
  }

  async getConfigKey(key) {
    if (!key) throw new ValidationError('Config key is required');
    return messageRepository.getConfigByKey(key);
  }

  async clearTable(table) {
    if (!CLEARABLE_TABLES.includes(table)) {
      throw new ForbiddenError(`Table '${table}' cannot be cleared`);
    }
    await messageRepository.deleteAllInTable(table);
  }

  async uploadAttachment(file) {
    if (!file) throw new ValidationError('File is required');
    return messageRepository.uploadAttachment(file);
  }
}

module.exports = new MessageService();
