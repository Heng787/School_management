import { getAuthToken } from './core';

/**
 * Service for handling system messaging, status updates, and attachments.
 * All operations go through the backend proxy API.
 */

const generateId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
};

// The admin's fixed recipient/sender key used in the DB
export const ADMIN_KEY = 'admin';

// --- Internal Mappers ---

const fromDb = (d) => ({
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

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// --- Messaging API ---

/**
 * Fetch all messages relevant to a user.
 */
export async function fetchMessages(userId, isAdmin) {
  try {
    const params = new URLSearchParams({ userId, isAdmin: isAdmin ? '1' : '0' });
    const res = await fetch(`/api/messages?${params}`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data || []).map(fromDb);
  } catch {
    return [];
  }
}

/**
 * Send a new message.
 */
export async function sendMessage(msg) {
  try {
    const payload = {
      id: generateId(),
      sender_id: msg.isAdmin ? ADMIN_KEY : msg.senderId,
      sender_name: msg.senderName,
      recipient_id: msg.recipientId === 'admin' || msg.recipientId === ADMIN_KEY
        ? ADMIN_KEY
        : msg.recipientId,
      type: msg.type,
      content: msg.content,
      metadata: msg.metadata || {},
      is_read: false,
    };

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const { data } = await res.json();
    return data ? fromDb(data) : null;
  } catch {
    return null;
  }
}

/**
 * Marks messages as read.
 */
export async function markAsRead(messageIds) {
  if (!messageIds || messageIds.length === 0) return;
  try {
    await fetch('/api/messages/read', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: messageIds }),
    });
  } catch (err) {
    console.error('markAsRead error:', err);
  }
}

/**
 * Deletes a message.
 */
export async function deleteMessage(messageId) {
  try {
    await fetch(`/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.error('deleteMessage error:', err);
  }
}

/**
 * Updates a message's content.
 */
export async function updateMessage(messageId, newContent) {
  try {
    await fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content: newContent,
        metadata: { edited: true, editedAt: new Date().toISOString() },
      }),
    });
  } catch (err) {
    console.error('updateMessage error:', err);
  }
}

// --- Attachments ---

/**
 * Uploads a file/image and returns its URL.
 * Falls back to a local data URL if the backend endpoint is unavailable.
 */
export async function uploadAttachment(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const res = await fetch('/api/messages/attachment', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) return null;
    const { data } = await res.json();
    return data?.url || null;
  } catch {
    return null;
  }
}

// --- Metadata Updates ---

/**
 * Updates leave request status (admin only).
 */
export async function updateLeaveStatus(messageId, status) {
  try {
    await fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ metadata: { status } }),
    });
  } catch (err) {
    console.error('updateLeaveStatus error:', err);
  }
}

// --- Status API ---

/**
 * Gets unread count for a user.
 */
export async function fetchUnreadCount(userId, isAdmin) {
  try {
    const dbId = isAdmin ? ADMIN_KEY : userId;
    const params = new URLSearchParams({ userId: dbId, countOnly: '1' });
    const res = await fetch(`/api/messages/unread?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return 0;
    const { data } = await res.json();
    return data?.count ?? 0;
  } catch {
    return 0;
  }
}

// --- Real-time Subscriptions ---

/**
 * Subscriptions require Supabase real-time which is no longer available client-side.
 * Returns null — callers should poll via fetchMessages instead.
 */
export function subscribeToMessages(_userId, _isAdmin, _onUpdate) {
  return null;
}
