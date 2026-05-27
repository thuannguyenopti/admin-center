import { promises as fs } from "fs";
import path from "path";
import { VAUS } from "@/app/opal/data/vaus";
import type {
  Attachment,
  ChannelDirectoryEntry,
  Conversation,
  ConversationIndexEntry,
  IMMessage,
  Participant,
  UserProfile,
} from "@/app/opal/im/lib/types";

const DATA_FILE = path.join(process.cwd(), ".messaging-data.json");
// seed v2 — Jamie as DM participant for proactive VAU demos

type StoreShape = {
  conversations: Conversation[];
  messages: Record<string, IMMessage[]>;
  users: UserProfile[];
  __seedVersion?: string;
};

let cache: StoreShape | null = null;
let writeQueue: Promise<void> = Promise.resolve();

const DEFAULT_USER_ID = "jamie";

const VAU_USERS: UserProfile[] = VAUS.map((v) => ({
  user_id: `vau-${v.id}`,
  display_name: v.name,
  email: v.email,
}));

const SEED: StoreShape = {
  users: [
    { user_id: "pei", display_name: "Emily Park", email: "emily.park@optimizely.com" },
    { user_id: "frank", display_name: "Frank Lin", email: "frank@optimizely.com" },
    { user_id: "jamie", display_name: "Jamie Chen", email: "jamie@optimizely.com" },
    { user_id: "mary-anne", display_name: "Mary Anne Torres", email: "maryanne@optimizely.com" },
    { user_id: "opal-bot", display_name: "Opal", email: "opal@optimizely.com" },
    ...VAU_USERS,
  ],
  conversations: [
    {
      id: "conv-frank",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "pei",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        participant("pei", "owner"),
        participant("frank", "member"),
      ],
      member_count: 2,
    },
    {
      id: "conv-design-crew",
      instance_id: "im-prototype",
      type: "group",
      name: "Design crew",
      created_by: "pei",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        participant("pei", "owner"),
        participant("jamie", "member"),
        participant("mary-anne", "member"),
      ],
      member_count: 3,
    },
    {
      id: "conv-general",
      instance_id: "im-prototype",
      type: "public_channel",
      name: "general",
      description: "Company-wide announcements and water cooler chat.",
      created_by: "pei",
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      is_default: true,
      participants: [
        participant("pei", "owner"),
        participant("frank", "member"),
        participant("jamie", "member"),
        participant("mary-anne", "member"),
      ],
      member_count: 4,
    },
    {
      id: "conv-design-leadership",
      instance_id: "im-prototype",
      type: "private_channel",
      name: "design-leadership",
      description: "Closed channel for design leads.",
      created_by: "pei",
      created_at: new Date(Date.now() - 432000000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        participant("pei", "owner"),
        participant("mary-anne", "admin"),
      ],
      member_count: 2,
    },
    {
      id: "conv-campaigns",
      instance_id: "im-prototype",
      type: "public_channel",
      name: "campaigns",
      description: "Campaign planning, performance, and creative reviews.",
      created_by: "mary-anne",
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString(),
      archived: false,
      participants: [
        participant("mary-anne", "owner"),
        participant("frank", "member"),
        participant("jamie", "member"),
      ],
      member_count: 3,
    },
    {
      id: "conv-content",
      instance_id: "im-prototype",
      type: "public_channel",
      name: "content",
      description: "Content production, calendar, and review.",
      created_by: "frank",
      created_at: new Date(Date.now() - 432000000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      archived: false,
      participants: [
        participant("frank", "owner"),
        participant("mary-anne", "member"),
        participant("jamie", "member"),
      ],
      member_count: 3,
    },
    {
      id: "conv-gtm",
      instance_id: "im-prototype",
      type: "private_channel",
      name: "gtm",
      description: "Go-to-market sync — launches, positioning, sales enablement.",
      created_by: "jamie",
      created_at: new Date(Date.now() - 1209600000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      archived: false,
      participants: [
        participant("jamie", "owner"),
        participant("mary-anne", "member"),
      ],
      member_count: 2,
    },
    {
      id: "conv-launch-room",
      instance_id: "im-prototype",
      type: "group",
      name: "Spring launch room",
      created_by: "pei",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        participant("pei", "owner"),
        participant("frank", "member"),
        participant("vau-henry", "member"),
        participant("vau-poppy", "member"),
      ],
      member_count: 4,
    },
    {
      id: "conv-vau-henry",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "vau-henry",
      created_at: new Date(Date.now() - 3300000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        unreadParticipant("jamie", "owner"),
        participant("vau-henry", "member"),
      ],
      member_count: 2,
    },
    {
      id: "conv-vau-poppy",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "jamie",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        unreadParticipant("jamie", "owner"),
        participant("vau-poppy", "member"),
      ],
      member_count: 2,
    },
    {
      id: "conv-vau-tony",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "vau-tony",
      created_at: new Date(Date.now() - 2700000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        unreadParticipant("jamie", "owner"),
        participant("vau-tony", "member"),
      ],
      member_count: 2,
    },
  ],
  messages: {
    "conv-frank": [
      message("msg-1", "conv-frank", "frank", "Hey — I'm reviewing the share dialog PR now, looking good!"),
      message("msg-2", "conv-frank", "pei", "Thanks! Let me know if anything looks off."),
    ],
    "conv-design-crew": [
      message("msg-3", "conv-design-crew", "jamie", "Pushed the new VAU card sort to main 🎉"),
      message("msg-4", "conv-design-crew", "mary-anne", "Looks great! I'll start on the detail page polish."),
      message("msg-5", "conv-design-crew", "pei", "Awesome. Let's sync tomorrow on the IM redesign."),
    ],
    "conv-general": [
      message("msg-g1", "conv-general", "frank", "Welcome to #general — say hi here."),
      message("msg-g2", "conv-general", "mary-anne", "Coffee chat Friday 3pm anyone?"),
    ],
    "conv-design-leadership": [
      message("msg-dl1", "conv-design-leadership", "mary-anne", "Q3 planning doc draft is in the wiki."),
    ],
    "conv-campaigns": [
      message("msg-c1", "conv-campaigns", "mary-anne", "Spring sale campaign is locked in for next week — final creative going to legal today."),
      message("msg-c2", "conv-campaigns", "frank", "Heads up: the headline test on the pricing page is wrapping Friday, results Monday."),
    ],
    "conv-content": [
      message("msg-cn1", "conv-content", "frank", "Q3 content calendar draft is in the wiki — please review your assigned briefs by EOD."),
    ],
    "conv-gtm": [
      message("msg-gtm1", "conv-gtm", "jamie", "Reminder: GTM sync next Tuesday 10am — competitive section is on the agenda."),
    ],
    "conv-launch-room": [
      message("msg-lr1", "conv-launch-room", "pei", "@Henry @Poppy — let's spin up the spring launch room. What's the rough timeline looking like?"),
      message("msg-lr2", "conv-launch-room", "vau-poppy", "Tracking. Rough plan: kickoff Mon, dependency map by Wed, exec preview Fri. Want me to draft a launch timeline?"),
      message("msg-lr3", "conv-launch-room", "vau-henry", "On positioning — I can have a first-pass narrative ready before kickoff if that helps anchor the brief."),
    ],
    "conv-vau-henry": [
      message("msg-vh1", "conv-vau-henry", "vau-henry", "I've noticed significant competitive movement in the experimentation category. Do you want a brief prepared for your next PLT meeting?"),
    ],
    "conv-vau-poppy": [
      message("msg-vp1", "conv-vau-poppy", "jamie", "hey poppy can you spin up an ad hoc new product launch for limitless 1:1 personalization for b2b companies, brief is in CMP"),
      message("msg-vp2", "conv-vau-poppy", "vau-poppy", "On it, I'll ping you when there's something to review for the launch."),
    ],
    "conv-vau-tony": [
      message("msg-vt1", "conv-vau-tony", "vau-tony", "The Campaign \"Homepage Pricing Test\" has hit a killswitch threshold, where conversion has dropped by 0.5%. Do you want to keep it going or switch off this campaign?"),
      message("msg-vt2", "conv-vau-tony", "jamie", "yes, switch it off"),
      message("msg-vt3", "conv-vau-tony", "vau-tony", "Got it — killing the test now. A couple of quick confirmations before I finalize the rollback:"),
    ],
  },
};

function participant(userId: string, role: "owner" | "admin" | "member"): Participant {
  return {
    user_id: userId,
    role,
    joined_at: new Date(Date.now() - 172800000).toISOString(),
    last_read_at: new Date().toISOString(),
    notification_pref: "all",
  };
}

// Participant whose last_read_at is 2 hours old — anything seeded inside the
// last hour will surface as unread in their inbox.
function unreadParticipant(
  userId: string,
  role: "owner" | "admin" | "member",
): Participant {
  return {
    user_id: userId,
    role,
    joined_at: new Date(Date.now() - 172800000).toISOString(),
    last_read_at: new Date(Date.now() - 7200000).toISOString(),
    notification_pref: "all",
  };
}

function message(id: string, convId: string, sender: string, content: string): IMMessage {
  return {
    id,
    conversation_id: convId,
    instance_id: "im-prototype",
    sender_id: sender,
    sender_type: "user",
    content,
    content_plain: content,
    format: "markdown",
    created_at: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    deleted: false,
    thread_reply_count: 0,
    thread_participants: [],
  };
}

// Bump this when SEED participants change so old persisted cache is discarded.
const SEED_VERSION = "v7-tony-followup-clean";

async function load(): Promise<StoreShape> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreShape & { __seedVersion?: string };
    if (parsed.__seedVersion !== SEED_VERSION) {
      throw new Error("stale seed — reseeding");
    }
    cache = parsed;
  } catch {
    cache = { ...structuredClone(SEED), __seedVersion: SEED_VERSION } as StoreShape;
    await persist();
  }
  return cache;
}

async function persist(): Promise<void> {
  if (!cache) return;
  const snapshot = JSON.stringify(cache, null, 2);
  writeQueue = writeQueue.then(() => fs.writeFile(DATA_FILE, snapshot, "utf-8"));
  await writeQueue;
}

type IdentitySource = Request | Headers | { headers: Headers } | string | null | undefined;

/**
 * Reset a single conversation's messages back to the SEED's version. Useful
 * for replaying demo flows without nuking the whole cache.
 */
export async function resetConversation(convId: string): Promise<boolean> {
  const store = await load();
  const seededMessages = SEED.messages[convId];
  if (!seededMessages) return false;
  store.messages[convId] = structuredClone(seededMessages);
  await persist();
  return true;
}

export function getCurrentUserId(source?: IdentitySource): string {
  if (typeof source === "string") return source || DEFAULT_USER_ID;
  if (!source) return DEFAULT_USER_ID;
  const headers: Headers =
    source instanceof Headers
      ? source
      : "headers" in source
        ? source.headers
        : (source as Request).headers;
  return headers.get("X-Opal-User-ID") || DEFAULT_USER_ID;
}

export async function listConversations(
  source?: IdentitySource,
): Promise<ConversationIndexEntry[]> {
  const store = await load();
  const me = getCurrentUserId(source);
  return store.conversations
    .filter((c) => c.participants.some((p) => p.user_id === me))
    .map((c) => {
      const msgs = store.messages[c.id] ?? [];
      const last = msgs[msgs.length - 1];
      const otherIds = c.participants.filter((p) => p.user_id !== me).map((p) => p.user_id);
      const myParticipant = c.participants.find((p) => p.user_id === me);
      const unread = myParticipant
        ? msgs.filter(
            (m) => m.created_at > myParticipant.last_read_at && m.sender_id !== me,
          ).length
        : 0;
      return {
        conversation_id: c.id,
        conversation_type: c.type,
        name: c.name,
        last_message_preview: last?.content_plain ?? "",
        last_message_at: last?.created_at ?? c.created_at,
        last_message_sender_id: last?.sender_id ?? "",
        unread_count: unread,
        other_participant_ids: otherIds,
        archived: c.archived,
      };
    })
    .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const store = await load();
  return store.conversations.find((c) => c.id === id) ?? null;
}

export async function listMessages(convId: string): Promise<IMMessage[]> {
  const store = await load();
  return (store.messages[convId] ?? []).slice();
}

export async function sendMessage(
  convId: string,
  senderId: string,
  content: string,
  replyToId?: string,
  attachments?: Attachment[],
  threadId?: string,
): Promise<IMMessage> {
  const store = await load();
  const msg: IMMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversation_id: convId,
    instance_id: "im-prototype",
    sender_id: senderId,
    sender_type: "user",
    content,
    content_plain: content,
    format: "markdown",
    created_at: new Date().toISOString(),
    deleted: false,
    thread_reply_count: 0,
    thread_participants: [],
    reply_to_id: replyToId,
    thread_id: threadId,
    attachments,
  };
  const msgs = (store.messages[convId] ??= []);
  msgs.push(msg);
  if (threadId) {
    const parent = msgs.find((m) => m.id === threadId);
    if (parent) {
      parent.thread_reply_count = (parent.thread_reply_count ?? 0) + 1;
      const participants = new Set(parent.thread_participants ?? []);
      participants.add(senderId);
      parent.thread_participants = Array.from(participants);
      parent.thread_last_reply_at = msg.created_at;
    }
  }
  const conv = store.conversations.find((c) => c.id === convId);
  if (conv) conv.updated_at = msg.created_at;
  await persist();
  return msg;
}

export async function listThreadMessages(
  convId: string,
  parentMsgId: string,
): Promise<IMMessage[]> {
  const store = await load();
  const msgs = store.messages[convId] ?? [];
  const parent = msgs.find((m) => m.id === parentMsgId);
  if (!parent) return [];
  const replies = msgs.filter((m) => m.thread_id === parentMsgId);
  return [parent, ...replies];
}

export async function editMessage(
  convId: string,
  msgId: string,
  content: string,
): Promise<IMMessage | null> {
  const store = await load();
  const msgs = store.messages[convId] ?? [];
  const m = msgs.find((x) => x.id === msgId);
  if (!m) return null;
  m.content = content;
  m.content_plain = content;
  m.edited_at = new Date().toISOString();
  await persist();
  return m;
}

export async function deleteMessage(convId: string, msgId: string): Promise<boolean> {
  const store = await load();
  const msgs = store.messages[convId] ?? [];
  const m = msgs.find((x) => x.id === msgId);
  if (!m) return false;
  m.deleted = true;
  m.deleted_at = new Date().toISOString();
  m.content = "";
  m.content_plain = "";
  await persist();
  return true;
}

export async function toggleReaction(
  convId: string,
  msgId: string,
  userId: string,
  emoji: string,
): Promise<IMMessage | null> {
  const store = await load();
  const msgs = store.messages[convId] ?? [];
  const m = msgs.find((x) => x.id === msgId);
  if (!m) return null;
  m.reactions ??= {};
  const existing = m.reactions[emoji] ?? [];
  if (existing.includes(userId)) {
    m.reactions[emoji] = existing.filter((id) => id !== userId);
    if (m.reactions[emoji].length === 0) delete m.reactions[emoji];
  } else {
    m.reactions[emoji] = [...existing, userId];
  }
  await persist();
  return m;
}

export async function markRead(convId: string, userId: string): Promise<void> {
  const store = await load();
  const conv = store.conversations.find((c) => c.id === convId);
  const p = conv?.participants.find((x) => x.user_id === userId);
  if (p) {
    p.last_read_at = new Date().toISOString();
    await persist();
  }
}

export async function searchUsers(query?: string): Promise<UserProfile[]> {
  const store = await load();
  if (!query) return store.users;
  const q = query.toLowerCase();
  return store.users.filter(
    (u) => u.display_name.toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q),
  );
}

export async function getUserProfiles(ids: string[]): Promise<Record<string, string>> {
  const store = await load();
  const out: Record<string, string> = {};
  for (const u of store.users) {
    if (ids.includes(u.user_id)) out[u.user_id] = u.display_name;
  }
  return out;
}

export async function createGroup(
  name: string,
  participantIds: string[],
  source?: IdentitySource,
): Promise<Conversation> {
  const store = await load();
  const me = getCurrentUserId(source);
  const allIds = Array.from(new Set([me, ...participantIds]));
  const conv: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    instance_id: "im-prototype",
    type: "group",
    name,
    created_by: me,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived: false,
    participants: allIds.map((id) => participant(id, id === me ? "owner" : "member")),
    member_count: allIds.length,
  };
  store.conversations.push(conv);
  store.messages[conv.id] = [];
  await persist();
  return conv;
}

export async function addParticipant(
  convId: string,
  userId: string,
): Promise<Conversation | null> {
  const store = await load();
  const conv = store.conversations.find((c) => c.id === convId);
  if (!conv) return null;
  if (conv.participants.some((p) => p.user_id === userId)) return conv;
  conv.participants.push(participant(userId, "member"));
  conv.member_count = conv.participants.length;
  conv.updated_at = new Date().toISOString();
  await persist();
  return conv;
}

export async function createChannel(
  name: string,
  type: "private_channel" | "public_channel",
  description?: string,
  source?: IdentitySource,
): Promise<Conversation> {
  const store = await load();
  const me = getCurrentUserId(source);
  const conv: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    instance_id: "im-prototype",
    type,
    name,
    description,
    created_by: me,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived: false,
    participants: [participant(me, "owner")],
    member_count: 1,
  };
  store.conversations.push(conv);
  store.messages[conv.id] = [];
  await persist();
  return conv;
}

export async function joinChannel(
  convId: string,
  source?: IdentitySource,
): Promise<Conversation | null> {
  const store = await load();
  const me = getCurrentUserId(source);
  const conv = store.conversations.find((c) => c.id === convId);
  if (!conv) return null;
  if (conv.type !== "public_channel" && conv.type !== "private_channel") return null;
  if (conv.participants.some((p) => p.user_id === me)) return conv;
  conv.participants.push(participant(me, "member"));
  conv.member_count = conv.participants.length;
  conv.updated_at = new Date().toISOString();
  await persist();
  return conv;
}

export async function leaveConversation(
  convId: string,
  source?: IdentitySource,
): Promise<boolean> {
  const store = await load();
  const me = getCurrentUserId(source);
  const conv = store.conversations.find((c) => c.id === convId);
  if (!conv) return false;
  const before = conv.participants.length;
  conv.participants = conv.participants.filter((p) => p.user_id !== me);
  if (conv.participants.length === before) return false;
  conv.member_count = conv.participants.length;
  conv.updated_at = new Date().toISOString();
  await persist();
  return true;
}

export async function archiveConversation(convId: string): Promise<Conversation | null> {
  const store = await load();
  const conv = store.conversations.find((c) => c.id === convId);
  if (!conv) return null;
  conv.archived = true;
  conv.archived_at = new Date().toISOString();
  conv.updated_at = conv.archived_at;
  await persist();
  return conv;
}

export async function browseChannels(
  query?: string,
  source?: IdentitySource,
): Promise<ChannelDirectoryEntry[]> {
  const store = await load();
  const me = getCurrentUserId(source);
  const q = query?.toLowerCase().trim();
  return store.conversations
    .filter(
      (c) =>
        c.type === "public_channel" &&
        !c.archived &&
        !c.participants.some((p) => p.user_id === me),
    )
    .filter((c) => {
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    })
    .map<ChannelDirectoryEntry>((c) => ({
      conversation_id: c.id,
      instance_id: c.instance_id,
      name: c.name ?? c.id,
      description: c.description,
      topic: c.topic,
      member_count: c.member_count,
      is_default: c.is_default ?? false,
      created_by: c.created_by,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
}

export async function createDM(
  otherUserId: string,
  source?: IdentitySource,
): Promise<Conversation> {
  const store = await load();
  const me = getCurrentUserId(source);
  const existing = store.conversations.find(
    (c) =>
      c.type === "dm" &&
      c.participants.length === 2 &&
      c.participants.some((p) => p.user_id === me) &&
      c.participants.some((p) => p.user_id === otherUserId),
  );
  if (existing) return existing;
  const conv: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    instance_id: "im-prototype",
    type: "dm",
    created_by: me,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived: false,
    participants: [participant(me, "owner"), participant(otherUserId, "member")],
    member_count: 2,
  };
  store.conversations.push(conv);
  store.messages[conv.id] = [];
  await persist();
  return conv;
}
