const messageService = require('../services/messageService');

class MessageController {
  async getMessages(req, res, next) {
    try {
      const { userId, isAdmin } = req.query;
      const isAdminBool = isAdmin === '1' || isAdmin === 'true';
      const data = await messageService.getMessages(userId, isAdminBool);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const { userId, isAdmin } = req.query;
      const isAdminBool = isAdmin === '1' || isAdmin === 'true';
      const count = await messageService.getUnreadCount(userId, isAdminBool);
      res.status(200).json({ success: true, data: { count } });
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin';
      const payload = { ...req.body, senderId: req.user.id, isAdmin };
      const data = await messageService.sendMessage(payload);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const { ids } = req.body;
      await messageService.markRead(ids);
      res.status(200).json({ success: true, message: 'Messages marked as read' });
    } catch (err) {
      next(err);
    }
  }

  async updateMessage(req, res, next) {
    try {
      const { id } = req.params;
      const isAdmin = req.user.role === 'admin';
      await messageService.updateMessage(id, req.body, req.user.id, isAdmin);
      res.status(200).json({ success: true, message: 'Message updated' });
    } catch (err) {
      next(err);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const { id } = req.params;
      await messageService.deleteMessage(id);
      res.status(200).json({ success: true, message: 'Message deleted' });
    } catch (err) {
      next(err);
    }
  }

  async uploadAttachment(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file provided' });
      }
      
      const fileUrl = await messageService.uploadAttachment(req.file);
      res.status(200).json({ success: true, data: { url: fileUrl } });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MessageController();
