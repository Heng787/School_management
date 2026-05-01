const express = require('express');
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/infer-gender', authMiddleware, aiController.inferGender);

module.exports = router;
