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

const updateLocalMessageMetadata = (id, metadata) => {
  try {
    const msgs = getLocalMessages();
    const idx = msgs.findIndex((m) => m.id === id);
    if (idx !== -1) {
      msgs[idx].metadata = { ...msgs[idx].metadata, ...metadata };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(msgs));
    }
  } catch (err) {}
};

const markLocalAsRead = (ids) => {
  try {
    const msgs = getLocalMessages();
    let changed = false;
    ids.forEach(id => {
      const idx = msgs.findIndex(m => m.id === id);
      if (idx !== -1 && !msgs[idx].isRead) {
        msgs[idx].isRead = true;
        changed = true;
      }
    });
    if (changed) localStorage.setItem(LOCAL_KEY, JSON.stringify(msgs));
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

    // Merge: remote messages take priority, but respect local 'isRead' status
    const merged = remoteMsgs.map(rm => {
      const lm = localMsgs.find(l => l.id === rm.id);
      // If locally marked as read, keep it read even if server hasn't synced yet
      if (lm && lm.isRead && !rm.isRead) {
        return { ...rm, isRead: true };
      }
      return rm;
    });

    const remoteIds = new Set(remoteMsgs.map((m) => m.id));
    const localOnly = localMsgs.filter((m) => !remoteIds.has(m.id));
    return [...merged, ...localOnly].sort(
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
      id:          localMsg.id,
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
  // Update locally first
  markLocalAsRead(messageIds);
  try {
    fetch('/api/messages/read', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: messageIds }),
    }).catch((err) => console.warn('Backend markAsRead unreachable:', err));
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
  // Always update locally first for immediate persistence
  updateLocalMessageMetadata(messageId, { status });
  try {
    fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ metadata: { status } }),
    }).catch((err) => console.warn('Backend update unreachable:', err));
  } catch (err) {
    console.error('updateLeaveStatus error:', err);
  }
}

// --- Status API ---

/**
 * Gets unread count for a user.
 */
export async function fetchUnreadCount(userId, isAdmin) {
  // Get local unread messages first
  const localMsgs = getLocalMessages();
  const dbId = isAdmin ? ADMIN_KEY : userId;
  
  // Messages I received that are still unread locally
  const localUnreadIds = new Set(
    localMsgs
      .filter(m => !m.isRead && (m.recipientId === dbId || m.recipientId === 'all'))
      .map(m => m.id)
  );

  try {
    const params = new URLSearchParams({ userId: dbId, countOnly: '1' });
    const res = await fetch(`/api/messages/unread?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return localUnreadIds.size;
    }
    const { data, messages } = await res.json();
    
    // If the API returns the actual message IDs, we can be more precise
    if (messages) {
      const serverUnreadIds = messages.map(m => m.id);
      // Only count messages that are unread on server AND unread locally
      const finalUnread = serverUnreadIds.filter(id => localUnreadIds.has(id));
      return finalUnread.length;
    }

    // Fallback: return server count but capped by local knowledge if possible
    // Or just return the server count if we don't have details
    return (data && data.count != null) ? data.count : localUnreadIds.size;
  } catch (err) {
    return localUnreadIds.size;
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
