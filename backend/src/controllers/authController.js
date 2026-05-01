const authService = require('../services/authService');
const { ValidationError } = require('../utils/errors');

class AuthController {
  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      
      if (!identifier || !password) {
        throw new ValidationError('Identifier (name or contact) and password are required');
      }

      const result = await authService.login(identifier, password);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
