const geminiService = require('../services/geminiService');
const { ValidationError } = require('../utils/errors');

class AiController {
  async inferGender(req, res, next) {
    try {
      const { name } = req.body;
      
      if (!name) {
        throw new ValidationError('Name is required');
      }

      const gender = await geminiService.inferGender(name);
      
      res.status(200).json({
        success: true,
        data: { gender },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AiController();
