// Cross-tab event broadcasting for the IM prototype.
// Uses the BroadcastChannel API so multiple browser tabs/windows on the same
// origin can sync without polling or a server.

const CHANNEL_NAME = "opal-im";

export type IMBroadcastEvent =
  | { type: "message-sent"; conversationId: string; senderId: string }
  | { type: "message-edited"; conversationId: string; messageId: string }
  | { type: "reaction-toggled"; conversationId: string; messageId: string }
  | { type: "conversation-created"; conversationId: string }
  | { type: "conversation-updated"; conversationId: string };

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function broadcastIMEvent(event: IMBroadcastEvent) {
  const ch = getChannel();
  if (!ch) return;
  try {
    ch.postMessage(event);
  } catch {
    // ignore
  }
}

export function subscribeToIMEvents(
  listener: (event: IMBroadcastEvent) => void,
): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const handler = (e: MessageEvent<IMBroadcastEvent>) => listener(e.data);
  ch.addEventListener("message", handler);
  return () => ch.removeEventListener("message", handler);
}
