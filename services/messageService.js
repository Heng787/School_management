import { getSupabase } from './core';
// Message Service for handling Supabase messaging, status updates, and attachments.

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// The admin's fixed recipient/sender key used in the DB
export const ADMIN_KEY = 'admin';

const fromDb = (d)=> ({
    id: d.id,
    senderId: d.sender_id,
    senderName: d.sender_name,
    recipientId: d.recipient_id,
    type: d.type,
    content: d.content,
    metadata: d.metadata || {},
    isRead: d.is_read,
    createdAt: d.created_at,
});

/**
 * Fetch all messages relevant to a user.
 * Admin fetches ALL messages (they need visibility of all conversations).
 * Staff fetches only messages involving them.
 */
export async function fetchMessages(userId, isAdmin) {
    const client = getSupabase();
    if (!client) return [];

    let query = client
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (!isAdmin) {
        // Staff only sees their own messages + broadcasts
        query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId},recipient_id.eq.all`);
    }
    // Admin fetches everything (no filter) — sees all staff conversations

    const { data, error } = await query;
    if (error) {
        console.error('Failed to fetch messages:', error);
        return [];
    }
    return (data || []).map(fromDb);
}

/**
 * Send a new message. Admin always sends_KEY.
 */
export async function sendMessage(msg) {
    const client = getSupabase();
    if (!client) return null;

    const dbSenderId = msg.isAdmin ? ADMIN_KEY : msg.senderId;
    // If staff sends to admin, recipient is always ADMIN_KEY
    const dbRecipientId = msg.recipientId === 'admin' || msg.recipientId === ADMIN_KEY
        ? ADMIN_KEY
        : msg.recipientId;

    const payload = {
        id: generateId(),
        sender_id: dbSenderId,
        sender_name: msg.senderName,
        recipient_id: dbRecipientId,
        type: msg.type,
        content: msg.content,
        metadata: msg.metadata || {},
        is_read: false,
    };

    const { data, error } = await client.from('messages').insert(payload).select().single();
    if (error) {
        console.error('Failed to send message:', error);
        return null;
    }
    return fromDb(data);
}

/** Mark messages */
export async function markAsRead(messageIds) {
    const client = getSupabase();
    if (!client || messageIds.length === 0) return;
    await client.from('messages').update({ is_read: true }).in('id', messageIds);
}

/** Delete (unsend) a message */
export async function deleteMessage(messageId) {
    const client = getSupabase();
    if (!client) return;
    await client.from('messages').delete().eq('id', messageId);
}

/** Edit (update) a message's content */
export async function updateMessage(messageId, newContent) {
    const client = getSupabase();
    if (!client) return;
    await client
        .from('messages')
        .update({ content: newContent, metadata: { edited: true, editedAt: new Date().toISOString() } })
        .eq('id', messageId);
}

/** Upload a file/image to Supabase Storage and return its URL */
export async function uploadAttachment(file) {
    const client = getSupabase();
    if (!client) return null;
    const ext = file.name.split('.').pop();
    const path = `messages/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await client.storage.from('attachments').upload(path, file, { upsert: true });
    if (error) {
        console.error('Upload failed:', error);
        return null;
    }
    const { data } = client.storage.from('attachments').getPublicUrl(path);
    return data?.publicUrl || null;
}

/** Update leave request status (admin only) */
export async function updateLeaveStatus(messageId, status) {
    const client = getSupabase();
    if (!client) return;
    await client
        .from('messages')
        .update({ metadata: { status } })
        .eq('id', messageId);
}

/** Delete messages older than 24 hours */
export async function deleteOldMessages() {
    const client = getSupabase();
    if (!client) return;
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error } = await client.from('messages').delete().lt('created_at', cutoff);
    if (error) console.warn('Cleanup old messages failed:', error);
}

/** Get unread count for a user */
export async function fetchUnreadCount(userId, isAdmin) {
    const client = getSupabase();
    if (!client) return 0;
    const dbId = isAdmin ? ADMIN_KEY : userId;
    const { count, error } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', dbId)
        .eq('is_read', false);
    if (error) return 0;
    return count || 0;
}

/** Subscribe to new messages (real-time) */
export function subscribeToMessages(
    userId,
    isAdmin,
    onUpdate
) {
    const client = getSupabase();
    if (!client) return null;

    const dbId = isAdmin ? ADMIN_KEY : userId;
    const channelName = isAdmin ? 'messages_admin_all' : `messages_${dbId}`;

    const shouldReceive = (msg) => {
        if (isAdmin) return true; // admin sees everything
        return msg.senderId === dbId || msg.recipientId === dbId || msg.recipientId === 'all';
    };

    const channel = client
        .channel(channelName)
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                const msg = fromDb(payload.new);
                if (shouldReceive(msg)) onUpdate(msg);
            }
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'messages' },
            (payload) => {
                const msg = fromDb(payload.new);
                if (shouldReceive(msg)) onUpdate(msg);
            }
        )
        .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'messages' },
            (payload) => {
                // Dispatch a delete event — pages handle removing from state
                onUpdate({ ...fromDb(payload.old), content: '__DELETED__' });
            }
        )
        .subscribe();

    return channel;
}
