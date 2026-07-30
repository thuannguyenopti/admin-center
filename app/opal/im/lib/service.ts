<<<<<<< HEAD
import http from './http';
import type {
  AddParticipantRequest,
  Attachment,
  ChannelDirectoryResponse,
  Conversation,
  ConversationListResponse,
  CreateChannelRequest,
  CreateDMRequest,
  CreateGroupRequest,
  DndSchedule,
  EditMessageRequest,
  IMMessage,
  Mentionable,
  NotificationPref,
  OutboundWebhook,
  OutboundWebhookUpdate,
  PaginatedMessages,
  PaginatedNotifications,
  Participant,
  PresenceStatus,
  SearchFilter,
  SearchResponse,
  SendMessageRequest,
  SidebarSection,
  UnreadCountResponse,
  UpdateChannelRequest,
  UpdateParticipantRoleRequest,
  UserPresence,
  UserSearchResponse,
} from './types';

const MESSAGING_BASE = '';

export async function searchUsers(
  query?: string,
  _includeSelf = false,
): Promise<UserSearchResponse> {
  const params: Record<string, string> = {};
  if (query) {
    params.q = query;
  }
  const resp = await http.get<UserSearchResponse>(
    `${MESSAGING_BASE}/users/search`,
    { params },
  );
  return resp.data;
}

export async function getProfilesByIds(
  userIds: string[],
): Promise<UserSearchResponse> {
  if (userIds.length === 0) {
    return { users: [] };
  }
  const resp = await http.post<UserSearchResponse>(
    `${MESSAGING_BASE}/users/profiles`,
    { user_ids: userIds },
  );
  return resp.data;
}

export async function cacheProfiles(): Promise<void> {
  await http.post(`${MESSAGING_BASE}/users/cache-profiles`);
}

export async function createDM(participantId: string): Promise<Conversation> {
  const body: CreateDMRequest = { participant_id: participantId };
  const resp = await http.post<Conversation>(
    `${MESSAGING_BASE}/conversations`,
    body,
  );
  return resp.data;
}

export async function listConversations(): Promise<ConversationListResponse> {
  const resp = await http.get<ConversationListResponse>(
    `${MESSAGING_BASE}/conversations`,
  );
  return resp.data;
}

export async function getConversation(
  conversationId: string,
): Promise<Conversation> {
  const resp = await http.get<Conversation>(
    `${MESSAGING_BASE}/conversations/${conversationId}`,
  );
  return resp.data;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  replyToId?: string,
  attachments?: Attachment[],
  metadata?: Record<string, unknown>,
): Promise<IMMessage> {
  const body: SendMessageRequest = { content };
  if (replyToId) {
    body.reply_to_id = replyToId;
  }
  if (attachments && attachments.length > 0) {
    body.attachments = attachments;
  }
  if (metadata) {
    body.metadata = metadata;
  }
  const resp = await http.post<IMMessage>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages`,
    body,
  );
  return resp.data;
}

export async function listMessages(
  conversationId: string,
  cursor?: string,
  limit = 50,
): Promise<PaginatedMessages> {
  const params: Record<string, number | string> = { limit };
  if (cursor) {
    params.cursor = cursor;
    params.direction = 'before';
  }
  const resp = await http.get<PaginatedMessages>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages`,
    { params },
  );
  return resp.data;
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  content: string,
): Promise<IMMessage> {
  const body: EditMessageRequest = { content };
  const resp = await http.patch<IMMessage>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}`,
    body,
  );
  return resp.data;
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await http.delete(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}`,
  );
}

export async function listThread(
  conversationId: string,
  messageId: string,
  cursor?: string,
  limit = 50,
): Promise<PaginatedMessages> {
  const params: Record<string, number | string> = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  const resp = await http.get<PaginatedMessages>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/thread`,
    { params },
  );
  return resp.data;
}

export async function sendThreadReply(
  conversationId: string,
  messageId: string,
  content: string,
  attachments?: Attachment[],
): Promise<IMMessage> {
  const body: SendMessageRequest = { content };
  if (attachments && attachments.length > 0) {
    body.attachments = attachments;
  }
  const resp = await http.post<IMMessage>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/thread`,
    body,
  );
  return resp.data;
}

export async function markRead(
  conversationId: string,
  lastMessageId?: string,
): Promise<void> {
  await http.patch(`${MESSAGING_BASE}/conversations/${conversationId}/read`, {
    last_message_id: lastMessageId,
  });
}

export async function getPresence(userIds: string[]): Promise<UserPresence[]> {
  const resp = await http.get<Record<string, string>>(
    `${MESSAGING_BASE}/presence`,
    {
      params: { user_ids: userIds.join(',') },
    },
  );
  return Object.entries(resp.data).map(([userId, status]) => ({
    user_id: userId,
    status: status as PresenceStatus,
    updated_at: new Date().toISOString(),
  }));
}

export async function updatePresence(status: string): Promise<void> {
  await http.put(`${MESSAGING_BASE}/presence`, { status });
}

// --- Groups & Channels ---

export async function createGroup(
  name: string,
  participantIds: string[],
): Promise<Conversation> {
  const body: CreateGroupRequest = {
    name,
    participant_ids: participantIds,
  };
  const resp = await http.post<Conversation>(
    `${MESSAGING_BASE}/conversations`,
    { ...body, type: 'group' },
  );
  return resp.data;
}

export async function createChannel(
  name: string,
  type: 'private_channel' | 'public_channel',
  description?: string,
): Promise<Conversation> {
  const body: CreateChannelRequest & { type: string } = {
    name,
    type,
  };
  if (description) {
    body.description = description;
  }
  const resp = await http.post<Conversation>(
    `${MESSAGING_BASE}/conversations`,
    body,
  );
  return resp.data;
}

export async function joinChannel(conversationId: string): Promise<void> {
  await http.post(`${MESSAGING_BASE}/conversations/${conversationId}/join`);
}

export async function updateChannel(
  conversationId: string,
  update: UpdateChannelRequest,
): Promise<Conversation> {
  const resp = await http.patch<Conversation>(
    `${MESSAGING_BASE}/conversations/${conversationId}`,
    update,
  );
  return resp.data;
}

export async function updateBookmark(
  conversationId: string,
  bookmarked: boolean,
): Promise<void> {
  await http.put(`${MESSAGING_BASE}/conversations/${conversationId}/bookmark`, {
    bookmarked,
  });
}

export async function getSidebarSections(): Promise<SidebarSection[]> {
  const resp = await http.get<SidebarSection[]>(
    `${MESSAGING_BASE}/sidebar-sections`,
  );
  return resp.data;
}

export async function updateSidebarSections(
  sections: SidebarSection[],
): Promise<void> {
  await http.put(`${MESSAGING_BASE}/sidebar-sections`, { sections });
}

export async function updateConversationSection(
  conversationId: string,
  sectionId: string,
): Promise<void> {
  await http.put(`${MESSAGING_BASE}/conversations/${conversationId}/section`, {
    section_id: sectionId,
  });
}

export async function archiveChannel(conversationId: string): Promise<void> {
  await http.post(`${MESSAGING_BASE}/conversations/${conversationId}/archive`);
}

export async function leaveChannel(conversationId: string): Promise<void> {
  await http.delete(`${MESSAGING_BASE}/conversations/${conversationId}`);
}

export async function browseChannels(
  query?: string,
  cursor?: string,
  limit = 50,
): Promise<ChannelDirectoryResponse> {
  const params: Record<string, number | string> = { limit };
  if (query) {
    params.q = query;
  }
  if (cursor) {
    params.cursor = cursor;
  }
  const resp = await http.get<ChannelDirectoryResponse>(
    `${MESSAGING_BASE}/channel-directory`,
    { params },
  );
  return resp.data;
}

// --- Participants ---

export async function addParticipant(
  conversationId: string,
  userId: string,
  role?: string,
): Promise<Participant> {
  const body: AddParticipantRequest = { user_id: userId };
  if (role) {
    body.role = role as AddParticipantRequest['role'];
  }
  const resp = await http.post<Participant>(
    `${MESSAGING_BASE}/conversations/${conversationId}/participants`,
    body,
  );
  return resp.data;
}

export async function removeParticipant(
  conversationId: string,
  userId: string,
): Promise<void> {
  await http.delete(
    `${MESSAGING_BASE}/conversations/${conversationId}/participants/${userId}`,
  );
}

export async function updateParticipantRole(
  conversationId: string,
  userId: string,
  role: string,
): Promise<void> {
  const body: UpdateParticipantRoleRequest = {
    role: role as UpdateParticipantRoleRequest['role'],
  };
  await http.patch(
    `${MESSAGING_BASE}/conversations/${conversationId}/participants/${userId}`,
    body,
  );
}

export async function listParticipants(
  conversationId: string,
): Promise<Participant[]> {
  const resp = await http.get<Participant[]>(
    `${MESSAGING_BASE}/conversations/${conversationId}/participants`,
  );
  return resp.data;
}

// --- Uploads ---

export async function uploadAttachment(file: File): Promise<Attachment> {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await http.post<Attachment>(`${MESSAGING_BASE}/uploads`, fd);
  return resp.data;
}

// --- Reactions ---

export async function addReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  await http.post(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/reactions`,
    { emoji },
  );
}

export async function removeReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  await http.delete(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/reactions`,
    { data: { emoji } },
  );
}

// --- Pin ---

export async function pinMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await http.post(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/pin`,
  );
}

export async function unpinMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await http.delete(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/pin`,
  );
}

// --- Notifications ---

export async function listNotifications(
  cursor?: string,
  limit = 20,
  unreadOnly = false,
): Promise<PaginatedNotifications> {
  const params: Record<string, boolean | number | string> = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  if (unreadOnly) {
    params.unread_only = true;
  }
  const resp = await http.get<PaginatedNotifications>(
    `${MESSAGING_BASE}/notifications`,
    { params },
  );
  return resp.data;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  await http.patch(`${MESSAGING_BASE}/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await http.post(`${MESSAGING_BASE}/notifications/read-all`);
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  await http.delete(`${MESSAGING_BASE}/notifications/${notificationId}`);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const resp = await http.get<UnreadCountResponse>(
    `${MESSAGING_BASE}/notifications/unread-count`,
  );
  return resp.data.count;
}

// --- Notification Preferences ---

export async function getConversationNotificationPref(
  conversationId: string,
): Promise<NotificationPref> {
  const resp = await http.get<{ pref: NotificationPref }>(
    `${MESSAGING_BASE}/conversations/${conversationId}/notification-preferences`,
  );
  return resp.data.pref;
}

export async function updateConversationNotificationPref(
  conversationId: string,
  pref: NotificationPref,
): Promise<void> {
  await http.put(
    `${MESSAGING_BASE}/conversations/${conversationId}/notification-preferences`,
    { pref },
  );
}

export async function getGlobalNotificationPref(): Promise<NotificationPref> {
  const resp = await http.get<{ pref: NotificationPref }>(
    `${MESSAGING_BASE}/notification-preferences`,
  );
  return resp.data.pref;
}

export async function updateGlobalNotificationPref(
  pref: NotificationPref,
): Promise<void> {
  await http.put(`${MESSAGING_BASE}/notification-preferences`, { pref });
}

export async function getDndSchedule(): Promise<DndSchedule> {
  const resp = await http.get<DndSchedule>(`${MESSAGING_BASE}/dnd-schedule`);
  return resp.data;
}

export async function updateDndSchedule(schedule: DndSchedule): Promise<void> {
  await http.put(`${MESSAGING_BASE}/dnd-schedule`, schedule);
}

// --- Mentionables ---

export async function getMentionables(
  conversationId: string,
): Promise<Mentionable[]> {
  const resp = await http.get<Mentionable[]>(
    `${MESSAGING_BASE}/conversations/${conversationId}/mentionables`,
  );
  return resp.data;
}

// --- Search ---

export async function searchMessages(
  query: string,
  filters?: SearchFilter,
  limit = 20,
  offset = 0,
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    offset: String(offset),
  });
  if (filters?.conversation_id) {
    params.set('conversation_id', filters.conversation_id);
  }
  if (filters?.sender_id) {
    params.set('sender_id', filters.sender_id);
  }
  if (filters?.after) {
    params.set('after', filters.after);
  }
  if (filters?.before) {
    params.set('before', filters.before);
  }
  if (filters?.has?.length) {
    params.set('has', filters.has.join(','));
  }
  const resp = await http.get<SearchResponse>(
    `${MESSAGING_BASE}/search?${params.toString()}`,
  );
  return resp.data;
}

// --- Outbound Webhooks ---

export async function createWebhook(
  url: string,
  eventTypes: string[],
): Promise<OutboundWebhook> {
  const resp = await http.post<OutboundWebhook>(`${MESSAGING_BASE}/webhooks`, {
    url,
    event_types: eventTypes,
  });
  return resp.data;
}

export async function listWebhooks(): Promise<OutboundWebhook[]> {
  const resp = await http.get<OutboundWebhook[]>(`${MESSAGING_BASE}/webhooks`);
  return resp.data;
}

export async function getWebhook(webhookId: string): Promise<OutboundWebhook> {
  const resp = await http.get<OutboundWebhook>(
    `${MESSAGING_BASE}/webhooks/${webhookId}`,
  );
  return resp.data;
}

export async function updateWebhook(
  webhookId: string,
  update: OutboundWebhookUpdate,
): Promise<void> {
  await http.patch(`${MESSAGING_BASE}/webhooks/${webhookId}`, update);
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  await http.delete(`${MESSAGING_BASE}/webhooks/${webhookId}`);
}
=======
import http from './http';
import type {
  AddParticipantRequest,
  Attachment,
  ChannelDirectoryResponse,
  Conversation,
  ConversationListResponse,
  CreateChannelRequest,
  CreateDMRequest,
  CreateGroupRequest,
  DndSchedule,
  EditMessageRequest,
  IMMessage,
  Mentionable,
  NotificationPref,
  OutboundWebhook,
  OutboundWebhookUpdate,
  PaginatedMessages,
  PaginatedNotifications,
  Participant,
  PresenceStatus,
  SearchFilter,
  SearchResponse,
  SendMessageRequest,
  SidebarSection,
  UnreadCountResponse,
  UpdateChannelRequest,
  UpdateParticipantRoleRequest,
  UserPresence,
  UserSearchResponse,
} from './types';

const MESSAGING_BASE = '';

export async function searchUsers(
  query?: string,
  _includeSelf = false,
): Promise<UserSearchResponse> {
  const params: Record<string, string> = {};
  if (query) {
    params.q = query;
  }
  const resp = await http.get<UserSearchResponse>(
    `${MESSAGING_BASE}/users/search`,
    { params },
  );
  return resp.data;
}

export async function getProfilesByIds(
  userIds: string[],
): Promise<UserSearchResponse> {
  if (userIds.length === 0) {
    return { users: [] };
  }
  const resp = await http.post<UserSearchResponse>(
    `${MESSAGING_BASE}/users/profiles`,
    { user_ids: userIds },
  );
  return resp.data;
}

export async function cacheProfiles(): Promise<void> {
  await http.post(`${MESSAGING_BASE}/users/cache-profiles`);
}

export async function createDM(participantId: string): Promise<Conversation> {
  const body: CreateDMRequest = { participant_id: participantId };
  const resp = await http.post<Conversation>(
    `${MESSAGING_BASE}/conversations`,
    body,
  );
  return resp.data;
}

export async function listConversations(): Promise<ConversationListResponse> {
  const resp = await http.get<ConversationListResponse>(
    `${MESSAGING_BASE}/conversations`,
  );
  return resp.data;
}

export async function getConversation(
  conversationId: string,
): Promise<Conversation> {
  const resp = await http.get<Conversation>(
    `${MESSAGING_BASE}/conversations/${conversationId}`,
  );
  return resp.data;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  replyToId?: string,
  attachments?: Attachment[],
  metadata?: Record<string, unknown>,
): Promise<IMMessage> {
  const body: SendMessageRequest = { content };
  if (replyToId) {
    body.reply_to_id = replyToId;
  }
  if (attachments && attachments.length > 0) {
    body.attachments = attachments;
  }
  if (metadata) {
    body.metadata = metadata;
  }
  const resp = await http.post<IMMessage>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages`,
    body,
  );
  return resp.data;
}

export async function listMessages(
  conversationId: string,
  cursor?: string,
  limit = 50,
): Promise<PaginatedMessages> {
  const params: Record<string, number | string> = { limit };
  if (cursor) {
    params.cursor = cursor;
    params.direction = 'before';
  }
  const resp = await http.get<PaginatedMessages>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages`,
    { params },
  );
  return resp.data;
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  content: string,
): Promise<IMMessage> {
  const body: EditMessageRequest = { content };
  const resp = await http.patch<IMMessage>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}`,
    body,
  );
  return resp.data;
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await http.delete(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}`,
  );
}

export async function listThread(
  conversationId: string,
  messageId: string,
  cursor?: string,
  limit = 50,
): Promise<PaginatedMessages> {
  const params: Record<string, number | string> = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  const resp = await http.get<PaginatedMessages>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/thread`,
    { params },
  );
  return resp.data;
}

export async function sendThreadReply(
  conversationId: string,
  messageId: string,
  content: string,
  attachments?: Attachment[],
): Promise<IMMessage> {
  const body: SendMessageRequest = { content };
  if (attachments && attachments.length > 0) {
    body.attachments = attachments;
  }
  const resp = await http.post<IMMessage>(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/thread`,
    body,
  );
  return resp.data;
}

export async function markRead(
  conversationId: string,
  lastMessageId?: string,
): Promise<void> {
  await http.patch(`${MESSAGING_BASE}/conversations/${conversationId}/read`, {
    last_message_id: lastMessageId,
  });
}

export async function getPresence(userIds: string[]): Promise<UserPresence[]> {
  const resp = await http.get<Record<string, string>>(
    `${MESSAGING_BASE}/presence`,
    {
      params: { user_ids: userIds.join(',') },
    },
  );
  return Object.entries(resp.data).map(([userId, status]) => ({
    user_id: userId,
    status: status as PresenceStatus,
    updated_at: new Date().toISOString(),
  }));
}

export async function updatePresence(status: string): Promise<void> {
  await http.put(`${MESSAGING_BASE}/presence`, { status });
}

// --- Groups & Channels ---

export async function createGroup(
  name: string,
  participantIds: string[],
): Promise<Conversation> {
  const body: CreateGroupRequest = {
    name,
    participant_ids: participantIds,
  };
  const resp = await http.post<Conversation>(
    `${MESSAGING_BASE}/conversations`,
    { ...body, type: 'group' },
  );
  return resp.data;
}

export async function createChannel(
  name: string,
  type: 'private_channel' | 'public_channel',
  description?: string,
): Promise<Conversation> {
  const body: CreateChannelRequest & { type: string } = {
    name,
    type,
  };
  if (description) {
    body.description = description;
  }
  const resp = await http.post<Conversation>(
    `${MESSAGING_BASE}/conversations`,
    body,
  );
  return resp.data;
}

export async function joinChannel(conversationId: string): Promise<void> {
  await http.post(`${MESSAGING_BASE}/conversations/${conversationId}/join`);
}

export async function updateChannel(
  conversationId: string,
  update: UpdateChannelRequest,
): Promise<Conversation> {
  const resp = await http.patch<Conversation>(
    `${MESSAGING_BASE}/conversations/${conversationId}`,
    update,
  );
  return resp.data;
}

export async function updateBookmark(
  conversationId: string,
  bookmarked: boolean,
): Promise<void> {
  await http.put(`${MESSAGING_BASE}/conversations/${conversationId}/bookmark`, {
    bookmarked,
  });
}

export async function getSidebarSections(): Promise<SidebarSection[]> {
  const resp = await http.get<SidebarSection[]>(
    `${MESSAGING_BASE}/sidebar-sections`,
  );
  return resp.data;
}

export async function updateSidebarSections(
  sections: SidebarSection[],
): Promise<void> {
  await http.put(`${MESSAGING_BASE}/sidebar-sections`, { sections });
}

export async function updateConversationSection(
  conversationId: string,
  sectionId: string,
): Promise<void> {
  await http.put(`${MESSAGING_BASE}/conversations/${conversationId}/section`, {
    section_id: sectionId,
  });
}

export async function archiveChannel(conversationId: string): Promise<void> {
  await http.post(`${MESSAGING_BASE}/conversations/${conversationId}/archive`);
}

export async function leaveChannel(conversationId: string): Promise<void> {
  await http.delete(`${MESSAGING_BASE}/conversations/${conversationId}`);
}

export async function browseChannels(
  query?: string,
  cursor?: string,
  limit = 50,
): Promise<ChannelDirectoryResponse> {
  const params: Record<string, number | string> = { limit };
  if (query) {
    params.q = query;
  }
  if (cursor) {
    params.cursor = cursor;
  }
  const resp = await http.get<ChannelDirectoryResponse>(
    `${MESSAGING_BASE}/channel-directory`,
    { params },
  );
  return resp.data;
}

// --- Participants ---

export async function addParticipant(
  conversationId: string,
  userId: string,
  role?: string,
): Promise<Participant> {
  const body: AddParticipantRequest = { user_id: userId };
  if (role) {
    body.role = role as AddParticipantRequest['role'];
  }
  const resp = await http.post<Participant>(
    `${MESSAGING_BASE}/conversations/${conversationId}/participants`,
    body,
  );
  return resp.data;
}

export async function removeParticipant(
  conversationId: string,
  userId: string,
): Promise<void> {
  await http.delete(
    `${MESSAGING_BASE}/conversations/${conversationId}/participants/${userId}`,
  );
}

export async function updateParticipantRole(
  conversationId: string,
  userId: string,
  role: string,
): Promise<void> {
  const body: UpdateParticipantRoleRequest = {
    role: role as UpdateParticipantRoleRequest['role'],
  };
  await http.patch(
    `${MESSAGING_BASE}/conversations/${conversationId}/participants/${userId}`,
    body,
  );
}

export async function listParticipants(
  conversationId: string,
): Promise<Participant[]> {
  const resp = await http.get<Participant[]>(
    `${MESSAGING_BASE}/conversations/${conversationId}/participants`,
  );
  return resp.data;
}

// --- Uploads ---

export async function uploadAttachment(file: File): Promise<Attachment> {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await http.post<Attachment>(`${MESSAGING_BASE}/uploads`, fd);
  return resp.data;
}

// --- Reactions ---

export async function addReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  await http.post(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/reactions`,
    { emoji },
  );
}

export async function removeReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
): Promise<void> {
  await http.delete(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/reactions`,
    { data: { emoji } },
  );
}

// --- Pin ---

export async function pinMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await http.post(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/pin`,
  );
}

export async function unpinMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await http.delete(
    `${MESSAGING_BASE}/conversations/${conversationId}/messages/${messageId}/pin`,
  );
}

// --- Notifications ---

export async function listNotifications(
  cursor?: string,
  limit = 20,
  unreadOnly = false,
): Promise<PaginatedNotifications> {
  const params: Record<string, boolean | number | string> = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  if (unreadOnly) {
    params.unread_only = true;
  }
  const resp = await http.get<PaginatedNotifications>(
    `${MESSAGING_BASE}/notifications`,
    { params },
  );
  return resp.data;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  await http.patch(`${MESSAGING_BASE}/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await http.post(`${MESSAGING_BASE}/notifications/read-all`);
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  await http.delete(`${MESSAGING_BASE}/notifications/${notificationId}`);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const resp = await http.get<UnreadCountResponse>(
    `${MESSAGING_BASE}/notifications/unread-count`,
  );
  return resp.data.count;
}

// --- Notification Preferences ---

export async function getConversationNotificationPref(
  conversationId: string,
): Promise<NotificationPref> {
  const resp = await http.get<{ pref: NotificationPref }>(
    `${MESSAGING_BASE}/conversations/${conversationId}/notification-preferences`,
  );
  return resp.data.pref;
}

export async function updateConversationNotificationPref(
  conversationId: string,
  pref: NotificationPref,
): Promise<void> {
  await http.put(
    `${MESSAGING_BASE}/conversations/${conversationId}/notification-preferences`,
    { pref },
  );
}

export async function getGlobalNotificationPref(): Promise<NotificationPref> {
  const resp = await http.get<{ pref: NotificationPref }>(
    `${MESSAGING_BASE}/notification-preferences`,
  );
  return resp.data.pref;
}

export async function updateGlobalNotificationPref(
  pref: NotificationPref,
): Promise<void> {
  await http.put(`${MESSAGING_BASE}/notification-preferences`, { pref });
}

export async function getDndSchedule(): Promise<DndSchedule> {
  const resp = await http.get<DndSchedule>(`${MESSAGING_BASE}/dnd-schedule`);
  return resp.data;
}

export async function updateDndSchedule(schedule: DndSchedule): Promise<void> {
  await http.put(`${MESSAGING_BASE}/dnd-schedule`, schedule);
}

// --- Mentionables ---

export async function getMentionables(
  conversationId: string,
): Promise<Mentionable[]> {
  const resp = await http.get<Mentionable[]>(
    `${MESSAGING_BASE}/conversations/${conversationId}/mentionables`,
  );
  return resp.data;
}

// --- Search ---

export async function searchMessages(
  query: string,
  filters?: SearchFilter,
  limit = 20,
  offset = 0,
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    offset: String(offset),
  });
  if (filters?.conversation_id) {
    params.set('conversation_id', filters.conversation_id);
  }
  if (filters?.sender_id) {
    params.set('sender_id', filters.sender_id);
  }
  if (filters?.after) {
    params.set('after', filters.after);
  }
  if (filters?.before) {
    params.set('before', filters.before);
  }
  if (filters?.has?.length) {
    params.set('has', filters.has.join(','));
  }
  const resp = await http.get<SearchResponse>(
    `${MESSAGING_BASE}/search?${params.toString()}`,
  );
  return resp.data;
}

// --- Outbound Webhooks ---

export async function createWebhook(
  url: string,
  eventTypes: string[],
): Promise<OutboundWebhook> {
  const resp = await http.post<OutboundWebhook>(`${MESSAGING_BASE}/webhooks`, {
    url,
    event_types: eventTypes,
  });
  return resp.data;
}

export async function listWebhooks(): Promise<OutboundWebhook[]> {
  const resp = await http.get<OutboundWebhook[]>(`${MESSAGING_BASE}/webhooks`);
  return resp.data;
}

export async function getWebhook(webhookId: string): Promise<OutboundWebhook> {
  const resp = await http.get<OutboundWebhook>(
    `${MESSAGING_BASE}/webhooks/${webhookId}`,
  );
  return resp.data;
}

export async function updateWebhook(
  webhookId: string,
  update: OutboundWebhookUpdate,
): Promise<void> {
  await http.patch(`${MESSAGING_BASE}/webhooks/${webhookId}`, update);
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  await http.delete(`${MESSAGING_BASE}/webhooks/${webhookId}`);
}
>>>>>>> origin/main
