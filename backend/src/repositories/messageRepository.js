const supabase = require('../lib/supabase');
const { AppError } = require('../utils/errors');

/**
 * Column mapping: Supabase uses camelCase as defined in schema.js
 * senderId, recipientId, text (not content), read (not is_read)
 * Additional columns added via migration: senderName, type, metadata
 * We try both schemas for maximum compatibility.
 */
class MessageRepository {
  async findByUser(userId, isAdmin) {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!isAdmin) {
      // Try both snake_case and camelCase column names
      query = query.or(
        `sender_id.eq.${userId},recipient_id.eq.${userId},recipient_id.eq.all,senderId.eq.${userId},recipientId.eq.${userId},recipientId.eq.all`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error('[MessageRepository.findByUser] Supabase error:', error);
      throw new AppError('Failed to fetch messages', 500, 'DB_ERROR');
    }
    return data || [];
  }

  async countUnread(recipientId) {
    // Try snake_case first
    let { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', recipientId)
      .eq('is_read', false);

    if (error) {
      // Fallback to camelCase
      const result = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipientId', recipientId)
        .eq('read', false);
      count = result.count;
      error = result.error;
    }

    if (error) throw new AppError('Failed to count unread messages', 500, 'DB_ERROR');
    return count || 0;
  }

  async create(payload) {
    const snakeCasePayload = {
      id: payload.id,
      sender_id: payload.sender_id,
      sender_name: payload.sender_name,
      recipient_id: payload.recipient_id,
      type: payload.type || 'text',
      content: payload.content,
      metadata: payload.metadata || {},
      is_read: false,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(snakeCasePayload)
      .select()
      .single();

    if (!error) return data;

    console.error('[MessageRepository.create] snake_case failed:', error.message, '— trying camelCase schema');

    const camelCasePayload = {
      id: payload.id,
      senderId: payload.sender_id,
      senderName: payload.sender_name,
      recipientId: payload.recipient_id,
      type: payload.type || 'text',
      text: payload.content,
      metadata: payload.metadata || {},
      read: false,
    };

    const fallback = await supabase
      .from('messages')
      .insert(camelCasePayload)
      .select()
      .single();

    if (fallback.error) {
      console.error('[MessageRepository.create] camelCase also failed:', fallback.error.message);
      throw new AppError('Failed to create message: ' + fallback.error.message, 500, 'DB_ERROR');
    }

    return fallback.data;
  }


  async markRead(ids) {
    if (!ids || ids.length === 0) return;

    // Try snake_case first
    let { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', ids);

    if (error) {
      // Fallback camelCase
      const result = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', ids);
      error = result.error;
    }

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
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '__nonexistent__');

    if (error) throw new AppError(`Failed to clear table: ${table}`, 500, 'DB_ERROR');
  }

  async uploadAttachment(file) {
    const ext = file.originalname.split('.').pop();
    const filePath = `messages/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const { error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new AppError('Failed to upload file to storage', 500, 'STORAGE_ERROR');
    }

    const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
    return (data && data.publicUrl) || null;
  }
}

module.exports = new MessageRepository();
