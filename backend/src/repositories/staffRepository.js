const supabase = require('../lib/supabase');
const { AppError } = require('../utils/errors');

class StaffRepository {
  async findByIdentifier(identifier) {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .or(`name.ilike.%${identifier}%,contact.ilike.%${identifier}%`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError('Database error finding staff', 500, 'DB_ERROR');
    }

    return data;
  }
}

module.exports = new StaffRepository();
