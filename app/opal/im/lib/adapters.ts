import type { ChatMessage } from "@/app/hooks/useOpalState";
import type { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import type {
  ConversationIndexEntry,
  IMMessage,
} from "./types";
import { getCurrentUserId } from "./currentUser";
import { avatarFor } from "./avatars";
import { getVAU } from "./virtualTeammates";
import { getPresence } from "./presence";

/**
 * Active user ID at module-load time. Prefer `getCurrentUserId()` when you
 * need the live value — this constant stays for backward compatibility with
 * callers that only need a stable initial identity.
 */
export const CURRENT_USER_ID = getCurrentUserId();

function renderAttachments(m: IMMessage): string {
  if (!m.attachments?.length) return "";
  return (
    "\n\n" +
    m.attachments
      .map((a) => {
        const url = a.thumbnail_url ?? "";
        const isImage = a.mime_type?.startsWith("image/");
        if (isImage && url) return `![${a.file_name}](${url})`;
        return `[📎 ${a.file_name}](${url})`;
      })
      .join("\n")
  );
}

export function imToChatMessage(
  m: IMMessage,
  profiles: Record<string, string>,
): ChatMessage {
  const senderName = profiles[m.sender_id] ?? m.sender_id;
  const isOwn = m.sender_id === getCurrentUserId();
  const body = m.deleted ? "_Message deleted_" : m.content;
  const vau = getVAU(m.sender_id);
  return {
    id: m.id,
    role: isOwn ? "user" : "assistant",
    content: body + renderAttachments(m),
    timestamp: Date.parse(m.created_at) || Date.now(),
    metadata: {
      imMode: true,
      authorName: senderName,
      authorAvatar: avatarFor(m.sender_id),
      authorTitle: vau?.template_name,
      authorInlineAvatar: !isOwn,
      isVAU: !!vau,
      presenceStatus: !vau ? getPresence(m.sender_id) : undefined,
    },
  };
}

export function conversationTitle(
  c: ConversationIndexEntry,
  profiles: Record<string, string>,
): string {
  if (c.conversation_type === "public_channel" && c.name) return `# ${c.name}`;
  if (c.conversation_type === "private_channel" && c.name) return `🔒 ${c.name}`;
  if (c.name) return c.name;
  return c.other_participant_ids
    .map((id) => profiles[id] ?? id)
    .join(", ");
}

export function conversationToHistoryItem(
  c: ConversationIndexEntry,
  profiles: Record<string, string>,
): ChatHistoryItem {
  // Channels render with their # / 🔒 prefix in the title — no avatar needed.
  // For DMs, show the other participant's avatar.
  // For groups, stack the first 2-3 participants' avatars.
  const isChannel =
    c.conversation_type === "public_channel" ||
    c.conversation_type === "private_channel";
  const item: ChatHistoryItem = {
    id: c.conversation_id,
    title: conversationTitle(c, profiles),
    date: new Date(c.last_message_at),
    hasRedDot: c.unread_count > 0,
    preview: c.last_message_preview ?? "",
  };
  if (isChannel) {
    item.isChannel = true;
  } else {
    if (c.conversation_type === "dm" && c.other_participant_ids.length === 1) {
      const other = c.other_participant_ids[0];
      const vau = getVAU(other);
      item.avatarUrl = avatarFor(other);
      if (vau) {
        item.isVAU = true;
        item.vauTemplateName = vau.template_name;
      } else {
        item.presenceStatus = getPresence(other);
      }
    } else {
      // group — stack up to 3 other participants
      item.avatarStack = c.other_participant_ids
        .slice(0, 3)
        .map((id) => ({ name: profiles[id] ?? id, url: avatarFor(id) }));
    }
  }
  return item;
}

export function groupConversationsByType(
  conversations: ConversationIndexEntry[],
  profiles: Record<string, string>,
): Record<string, ChatHistoryItem[]> {
  const groups: Record<string, ChatHistoryItem[]> = {
    Channels: [],
    "Direct messages": [],
  };

  for (const c of conversations) {
    if (c.archived) continue;
    const item = conversationToHistoryItem(c, profiles);
    switch (c.conversation_type) {
      case "public_channel":
      case "private_channel":
        groups.Channels.push(item);
        break;
      case "group":
      case "dm":
        groups["Direct messages"].push(item);
        break;
    }
  }

  for (const k of Object.keys(groups)) {
    if (groups[k].length === 0) delete groups[k];
  }
  return groups;
}
