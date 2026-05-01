const express = require('express');
const multer = require('multer');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// All message routes require a valid JWT
router.use(authMiddleware);

// GET  /api/messages?userId=<id>&isAdmin=1   → fetch messages for a user
router.get('/', messageController.getMessages.bind(messageController));

// GET  /api/messages/unread?userId=<id>&isAdmin=1  → unread count
router.get('/unread', messageController.getUnreadCount.bind(messageController));

// POST /api/messages                         → send a new message
router.post('/', messageController.sendMessage.bind(messageController));

// POST /api/messages/attachment              → upload attachment
router.post('/attachment', upload.single('file'), messageController.uploadAttachment.bind(messageController));

// POST /api/messages/read                    → mark messages as read
router.post('/read', messageController.markRead.bind(messageController));

// PATCH /api/messages/:id                    → update content or metadata
router.patch('/:id', messageController.updateMessage.bind(messageController));

// DELETE /api/messages/:id                   → delete a message
router.delete('/:id', messageController.deleteMessage.bind(messageController));

module.exports = router;
