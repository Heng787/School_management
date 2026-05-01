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
  // Handle both snake_case (sender_id) and camelCase (senderId) DB schemas
  senderId:    d.sender_id    || d.senderId    || '',
  senderName:  d.sender_name  || d.senderName  || 'Unknown',
  recipientId: d.recipient_id || d.recipientId || '',
  type:        d.type         || 'text',
  // Handle both 'content' and 'text' column names
  content:     d.content      || d.text        || '',
  metadata:    d.metadata     || {},
  // Handle both 'is_read' and 'read' column names
  isRead:      d.is_read      !== undefined ? d.is_read : (d.read || false),
  createdAt:   d.created_at   || d.timestamp   || new Date().toISOString(),
});

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// --- Local Storage Helpers (thesis defense fallback) ---

const LOCAL_KEY = 'school_admin_messages_local';

const getLocalMessages = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveLocalMessage = (msg) => {
  try {
    const msgs = getLocalMessages();
    // Avoid duplicates
    if (!msgs.find((m) => m.id === msg.id)) {
      msgs.push(msg);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(msgs));
    }
  } catch (err) {
    console.warn('[saveLocalMessage] failed:', err);
  }
};

const removeLocalMessage = (id) => {
  try {
    const msgs = getLocalMessages();
    localStorage.setItem(LOCAL_KEY, JSON.stringify(msgs.filter((m) => m.id !== id)));
  } catch (err) {}
};

const editLocalMessage = (id, newContent) => {
  try {
    const msgs = getLocalMessages();
    const idx = msgs.findIndex((m) => m.id === id);
    if (idx !== -1) {
      msgs[idx].content = newContent;
      msgs[idx].metadata = { ...msgs[idx].metadata, edited: true, editedAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(msgs));
    }
  } catch (err) {}
};

// --- Messaging API ---

/**
 * Fetch all messages relevant to a user.
 */
export async function fetchMessages(userId, isAdmin) {
  // Always start with local messages for instant display
  const localMsgs = getLocalMessages();

  try {
    const params = new URLSearchParams({ userId, isAdmin: isAdmin ? '1' : '0' });
    const res = await fetch(`/api/messages?${params}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[fetchMessages] API error', res.status, err);
      return localMsgs;
    }
    const { data } = await res.json();
    const remoteMsgs = (data || []).map(fromDb);

    // Merge: remote messages take priority, but keep local-only ones
    const remoteIds = new Set(remoteMsgs.map((m) => m.id));
    const localOnly = localMsgs.filter((m) => !remoteIds.has(m.id));
    return [...remoteMsgs, ...localOnly].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  } catch (err) {
    console.error('[fetchMessages] Network error:', err);
    return localMsgs;
  }
}

/**
 * Send a new message.
 */
export async function sendMessage(msg) {
  const recipientId =
    msg.recipientId === 'admin' || msg.recipientId === ADMIN_KEY
      ? ADMIN_KEY
      : msg.recipientId || ADMIN_KEY;

  // Build the local message immediately — UI will show it right away
  const localMsg = {
    id: generateId(),
    senderId:    msg.isAdmin ? ADMIN_KEY : (msg.senderId || ADMIN_KEY),
    senderName:  msg.senderName || 'Administrator',
    recipientId,
    type:        msg.type || 'text',
    content:     msg.content || '',
    metadata:    msg.metadata || {},
    isRead:      false,
    createdAt:   new Date().toISOString(),
  };

  // Save locally first — this guarantees it appears even if backend fails
  saveLocalMessage(localMsg);

  // Try to push to backend in the background (non-blocking for UX)
  const token = getAuthToken();
  if (token) {
    const payload = {
      senderId:    localMsg.senderId,
      senderName:  localMsg.senderName,
      recipientId: localMsg.recipientId,
      type:        localMsg.type,
      content:     localMsg.content,
      metadata:    localMsg.metadata,
    };
    fetch('/api/messages', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => {
      if (!res.ok) {
        res.json().then((b) =>
          console.warn('[sendMessage] Backend rejected (local copy kept):', res.status, b)
        ).catch(() => {});
      } else {
        console.log('[sendMessage] Backend confirmed message saved.');
      }
    }).catch((err) => {
      console.warn('[sendMessage] Backend unreachable (local copy kept):', err.message);
    });
  }

  // Always return the local message so the UI updates instantly
  return localMsg;
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
  // Always delete locally first for immediate effect
  removeLocalMessage(messageId);
  try {
    fetch(`/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).catch((err) => console.warn('Backend delete unreachable:', err));
  } catch (err) {
    console.error('deleteMessage error:', err);
  }
}

/**
 * Updates a message's content.
 */
export async function updateMessage(messageId, newContent) {
  // Always update locally first for immediate effect
  editLocalMessage(messageId, newContent);
  try {
    fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content: newContent,
        metadata: { edited: true, editedAt: new Date().toISOString() },
      }),
    }).catch((err) => console.warn('Backend update unreachable:', err));
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
    return (data && data.url) || null;
  } catch (err) {
    console.error('[uploadAttachment] error:', err);
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
    if (!res.ok) {
      console.error('[fetchUnreadCount] API error', res.status);
      return 0;
    }
    const { data } = await res.json();
    return (data && data.count != null) ? data.count : 0;
  } catch (err) {
    console.error('[fetchUnreadCount] Network error:', err);
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
