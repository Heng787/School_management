const express = require('express');
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/students/validate
 * @desc    Check for potential student duplicates (Name + DOB)
 * @access  Private (Admin, Office Worker)
 */
router.post('/validate', authMiddleware, studentController.validateStudent);

module.exports = router;
