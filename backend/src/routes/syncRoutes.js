const express = require('express');
const syncController = require('../controllers/syncController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Config single-key read: GET /api/sync/config/:key
router.get('/config/:key', authMiddleware, syncController.getConfigKey);

// Factory reset: DELETE /api/sync/:table/all  (admin only)
router.delete('/:table/all', authMiddleware, syncController.clearTable);

// Generic CRUD
router.get('/:table', authMiddleware, syncController.getTable);
router.post('/:table', authMiddleware, syncController.syncTable);
router.delete('/:table/:id', authMiddleware, syncController.deleteRecord);

module.exports = router;
