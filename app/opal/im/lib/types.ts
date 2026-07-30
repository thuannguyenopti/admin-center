// Conversation types
export type ConversationType =
  | 'dm'
  | 'group'
  | 'private_channel'
  | 'public_channel';

// Presence status for users
export type PresenceStatus = 'away' | 'offline' | 'online';

// Sender type for messages
export type SenderType = 'agent' | 'bot' | 'system' | 'user';

// Message format
export type MessageFormat = 'markdown' | 'system';

// Participant role in a conversation
export type ParticipantRole = 'admin' | 'member' | 'owner';

// Notification preference
export type NotificationPref = 'all' | 'mentions' | 'muted';

// Mention type for @mentions in messages
export type MentionType = 'agent' | 'all' | 'channel' | 'here' | 'user';

// Notification type
export type NotificationType =
  | 'channel_invite'
  | 'mention'
  | 'new_message'
  | 'reaction'
  | 'reply';

export type Participant = {
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
  last_read_at: string;
  last_read_msg_id?: string;
  notification_pref: NotificationPref;
};

export type Attachment = {
  file_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  thumbnail_url?: string;
};

export type Mention = {
  type: MentionType;
  target_id?: string;
  display_name?: string;
};

export type LinkPreview = {
  url: string;
  title?: string;
  description?: string;
  image_url?: string;
  site_name?: string;
};

export type Conversation = {
  id: string;
  instance_id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  topic?: string;
  icon?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  archived_at?: string;
  is_default?: boolean;
  participants: Participant[];
  pinned_message_ids?: string[];
  member_count: number;
};

export type IMMessage = {
  id: string;
  conversation_id: string;
  instance_id: string;
  sender_id: string;
  sender_type: SenderType;
  content: string;
  content_plain: string;
  format: MessageFormat;
  created_at: string;
  edited_at?: string;
  deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  attachments?: Attachment[];
  mentions?: Mention[];
  reactions?: Record<string, string[]>;
  link_previews?: LinkPreview[];
  thread_id?: string;
  thread_reply_count: number;
  thread_participants: string[];
  thread_last_reply_at?: string;
  reply_to_id?: string;
  metadata?: Record<string, unknown>;
};

export type ConversationIndexEntry = {
  conversation_id: string;
  conversation_type: ConversationType;
  name?: string;
  last_message_preview: string;
  last_message_at: string;
  last_message_sender_id: string;
  unread_count: number;
  other_participant_ids: string[];
  archived?: boolean;
  muted?: boolean;
  bookmarked?: boolean;
  section_id?: string;
};

export type SidebarSection = {
  id: string;
  name: string;
  order: number;
};

export type UserPresence = {
  user_id: string;
  status: PresenceStatus;
  updated_at: string;
};

export type Notification = {
  id: string;
  instance_id: string;
  user_id: string;
  type: NotificationType;
  conversation_id: string;
  message_id?: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type DndSchedule = {
  enabled: boolean;
  start_time: string;
  end_time: string;
  timezone?: string;
};

export type ChannelDirectoryEntry = {
  conversation_id: string;
  instance_id: string;
  name: string;
  description?: string;
  topic?: string;
  member_count: number;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Mentionable = {
  id: string;
  display_name: string;
  type: 'agent' | 'user';
};

// API response types
export type PaginatedMessages = {
  messages: IMMessage[];
  next_cursor?: string;
  has_more: boolean;
  user_profiles?: Record<string, string>;
};

export type ConversationListResponse = {
  conversations: ConversationIndexEntry[];
  user_profiles?: Record<string, string>;
};

export type UserProfile = {
  user_id: string;
  display_name: string;
  email?: string;
};

export type UserSearchResponse = {
  users: UserProfile[];
};

export type PaginatedNotifications = {
  notifications: Notification[];
  next_cursor?: string;
  has_more: boolean;
};

export type ChannelDirectoryResponse = {
  channels: ChannelDirectoryEntry[];
  next_cursor?: string;
  has_more: boolean;
};

export type UnreadCountResponse = {
  count: number;
};

export type CreateDMRequest = {
  participant_id: string;
};

export type CreateGroupRequest = {
  name: string;
  participant_ids: string[];
};

export type CreateChannelRequest = {
  name: string;
  description?: string;
  type: 'private_channel' | 'public_channel';
};

export type UpdateChannelRequest = {
  name?: string;
  description?: string;
  topic?: string;
  icon?: string;
  type?: 'private_channel' | 'public_channel';
};

export type SendMessageRequest = {
  content: string;
  format?: MessageFormat;
  reply_to_id?: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
};

export type EditMessageRequest = {
  content: string;
};

export type AddParticipantRequest = {
  user_id: string;
  role?: ParticipantRole;
};

export type UpdateParticipantRoleRequest = {
  role: ParticipantRole;
};

// --- Search Types ---

export type SearchFilter = {
  conversation_id?: string;
  sender_id?: string;
  after?: string; // ISO date string
  before?: string; // ISO date string
  has?: Array<'attachment' | 'link' | 'reaction'>;
};

export type SearchResult = {
  conversation_id: string;
  message_id: string;
  score: number;
  content: string;
  sender_id: string;
  created_at: string;
  conversation_name?: string;
  conversation_type?: ConversationType;
};

export type SearchResponse = {
  results: SearchResult[];
  total_count: number;
  has_more: boolean;
  query: string;
  user_profiles?: Record<string, string>;
};

// --- Outbound Webhook Types ---

export type OutboundWebhook = {
  id: string;
  instance_id: string;
  url: string;
  secret: string;
  event_types: string[];
  created_by: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type OutboundWebhookUpdate = {
  url?: string;
  event_types?: string[];
  active?: boolean;
};
