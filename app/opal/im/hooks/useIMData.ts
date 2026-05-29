"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addReaction,
  getConversation,
  listConversations,
  listMessages,
  markRead,
  sendMessage,
  uploadAttachment,
} from "../lib/service";
import type { Attachment } from "../lib/types";
import { getCurrentUserId, subscribeToCurrentUser } from "../lib/currentUser";
import { broadcastIMEvent, subscribeToIMEvents } from "../lib/broadcast";
import { maybeReplyAsTeammate } from "../lib/virtualTeammates";
import type {
  ConversationIndexEntry,
  IMMessage,
} from "../lib/types";

// Slow polling as a safety net — BroadcastChannel handles same-origin tabs
// instantly, so we just need to catch any missed events (e.g. browser sleep).
const POLL_INTERVAL_MS = 10000;

export type UseIMData = {
  conversations: ConversationIndexEntry[];
  profiles: Record<string, string>;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  messages: IMMessage[];
  messageReactions: Record<string, Record<string, string[]>>;
  selectedParticipantIds: string[];
  selectedIsGroup: boolean;
  sendCurrent: (content: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  refreshSelected: () => Promise<void>;
  refreshCurrentMessages: () => Promise<void>;
  inputValue: string;
  setInputValue: (value: string) => void;
  insertMention: (handle: string) => void;
  attachFile: (file: File) => Promise<void>;
  currentUserId: string;
  isLoading: boolean;
};

export function useIMData(): UseIMData {
  const [conversations, setConversations] = useState<ConversationIndexEntry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMMessage[]>([]);
  const [selectedConv, setSelectedConv] = useState<Awaited<ReturnType<typeof getConversation>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValueState] = useState("");
  const [currentUserId, setCurrentUserIdState] = useState<string>(() =>
    getCurrentUserId(),
  );
  const selectedIdRef = useRef<string | null>(null);

  // Keep currentUserId in sync with localStorage changes (e.g. another tab).
  useEffect(() => subscribeToCurrentUser((id) => setCurrentUserIdState(id)), []);

  const refreshConversations = useCallback(async () => {
    const resp = await listConversations();
    setConversations(resp.conversations);
    setProfiles((prev) => ({ ...prev, ...(resp.user_profiles ?? {}) }));
    return resp.conversations;
  }, []);

  const refreshMessages = useCallback(async (convId: string) => {
    const resp = await listMessages(convId);
    // Thread replies are surfaced inside the ThreadPanel; the main feed only
    // shows root messages (those without a thread_id).
    const rootMessages = resp.messages.filter((m) => !m.thread_id);
    setMessages(rootMessages);
    setProfiles((prev) => ({ ...prev, ...(resp.user_profiles ?? {}) }));
  }, []);

  // Initial load — pick first conversation (or a sessionStorage hint set by
  // the "Reset demo" button so a refresh can deep-link to a specific chat).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const convs = await refreshConversations();
      if (cancelled) return;
      if (convs.length > 0 && !selectedIdRef.current) {
        let initial = convs[0].conversation_id;
        try {
          const hint = sessionStorage.getItem("im-initial-chat");
          if (hint && convs.some((c) => c.conversation_id === hint)) {
            initial = hint;
          }
          sessionStorage.removeItem("im-initial-chat");
        } catch {
          // ignore storage errors
        }
        setSelectedIdState(initial);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshConversations]);

  // On selection change: load messages + conv details + mark read
  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (!selectedId) return;
    void refreshMessages(selectedId);
    void getConversation(selectedId).then(setSelectedConv);
    void markRead(selectedId).then(() => refreshConversations());
  }, [selectedId, refreshMessages, refreshConversations]);

  const refreshSelected = useCallback(async () => {
    const id = selectedIdRef.current;
    if (!id) return;
    const conv = await getConversation(id);
    setSelectedConv(conv);
    await refreshConversations();
  }, [refreshConversations]);

  const refreshCurrentMessages = useCallback(async () => {
    const id = selectedIdRef.current;
    if (id) await refreshMessages(id);
  }, [refreshMessages]);

  // Polling (slow safety net)
  useEffect(() => {
    const interval = setInterval(() => {
      void refreshConversations();
      const current = selectedIdRef.current;
      if (current) void refreshMessages(current);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshConversations, refreshMessages]);

  // Realtime cross-tab sync via BroadcastChannel
  useEffect(
    () =>
      subscribeToIMEvents((event) => {
        if (event.type === "conversation-created" || event.type === "conversation-updated") {
          void refreshConversations();
          return;
        }
        const current = selectedIdRef.current;
        void refreshConversations();
        if (current && event.conversationId === current) {
          void refreshMessages(current);
        }
      }),
    [refreshConversations, refreshMessages],
  );

  const setSelectedId = useCallback((id: string) => {
    setSelectedIdState(id);
  }, []);

  const sendCurrent = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      const convId = selectedIdRef.current;
      if (!trimmed || !convId) return;
      const sent = await sendMessage(convId, trimmed);
      await refreshMessages(convId);
      await refreshConversations();
      broadcastIMEvent({
        type: "message-sent",
        conversationId: convId,
        senderId: sent.sender_id,
      });
      // Fire-and-forget VAU reply. The sending tab "owns" the bot trigger to
      // avoid duplicate replies across tabs.
      void (async () => {
        const conv = await getConversation(convId);
        if (!conv) return;
        const replyId = await maybeReplyAsTeammate(conv, sent);
        if (!replyId) return;
        await refreshMessages(convId);
        await refreshConversations();
        broadcastIMEvent({
          type: "message-sent",
          conversationId: convId,
          senderId: "vau",
        });
      })();
    },
    [refreshMessages, refreshConversations],
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const convId = selectedIdRef.current;
      if (!convId) return;
      const me = getCurrentUserId();
      // Optimistic toggle
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const next: Record<string, string[]> = { ...(m.reactions ?? {}) };
          const existing = next[emoji] ?? [];
          if (existing.includes(me)) {
            next[emoji] = existing.filter((id) => id !== me);
            if (next[emoji].length === 0) delete next[emoji];
          } else {
            next[emoji] = [...existing, me];
          }
          return { ...m, reactions: next };
        }),
      );
      await addReaction(convId, messageId, emoji);
      await refreshMessages(convId);
      broadcastIMEvent({
        type: "reaction-toggled",
        conversationId: convId,
        messageId,
      });
    },
    [refreshMessages],
  );

  const setInputValue = useCallback((next: string) => setInputValueState(next), []);

  const insertMention = useCallback((handle: string) => {
    setInputValueState((prev) => {
      const trimmed = prev.replace(/@\S*$/, "").trimEnd();
      const prefix = trimmed ? `${trimmed} ` : "";
      return `${prefix}@${handle} `;
    });
  }, []);

  const attachFile = useCallback(
    async (file: File) => {
      const convId = selectedIdRef.current;
      if (!convId) return;
      const attachment: Attachment = await uploadAttachment(file);
      // Send a message with the attachment + whatever caption is in the input
      let caption = "";
      setInputValueState((prev) => {
        caption = prev;
        return "";
      });
      await sendMessage(convId, caption || "", undefined, [attachment]);
      await refreshMessages(convId);
      await refreshConversations();
    },
    [refreshMessages, refreshConversations],
  );

  const messageReactions = useMemoReactions(messages);
  const selectedParticipantIds = selectedConv?.participants.map((p) => p.user_id) ?? [];
  const selectedIsGroup =
    !!selectedConv && (selectedConv.type === "group" || selectedConv.type === "private_channel" || selectedConv.type === "public_channel");

  return {
    conversations,
    profiles,
    selectedId,
    setSelectedId,
    messages,
    messageReactions,
    selectedParticipantIds,
    selectedIsGroup,
    sendCurrent,
    toggleReaction,
    refreshSelected,
    refreshCurrentMessages,
    inputValue,
    setInputValue,
    insertMention,
    attachFile,
    currentUserId,
    isLoading,
  };
}

function useMemoReactions(messages: IMMessage[]) {
  const map: Record<string, Record<string, string[]>> = {};
  for (const m of messages) {
    if (m.reactions && Object.keys(m.reactions).length > 0) {
      map[m.id] = m.reactions;
    }
  }
  return map;
}
