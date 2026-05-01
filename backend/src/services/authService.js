const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const staffRepository = require('../repositories/staffRepository');
const { AuthError } = require('../utils/errors');

class AuthService {
  async login(identifier, password) {
    let user;

    if (identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'administrator') {
      const supabase = require('../lib/supabase');
      const { data, error } = await supabase.from('config').select('value').eq('key', 'admin_password').single();
      const dbAdminPassword = (data && data.value) ? data.value : 'admin123';
      
      if (password !== dbAdminPassword) {
        throw new AuthError('Invalid admin credentials');
      }

      user = {
        id: 'admin_1',
        name: 'Administrator',
        role: 'Admin'
      };
    } else {
      user = await staffRepository.findByIdentifier(identifier);
      if (!user) {
        throw new AuthError('Invalid credentials');
      }

      const isBcrypt = user.password && user.password.startsWith('$2b$');
      
      let isMatch = false;
      if (isBcrypt) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = (password === user.password); // Plain text check
      }

      if (!isMatch) {
        throw new AuthError('Invalid credentials');
      }
    }

    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { id: user.id, identifier: user.name || user.contact || 'admin', role: user.role },
      config.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return { token, user: userWithoutPassword };
  }
}

module.exports = new AuthService();
