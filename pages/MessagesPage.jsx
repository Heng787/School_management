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
  const { currentUser, staff, classes, staffPermissions, addStaffPermission } = useData();
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
  const [attachment, setAttachment] = useState(null);
  const [announcementMode, setAnnouncementMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  useEffect(() => {
    if (!activeConversation) return;
    const unread = conversationMessages
      .filter((m) => !m.isRead && m.recipientId === myDbId)
      .map((m) => m.id);
    if (unread.length > 0) markAsRead(unread);
  }, [activeConversation, messages]);

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

  const totalUnread = messages.filter(
    (m) => !m.isRead && m.recipientId === myDbId,
  ).length;

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
    if ((!text.trim() && !attachment) || sending) return;

    setSending(true);
    const recipient = announcementMode ? 'all' : activeConversation;

    let metadata = undefined;
    if (attachment) {
      const fileUrl = await uploadAttachment(attachment);
      if (fileUrl) {
        const isImage = attachment.type.startsWith('image/');
        metadata = isImage
          ? { imageUrl: fileUrl, fileName: attachment.name }
          : { fileUrl, fileName: attachment.name };
      }
    }

    const newMsg = await sendMessage({
      senderId: myDbId,
      senderName: myName,
      recipientId: recipient,
      type: announcementMode ? 'announcement' : 'text',
      content: text.trim(),
      metadata,
      isAdmin,
    });

    if (newMsg) {
      setMessages((prev) => [...prev, newMsg]);
      setText('');
      setAttachment(null);
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
    await updateLeaveStatus(id, status);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, metadata: { ...m.metadata, status } } : m,
      ),
    );

    if (status === 'approved') {
      const msg = messages.find((m) => m.id === id);
      if (msg && msg.metadata) {
        await addStaffPermission({
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
          attachment={attachment}
          setAttachment={setAttachment}
          fileInputRef={fileInputRef}
          announcementMode={announcementMode}
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
    </div>
  );
};

export default MessagesPage;
