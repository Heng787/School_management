const studentService = require('../services/studentService');
const { ValidationError } = require('../utils/errors');

class StudentController {
  /**
   * Validates a student record for potential duplicates and normalizes data.
   */
  async validateStudent(req, res, next) {
    try {
      const studentData = req.body;

      if (!studentData.name || !studentData.dob) {
        throw new ValidationError('Name and Date of Birth are required for validation.');
      }

      const validationResult = await studentService.checkCollisions(studentData);

      res.status(200).json({
        success: true,
        data: validationResult
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
