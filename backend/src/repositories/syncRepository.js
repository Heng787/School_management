const supabase = require('../lib/supabase');
const { AppError } = require('../utils/errors');

class SyncRepository {
  async getTableData(table) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw new AppError(`Error fetching ${table}`, 500, 'DB_ERROR');
    return data;
  }

  async upsertTableData(table, items) {
    const conflictKey = table === 'config' ? 'key' : 'id';
    const { data, error } = await supabase.from(table).upsert(items, { onConflict: conflictKey }).select();
    if (error) throw new AppError(`Error upserting ${table}`, 500, 'DB_ERROR');
    return data;
  }

  async deleteTableData(table, id) {
    const { data, error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw new AppError(`Error deleting from ${table}`, 500, 'DB_ERROR');
    return data;
  }
}

module.exports = new SyncRepository();
