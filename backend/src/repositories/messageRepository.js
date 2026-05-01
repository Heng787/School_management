const supabase = require('../lib/supabase');
const { AppError } = require('../utils/errors');

class MessageRepository {
  async findByUser(userId, isAdmin) {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!isAdmin) {
      query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId},recipient_id.eq.all`);
    }

    const { data, error } = await query;
    if (error) throw new AppError('Failed to fetch messages', 500, 'DB_ERROR');
    return data || [];
  }

  async countUnread(recipientId) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', recipientId)
      .eq('is_read', false);

    if (error) throw new AppError('Failed to count unread messages', 500, 'DB_ERROR');
    return count || 0;
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('messages')
      .insert(payload)
      .select()
      .single();

    if (error) throw new AppError('Failed to create message', 500, 'DB_ERROR');
    return data;
  }

  async markRead(ids) {
    if (!ids || ids.length === 0) return;
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', ids);

    if (error) throw new AppError('Failed to mark messages as read', 500, 'DB_ERROR');
  }

  async patch(id, fields) {
    const { error } = await supabase
      .from('messages')
      .update(fields)
      .eq('id', id);

    if (error) throw new AppError('Failed to update message', 500, 'DB_ERROR');
  }

  async remove(id) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw new AppError('Failed to delete message', 500, 'DB_ERROR');
  }

  async getConfigByKey(key) {
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw new AppError(`Failed to fetch config key: ${key}`, 500, 'DB_ERROR');
    return data;
  }

  async deleteAllInTable(table) {
    // Deletes every row in a given table. Used only by the factory-reset endpoint.
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '__nonexistent__');

    if (error) throw new AppError(`Failed to clear table: ${table}`, 500, 'DB_ERROR');
  }

  async uploadAttachment(file) {
    const ext = file.originalname.split('.').pop();
    const path = `messages/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const { error } = await supabase.storage
      .from('attachments')
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new AppError('Failed to upload file to storage', 500, 'STORAGE_ERROR');
    }

    const { data } = supabase.storage.from('attachments').getPublicUrl(path);
    return data?.publicUrl || null;
  }
}

module.exports = new MessageRepository();
