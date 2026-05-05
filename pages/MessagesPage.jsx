import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import ChatHeader from '../components/messagespage/ChatHeader';
import ChatMessages from '../components/messagespage/ChatMessages';
import ConversationList from '../components/messagespage/ConversationList';
import IncidentModal from '../components/messagespage/IncidentModal';
import LeaveModal from '../components/messagespage/LeaveModal';
import MessageInput from '../components/messagespage/MessageInput';
import { useData } from '../context/DataContext';
import {
  fetchMessages,
  sendMessage,
  markAsRead,
  updateLeaveStatus,
  subscribeToMessages,
  deleteMessage,
  updateMessage,
  uploadAttachment,
  ADMIN_KEY,
} from '../services/messageService';

import { UserRole } from '../types';

/**
 * PAGE: MessagesPage
 * DESCRIPTION: Main messaging interface with component-based architecture.
 */
const MessagesPage = () => {
  // --- Context & Data ---
  const { currentUser, staff, classes, staffPermissions, addStaffPermission, addActivityLog } = useData();
  const isAdmin = currentUser?.role === UserRole.Admin;
  const myDbId = isAdmin ? ADMIN_KEY : currentUser?.id || '';
  const myName = currentUser?.name || 'Administrator';

  // --- State & Refs ---
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [announcementMode, setAnnouncementMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const initRef = useRef(false);

  // --- Data Loading ---
  const load = useCallback(async () => {
    const data = await fetchMessages(myDbId, isAdmin);
    setMessages(data);

    // Initialize active conversation
    if (!initRef.current) {
      if (isAdmin) {
        if (staff.length > 0) {
          const staffIdSet = new Set(staff.map((s) => s.id));
          const ids = [
            ...new Set(
              data
                .map((m) =>
                  staffIdSet.has(m.senderId) ? m.senderId : m.recipientId,
                )
                .filter((id) => id !== 'all' && staffIdSet.has(id)),
            ),
          ];
          const defaultId = ids[0] || staff[0]?.id || '';
          setActiveConversation(defaultId);
          initRef.current = true;
        }
      } else {
        setActiveConversation(ADMIN_KEY);
        if (currentUser?.role !== UserRole.Teacher) {
          setMobileShowChat(true);
        }
        initRef.current = true;
      }
    }

    setLoading(false);
  }, [myDbId, isAdmin, staff, currentUser?.role]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    const channel = subscribeToMessages(myDbId, isAdmin, (newMsg) => {
      if (newMsg.content === '__DELETED__') {
        setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
        return;
      }
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === newMsg.id);
        if (exists) return prev.map((m) => (m.id === newMsg.id ? newMsg : m));
        return [...prev, newMsg];
      });
    });

    return () => {
      clearInterval(interval);
      channel?.unsubscribe();
    };
  }, [myDbId, isAdmin, load]);

  // Toast Notification Logic
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    
    // If it's a new message, not from me, and not in the currently open chat
    if (
      lastMsg.id !== lastNotificationId && 
      lastMsg.senderId !== myDbId && 
      lastMsg.recipientId !== 'all' && // Ignore broadcasts for toast
      lastMsg.senderId !== activeConversation &&
      !lastMsg.isRead
    ) {
      setLastNotificationId(lastMsg.id);
      setActiveNotification(lastMsg);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setActiveNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [messages, activeConversation, myDbId, lastNotificationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  useEffect(() => {
    if (!activeConversation) return;
    const unread = conversationMessages
      .filter((m) => !m.isRead && (m.recipientId === myDbId || m.recipientId === 'all'))
      .map((m) => m.id);
    if (unread.length > 0) {
      markAsRead(unread);
      // Instant UI update
      setMessages(prev => prev.map(m => unread.includes(m.id) ? { ...m, isRead: true } : m));
    }
  }, [activeConversation, messages, myDbId]); // Fixed: depends on messages to catch new ones while open

  // --- Memoized Data ---
  const staffConversations = useMemo(() => {
    const filteredStaff = staff.filter((s) => {
      // Exclude specific roles from the messaging system
      const excludedRoles = [
        'Cleaner',
        'Guard',
        'Teacher Assistant',
        'Teacher Assistance',
        'Assistant Teacher',
        'Assistance Teacher'
      ];
      if (excludedRoles.includes(s.role)) return false;

      if (isAdmin) return true;
      // Every non-admin user can see and message all other staff members
      return s.id !== currentUser?.id;
    });

    const contacts = filteredStaff.map((s) => {
      const msgs = messages.filter(
        (m) => (m.senderId === s.id && m.recipientId === ADMIN_KEY) ||
               (m.senderId === ADMIN_KEY && m.recipientId === s.id),
      );
      const lastMsg = msgs[msgs.length - 1];
      const unread = msgs.filter(
        (m) => !m.isRead && m.senderId === s.id,
      ).length;

      // Enrich with role, room, and status
      const staffClass = classes.find(c => c.teacherId === s.id);
      const room = staffClass ? staffClass.name : 'Office';
      
      // Determine status (simulated/logic-based)
      const today = new Date().toLocaleDateString('en-CA');
      const isOnLeave = staffPermissions.some(p => p.staffId === s.id && p.startDate <= today && p.endDate >= today);
      const status = isOnLeave ? 'away' : (Math.random() > 0.3 ? 'online' : 'offline');

      return { 
        id: s.id, 
        name: s.name, 
        role: s.role, 
        room, 
        status,
        lastMsg, 
        unread 
      };
    });

    if (!isAdmin) {
      const adminMsgs = messages.filter(
        (m) => m.senderId === ADMIN_KEY || m.recipientId === ADMIN_KEY,
      );
      const lastMsg = adminMsgs[adminMsgs.length - 1];
      const unread = adminMsgs.filter(
        (m) => !m.isRead && m.senderId === ADMIN_KEY,
      ).length;
      contacts.unshift({
        id: ADMIN_KEY,
        name: 'Administrator',
        role: 'Support',
        room: 'HQ',
        status: 'online',
        lastMsg,
        unread,
      });
    }

    return contacts
      .sort((a, b) => {
        if (a.id === ADMIN_KEY) return -1;
        if (b.id === ADMIN_KEY) return 1;
        if (!a.lastMsg && !b.lastMsg) return 0;
        if (!a.lastMsg) return 1;
        if (!b.lastMsg) return -1;
        return (
          new Date(b.lastMsg.createdAt).getTime() -
          new Date(a.lastMsg.createdAt).getTime()
        );
      })
      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [
    isAdmin,
    staff,
    messages,
    currentUser?.role,
    currentUser?.id,
    searchQuery,
  ]);

  const isMultiRecipient =
    isAdmin ||
    currentUser?.role === UserRole.Teacher ||
    currentUser?.role === UserRole.OfficeWorker;
  const staffIdSet = new Set(staff.map((s) => s.id));

  const conversationMessages = messages.filter((m) => {
    // 1. If in "All Chat" mode, only show announcements/broadcasts
    if (activeConversation === 'all') {
      return m.recipientId === 'all' || m.type === 'announcement';
    }

    // 2. If in a private conversation, NEVER show broadcasts
    if (m.recipientId === 'all' || m.type === 'announcement') return false;

    // 3. Handle private message filtering
    if (isAdmin) {
      // Admin sees chat with a specific staff member
      return (
        (m.senderId === activeConversation && m.recipientId === ADMIN_KEY) ||
        (m.senderId === ADMIN_KEY && m.recipientId === activeConversation)
      );
    }
    
    // For non-admins (Staff seeing chat with Admin or another Staff)
    return (
      (m.senderId === myDbId && m.recipientId === activeConversation) ||
      (m.senderId === activeConversation && m.recipientId === myDbId)
    );
  });

  const broadcastUnread = messages.filter(
    (m) => !m.isRead && m.recipientId === 'all',
  ).length;

  const totalUnread = staffConversations.reduce((acc, c) => acc + c.unread, 0) + broadcastUnread;

  const isMine = (msg) => {
    if (isAdmin) return !staffIdSet.has(msg.senderId);
    return msg.senderId === myDbId;
  };

  const activeStaff = isAdmin
    ? staff.find((s) => s.id === activeConversation)
    : null;

  // --- Action Handlers ---
  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!text.trim() && attachments.length === 0) || sending) return;

    // Guard: must have a conversation selected
    if (!activeConversation && !announcementMode) return;

    setSending(true);
    const recipient = (announcementMode && isAdmin) ? 'all' : activeConversation;

    // Convert attachments to base64 locally
    const processedAttachments = [];
    if (attachments.length > 0) {
      for (const file of attachments) {
        const isImage = file.type.startsWith('image/');
        try {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          processedAttachments.push({
            url: base64,
            name: file.name,
            type: isImage ? 'image' : 'file'
          });
        } catch {
          console.warn('[handleSend] Could not read file:', file.name);
        }
      }
    }

    const newMsg = await sendMessage({
      senderId: myDbId,
      senderName: myName,
      recipientId: recipient,
      type: (announcementMode && isAdmin) ? 'announcement' : 'text',
      content: text.trim(),
      metadata: processedAttachments.length > 0 ? { attachments: processedAttachments } : undefined,
      isAdmin,
    });

    if (newMsg) {
      setMessages((prev) => [...prev, newMsg]);
      setText('');
      setAttachments([]);
    }
    setSending(false);
  };


  const handleEdit = async (id, newContent) => {
    await updateMessage(id, newContent);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              content: newContent,
              metadata: { ...m.metadata, edited: true },
            }
          : m,
      ),
    );
  };

  const handleQuickSend = async (content, metadata, type) => {
    const recipient = activeConversation || ADMIN_KEY;
    const newMsg = await sendMessage({
      senderId: myDbId,
      senderName: myName,
      recipientId: recipient,
      type,
      content,
      metadata,
      isAdmin,
    });
    if (newMsg) setMessages((prev) => [...prev, newMsg]);
  };

  const handleStatusChange = async (id, status) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg || msg.metadata?.status === status) return;

    await updateLeaveStatus(id, status);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, metadata: { ...m.metadata, status } } : m,
      ),
    );

    if (status === 'approved') {
      if (msg && msg.metadata) {
        // Prevent duplicate permission if it already exists
        const exists = staffPermissions.some(p => p.requestId === id);
        if (exists) return;

        const staffMember = staff.find(s => s.id === msg.senderId);

        await addStaffPermission({
          requestId: id,
          staffId: msg.senderId,
          type: msg.metadata.leaveType || 'Personal Leave',
          startDate:
            msg.metadata.startDate || new Date().toISOString().split('T')[0],
          endDate:
            msg.metadata.endDate || new Date().toISOString().split('T')[0],
          reason: msg.content.includes('Reason:')
            ? msg.content.split('Reason:')[1]?.trim()
            : msg.content,
          createdAt: new Date().toISOString(),
        });

        addActivityLog({
          action: `Admin approved "${msg.metadata.leaveType || 'Leave Request'}" for staff "${staffMember?.name || msg.senderName || 'Unknown'}"`
        });
      }
    }
  };

  const handleDelete = async (id) => {
    await deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // --- Render ---
  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      {/* Conversation List */}
      <ConversationList
        isMultiRecipient={isMultiRecipient}
        mobileShowChat={mobileShowChat}
        isAdmin={isAdmin}
        staff={staff}
        staffConversations={staffConversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        setAnnouncementMode={setAnnouncementMode}
        setMobileShowChat={setMobileShowChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalUnread={totalUnread}
        broadcastUnread={broadcastUnread}
      />

      {/* Chat Panel */}
      <div
        className={`flex-1 flex flex-col min-w-0 w-full ${isMultiRecipient && !mobileShowChat ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Chat Header */}
        <ChatHeader
          isMultiRecipient={isMultiRecipient}
          activeConversation={activeConversation}
          isAdmin={isAdmin}
          activeStaff={activeStaff}
          filteredStaffConversations={staffConversations}
          currentUser={currentUser}
          setMobileShowChat={setMobileShowChat}
          setModal={setModal}
          staff={staff}
        />

        {/* Floating New Message button for mobile */}
        {!isAdmin && isMultiRecipient && mobileShowChat && (
          <button
            onClick={() => setMobileShowChat(false)}
            className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce transition-transform active:scale-95"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}

        {/* Messages Area */}
        <ChatMessages
          conversationMessages={conversationMessages}
          loading={loading}
          isMine={isMine}
          isAdmin={isAdmin}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={handleEdit}
          bottomRef={bottomRef}
        />

        {/* Message Input */}
        <MessageInput
          text={text}
          setText={setText}
          handleSend={handleSend}
          sending={sending}
          attachments={attachments}
          setAttachments={setAttachments}
          fileInputRef={fileInputRef}
          announcementMode={announcementMode}
          isAdmin={isAdmin}
        />
      </div>

      {/* Modals */}
      {modal === 'leave' && (
        <LeaveModal
          onClose={() => setModal(null)}
          onSend={(content, metadata) =>
            handleQuickSend(content, metadata, 'leave_request')
          }
        />
      )}
      {modal === 'incident' && (
        <IncidentModal
          onClose={() => setModal(null)}
          onSend={(content, metadata) =>
            handleQuickSend(content, metadata, 'incident')
          }
        />
      )}

      {/* Floating Notification Toast */}
      {activeNotification && (
        <div 
          onClick={() => {
            setActiveConversation(activeNotification.senderId);
            setMobileShowChat(true);
            setActiveNotification(null);
          }}
          className="fixed bottom-24 right-6 left-6 md:left-auto md:w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-primary-200 dark:border-primary-800 p-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 cursor-pointer group hover:scale-[1.02] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/20 group-hover:rotate-12 transition-transform">
              {activeNotification.senderName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest leading-none mb-1">New Message</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveNotification(null); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{activeNotification.senderName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate line-clamp-1 mt-0.5">{activeNotification.content}</p>
            </div>
          </div>
          <div className="absolute inset-0 border-2 border-primary-500 rounded-2xl animate-pulse opacity-20 pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
