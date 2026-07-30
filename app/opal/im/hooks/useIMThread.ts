<<<<<<< HEAD
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getConversation, listThread, sendThreadReply } from "../lib/service";
import type { IMMessage } from "../lib/types";
import { broadcastIMEvent, subscribeToIMEvents } from "../lib/broadcast";
import { maybeReplyAsTeammate } from "../lib/virtualTeammates";

export type UseIMThread = {
  parentMessageId: string | null;
  parent: IMMessage | null;
  replies: IMMessage[];
  profiles: Record<string, string>;
  isOpen: boolean;
  open: (conversationId: string, parentMessageId: string) => void;
  close: () => void;
  sendReply: (content: string) => Promise<void>;
};

export function useIMThread(): UseIMThread {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [parentMessageId, setParentMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const parentRef = useRef<string | null>(null);
  const convRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const conv = convRef.current;
    const pid = parentRef.current;
    if (!conv || !pid) return;
    const resp = await listThread(conv, pid);
    setMessages(resp.messages);
    setProfiles((prev) => ({ ...prev, ...(resp.user_profiles ?? {}) }));
  }, []);

  const open = useCallback((conv: string, pid: string) => {
    convRef.current = conv;
    parentRef.current = pid;
    setConversationId(conv);
    setParentMessageId(pid);
    setMessages([]);
    void refresh();
  }, [refresh]);

  const close = useCallback(() => {
    convRef.current = null;
    parentRef.current = null;
    setConversationId(null);
    setParentMessageId(null);
    setMessages([]);
  }, []);

  const sendReply = useCallback(async (content: string) => {
    const conv = convRef.current;
    const pid = parentRef.current;
    if (!conv || !pid || !content.trim()) return;
    const sent = await sendThreadReply(conv, pid, content.trim());
    await refresh();
    broadcastIMEvent({
      type: "message-sent",
      conversationId: conv,
      senderId: sent.sender_id,
    });
    // Fire-and-forget VAU reply inside the thread. Sending tab owns the trigger
    // to avoid duplicate replies across tabs.
    void (async () => {
      const c = await getConversation(conv);
      if (!c) return;
      const replyId = await maybeReplyAsTeammate(c, sent);
      if (!replyId) return;
      await refresh();
      broadcastIMEvent({
        type: "message-sent",
        conversationId: conv,
        senderId: "vau",
      });
    })();
  }, [refresh]);

  // Listen for broadcast events from other tabs / VAU replies
  useEffect(() => {
    return subscribeToIMEvents((event) => {
      if (event.type !== "message-sent") return;
      if (event.conversationId !== convRef.current) return;
      void refresh();
    });
  }, [refresh]);

  const parent = parentMessageId
    ? messages.find((m) => m.id === parentMessageId) ?? null
    : null;
  const replies = parentMessageId
    ? messages.filter((m) => m.id !== parentMessageId)
    : [];

  return {
    parentMessageId,
    parent,
    replies,
    profiles,
    isOpen: !!parentMessageId && !!conversationId,
    open,
    close,
    sendReply,
  };
}
=======
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getConversation, listThread, sendThreadReply } from "../lib/service";
import type { IMMessage } from "../lib/types";
import { broadcastIMEvent, subscribeToIMEvents } from "../lib/broadcast";
import { maybeReplyAsTeammate } from "../lib/virtualTeammates";

export type UseIMThread = {
  parentMessageId: string | null;
  parent: IMMessage | null;
  replies: IMMessage[];
  profiles: Record<string, string>;
  isOpen: boolean;
  open: (conversationId: string, parentMessageId: string) => void;
  close: () => void;
  sendReply: (content: string) => Promise<void>;
};

export function useIMThread(): UseIMThread {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [parentMessageId, setParentMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const parentRef = useRef<string | null>(null);
  const convRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const conv = convRef.current;
    const pid = parentRef.current;
    if (!conv || !pid) return;
    const resp = await listThread(conv, pid);
    setMessages(resp.messages);
    setProfiles((prev) => ({ ...prev, ...(resp.user_profiles ?? {}) }));
  }, []);

  const open = useCallback((conv: string, pid: string) => {
    convRef.current = conv;
    parentRef.current = pid;
    setConversationId(conv);
    setParentMessageId(pid);
    setMessages([]);
    void refresh();
  }, [refresh]);

  const close = useCallback(() => {
    convRef.current = null;
    parentRef.current = null;
    setConversationId(null);
    setParentMessageId(null);
    setMessages([]);
  }, []);

  const sendReply = useCallback(async (content: string) => {
    const conv = convRef.current;
    const pid = parentRef.current;
    if (!conv || !pid || !content.trim()) return;
    const sent = await sendThreadReply(conv, pid, content.trim());
    await refresh();
    broadcastIMEvent({
      type: "message-sent",
      conversationId: conv,
      senderId: sent.sender_id,
    });
    // Fire-and-forget VAU reply inside the thread. Sending tab owns the trigger
    // to avoid duplicate replies across tabs.
    void (async () => {
      const c = await getConversation(conv);
      if (!c) return;
      const replyId = await maybeReplyAsTeammate(c, sent);
      if (!replyId) return;
      await refresh();
      broadcastIMEvent({
        type: "message-sent",
        conversationId: conv,
        senderId: "vau",
      });
    })();
  }, [refresh]);

  // Listen for broadcast events from other tabs / VAU replies
  useEffect(() => {
    return subscribeToIMEvents((event) => {
      if (event.type !== "message-sent") return;
      if (event.conversationId !== convRef.current) return;
      void refresh();
    });
  }, [refresh]);

  const parent = parentMessageId
    ? messages.find((m) => m.id === parentMessageId) ?? null
    : null;
  const replies = parentMessageId
    ? messages.filter((m) => m.id !== parentMessageId)
    : [];

  return {
    parentMessageId,
    parent,
    replies,
    profiles,
    isOpen: !!parentMessageId && !!conversationId,
    open,
    close,
    sendReply,
  };
}
>>>>>>> origin/main
