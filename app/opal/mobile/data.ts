export type PresenceStatus = "active" | "away" | "busy";

export type DMItem = {
  id: string;
  name: string;
  avatar: string;
  status?: PresenceStatus;
  unread?: number;
  isVAU?: boolean;
  needsAction?: "approval" | "question" | "review";
};

export type GroupItem = {
  id: string;
  name: string;
  members: string;
  emoji: string;
  unread?: number;
};

export type Reaction = { emoji: string; count: number };

export type Message = {
  id: string;
  from: "user" | "vau" | "human";
  type?: "text" | "attachment";
  senderName?: string;
  senderAvatar?: string;
  senderColor?: string;
  text: string;
  attachment?: { title: string; file: string };
  reactions?: Reaction[];
};

export type Responder = {
  from: "vau" | "human";
  name: string;
  avatar?: string;
  color?: string;
};

export type HITLNotification = {
  id: string;
  type: "approval" | "question" | "review" | "complete";
  category?: "mention" | "reaction" | "new_message" | "new_reply";
  vauName: string;
  vauAvatar: string;
  vauColor: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  artifact?: { title: string; type: string };
  actions?: { label: string; intent?: "danger" }[];
};

export const PRESENCE_COLOR: Record<PresenceStatus, string> = {
  active: "#22c55e",
  away:   "#f59e0b",
  busy:   "#ef4444",
};

export const DMS: DMItem[] = [
  { id: "js",   name: "Jane Smith",           avatar: "https://i.pravatar.cc/150?img=47", status: "active", unread: 2 },
  { id: "bubs", name: "Bubs",                  avatar: "/vau-bubs.svg",                    status: "active", isVAU: true, needsAction: "approval" },
  { id: "kara", name: "Kara",                  avatar: "/vau-kara.svg",                    status: "active", isVAU: true, needsAction: "question" },
  { id: "lg",   name: "Lisa Gray",             avatar: "https://i.pravatar.cc/150?img=9",  status: "active" },
  { id: "eric", name: "Eric",                  avatar: "/vau-eric.svg",                    status: "active", isVAU: true, needsAction: "review"   },
  { id: "hw",   name: "Harry Winston-Brown",   avatar: "https://i.pravatar.cc/150?img=52", status: "busy"   },
  { id: "bw",   name: "Brendan Wilmington",    avatar: "https://i.pravatar.cc/150?img=57", status: "away"   },
  { id: "ms",   name: "Marcus Santos",         avatar: "https://i.pravatar.cc/150?img=68", status: "active" },
  { id: "pr",   name: "Priya Rajan",           avatar: "https://i.pravatar.cc/150?img=44", status: "away",  unread: 3 },
  { id: "td",   name: "Tom Decker",            avatar: "https://i.pravatar.cc/150?img=53", status: "busy"   },
  { id: "ao",   name: "Amara Osei",            avatar: "https://i.pravatar.cc/150?img=38", status: "active" },
];

export const GROUPS: GroupItem[] = [
  { id: "bf", name: "Black Friday Campaign", members: "Jason, Patrick +2", emoji: "🛍️", unread: 5 },
  { id: "vw", name: "VAU Working Group",     members: "8 members",         emoji: "🤖" },
  { id: "cm", name: "Content Marketing Crew", members: "12 members",       emoji: "✍️" },
];

export const THREADS: Record<string, Message[]> = {
  bf: [
    { id: "1", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Hey y'all! I'm working on a new blog post and I wanted to get your thoughts. I had Bubs help with some of the content." },
    { id: "2", from: "vau",   senderName: "Bubs", senderColor: "#2563eb", text: "Sure! I'd be happy to review. Send on over.", reactions: [{ emoji: "👍", count: 2 }, { emoji: "😊", count: 1 }] },
    { id: "3", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Here you go!" },
    { id: "4", from: "user",  type: "attachment", senderAvatar: "https://i.pravatar.cc/150?img=24", text: "", attachment: { title: "Q3 Content Strategy: How AI Is Reshaping Marketing", file: "q3-blog-post.pdf" } },
    { id: "5", from: "vau",   senderName: "Bubs", senderColor: "#2563eb", text: "Love it! Opening it up now — give me a moment to read through.", reactions: [{ emoji: "❤️", count: 3 }, { emoji: "🔥", count: 2 }] },
  ],
  js: [
    { id: "1", from: "human", senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47", text: "Hey! Did you see the latest campaign brief? 👀" },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Just read it — looks great. I had a few notes though." },
    { id: "3", from: "human", senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47", text: "Would love to hear them! Can we jump on a quick call?" },
    { id: "4", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Sure, free at 2pm?" },
    { id: "5", from: "human", senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47", text: "Perfect 🙌 sending an invite now" },
    { id: "6", from: "human", senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47", text: "Also — totally unrelated but have you tried the new Bubs email draft feature? Game changer honestly 🤯" },
    { id: "7", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "YES it's so good. I used it for the last three stakeholder updates lol" },
    { id: "8", from: "human", senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47", text: "Same 😂 see you at 2!" },
  ],
  lg: [
    { id: "1", from: "human", senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9", text: "Hey! I finished the first pass on the new design components 🎉" },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Ooh exciting! Can you drop the Figma link?" },
    { id: "3", from: "human", senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9", text: "Just shared it in the design channel too. I'm pretty happy with how the card variants turned out." },
    { id: "4", from: "human", senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9", text: "One thing I'm still debating — should the hover state use the secondary bg token or a border highlight? 🤔" },
    { id: "5", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Honestly I'd go border highlight — feels more intentional. The bg hover can get muddy with nested components." },
    { id: "6", from: "human", senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9", text: "That's a good point. Switching it now. Also — can we do a 30 min review Thursday?" },
    { id: "7", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Thursday works! Morning or afternoon?" },
    { id: "8", from: "human", senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9", text: "10am? I'll block it ✅" },
  ],
  bubs: [
    { id: "1", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Bubs, can you draft an intro for the Q3 blog post?" },
    { id: "2", from: "vau",   senderName: "Bubs", senderColor: "#2563eb", text: "On it! Here's a draft intro:\n\nAs we head into Q3, our focus shifts to deepening customer engagement and scaling what's working. Here's what's on the horizon." },
    { id: "3", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Love it. Can you make it a bit punchier?" },
    { id: "4", from: "vau",   senderName: "Bubs", senderColor: "#2563eb", text: "Q3 is here. Time to double down on what's working and move faster. Here's the plan." },
    { id: "5", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Perfect 🙌 one more thing — can you suggest 3 headline options?" },
    { id: "6", from: "vau",   senderName: "Bubs", senderColor: "#2563eb", text: "Sure! Here are three options:\n\n1. \"The Q3 Playbook: AI, Speed, and Content That Converts\"\n2. \"How We're Using AI to Outpace the Competition This Quarter\"\n3. \"Q3 Is Here — Here's Our Content Strategy (And Why AI Is Central to It)\"" },
    { id: "7", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "I love #1. Going with that 🎯" },
    { id: "8", from: "vau",   senderName: "Bubs", senderColor: "#2563eb", text: "Great choice — it's punchy and keyword-friendly. Good luck with the post! 🚀" },
  ],
  kara: [
    { id: "1", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Kara, I need an SEO meta description for the new Opal landing page." },
    { id: "2", from: "vau",   senderName: "Kara", senderColor: "#6B5CE7", text: "Happy to! What's the target keyword and ideal character length?" },
    { id: "3", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Target keyword: 'AI content platform' — keep it under 160 chars." },
    { id: "4", from: "vau",   senderName: "Kara", senderColor: "#6B5CE7", text: "Here you go:\n\n\"Opal is the AI content platform built for marketing teams — generate, review, and publish at scale. Start your free trial today.\"\n\n157 characters. Includes the keyword naturally and ends with a CTA." },
    { id: "5", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "That's great. Can you give me 2 variations?" },
    { id: "6", from: "vau",   senderName: "Kara", senderColor: "#6B5CE7", text: "Sure:\n\n1. \"Meet Opal — the AI content platform that turns briefs into polished drafts in seconds. Built for fast-moving marketing teams.\"\n\n2. \"Opal's AI content platform helps marketing teams create, approve, and publish better content, faster. See it in action.\"" },
  ],
  vw: [
    { id: "1", from: "human", senderName: "Patrick Lee", senderAvatar: "https://i.pravatar.cc/150?img=60", text: "VAU Working Group 👋 Kicking off our first async check-in! Quick question for everyone — which VAU are you using most right now?" },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Bubs for content drafting, Kara for SEO review. Honestly using them both daily at this point." },
    { id: "3", from: "human", senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9", text: "Same! Bubs has been a game changer for writing specs. The 'make it punchier' prompt is carrying me 😂", reactions: [{ emoji: "😂", count: 4 }, { emoji: "👍", count: 3 }] },
    { id: "4", from: "human", senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68", text: "Eric for anything data-adjacent. His suggested test variants are shockingly good." },
    { id: "5", from: "human", senderName: "Patrick Lee", senderAvatar: "https://i.pravatar.cc/150?img=60", text: "Great signals! One thing I want to track this quarter — is anyone hitting accuracy issues? Like confidently wrong answers?" },
    { id: "6", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Occasionally with sourced stats. I always double-check numbers Bubs cites before publishing." },
    { id: "7", from: "human", senderName: "Patrick Lee", senderAvatar: "https://i.pravatar.cc/150?img=60", text: "Adding it to the backlog right now! Great thread everyone 🙌", reactions: [{ emoji: "🙌", count: 5 }] },
  ],
  cm: [
    { id: "1", from: "human", senderName: "Sara Chen", senderAvatar: "https://i.pravatar.cc/150?img=20", text: "Content Marketing Crew 📣 Quick reminder — Q3 content calendar is due for final sign-off by Friday!" },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "On it! I've got blog posts and email covered. Just need to confirm the webinar topic." },
    { id: "3", from: "human", senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44", text: "Webinar topic vote: 'AI in Content Marketing' vs 'Personalizing at Scale' — which one? 🗳️" },
    { id: "4", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Agreed — and we can weave personalization in as a subtopic. Best of both worlds 💡" },
    { id: "5", from: "human", senderName: "Sara Chen", senderAvatar: "https://i.pravatar.cc/150?img=20", text: "Love it! Updating the calendar now. Also — Bubs is going to draft the landing page copy 🤖", reactions: [{ emoji: "🔥", count: 6 }, { emoji: "❤️", count: 3 }] },
  ],
  ms: [
    { id: "1", from: "human", senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68", text: "Hey — I pulled the Q2 content performance data. Some really interesting stuff in here 📊" },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Oh nice! What are the highlights?" },
    { id: "3", from: "human", senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68", text: "Long-form blog posts outperformed short ones by 3x on time-on-page. Also, AI-drafted content had higher initial click rates but slightly lower scroll depth." },
    { id: "4", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "That scroll depth finding is really interesting. Maybe the hooks are stronger but the body needs more work?" },
    { id: "5", from: "human", senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68", text: "Exactly what I was thinking. I'll send over the full deck — might be worth looping in Kara." },
  ],
  pr: [
    { id: "1", from: "human", senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44", text: "Hey! Loving the direction on the Q3 blog. One quick ask — can we add a section on personalization?" },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Great idea! I'll slot it in after the AI section. Want me to have Bubs draft it?" },
    { id: "3", from: "human", senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44", text: "Yes please! And can it reference the Optimizely personalization stats from the 2025 report? That data is 🔥" },
    { id: "4", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "On it! Should have a draft to you by EOD." },
    { id: "5", from: "human", senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44", text: "You're amazing, thank you 🙏", reactions: [{ emoji: "🙏", count: 1 }] },
  ],
  hw: [
    { id: "1", from: "human", senderName: "Harry Winston-Brown", senderAvatar: "https://i.pravatar.cc/150?img=52", text: "Quick heads up — IT is pushing a macOS update tonight, might need a restart in the morning." },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Thanks for the heads up! Anything I need to do beforehand?" },
    { id: "3", from: "human", senderName: "Harry Winston-Brown", senderAvatar: "https://i.pravatar.cc/150?img=52", text: "Just save and close everything before you leave. Should be seamless 🤞" },
  ],
  bw: [
    { id: "1", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Hey Brendan! Are you going to the offsite next month?" },
    { id: "2", from: "human", senderName: "Brendan Wilmington", senderAvatar: "https://i.pravatar.cc/150?img=57", text: "100%! Already booked flights. You?" },
    { id: "3", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Yep! Really looking forward to the strategy sessions. Should be a good one." },
  ],
  td: [
    { id: "1", from: "human", senderName: "Tom Decker", senderAvatar: "https://i.pravatar.cc/150?img=53", text: "Hey — got a sec? I'm working on the Opal API integration and hitting a weird edge case with streaming responses." },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Sure! What's the behavior you're seeing?" },
    { id: "3", from: "human", senderName: "Tom Decker", senderAvatar: "https://i.pravatar.cc/150?img=53", text: "If the stream takes longer than ~10s the UI just hangs. No error state, no timeout — just frozen 🧊" },
    { id: "4", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "That sounds like a missing abort controller. Are you setting a timeout on the fetch?" },
    { id: "5", from: "human", senderName: "Tom Decker", senderAvatar: "https://i.pravatar.cc/150?img=53", text: "Fixed! Works perfectly now. You just saved me like 3 hours 😂 thanks!!" },
  ],
  ao: [
    { id: "1", from: "human", senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38", text: "Hey! Just wanted to say — the Opal demo you ran for the exec team last week was SO good ⭐" },
    { id: "2", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "That means a lot, thank you! It was a little nerve-wracking honestly 😅" },
    { id: "3", from: "human", senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38", text: "You couldn't tell at all! Let's find time to brainstorm — I have some ideas I want to run by you 💡" },
  ],
  eric: [
    { id: "1", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Eric, can you suggest A/B test variants for our homepage hero?" },
    { id: "2", from: "vau",   senderName: "Eric", senderColor: "#059669", text: "Absolutely! Here are 3 variants to test:\n\nA (Control): \"The AI Platform Built for Marketing Teams\"\nB: \"Create Better Content, 10x Faster\"\nC: \"Your Marketing Team's AI Teammate\"" },
    { id: "3", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Love B and C. What success metric would you recommend?" },
    { id: "4", from: "vau",   senderName: "Eric", senderColor: "#059669", text: "Primary: trial sign-up CTR. Secondary: scroll depth past the fold — tells you if the headline pulls people in. Run for at least 2 weeks for statistical significance." },
  ],
};

export const RESPONDERS: Record<string, Responder> = {
  js:   { from: "human", name: "Jane Smith",          avatar: "https://i.pravatar.cc/150?img=47" },
  lg:   { from: "human", name: "Lisa Gray",            avatar: "https://i.pravatar.cc/150?img=9"  },
  hw:   { from: "human", name: "Harry Winston-Brown",  avatar: "https://i.pravatar.cc/150?img=52" },
  bw:   { from: "human", name: "Brendan Wilmington",   avatar: "https://i.pravatar.cc/150?img=57" },
  ms:   { from: "human", name: "Marcus Santos",        avatar: "https://i.pravatar.cc/150?img=68" },
  pr:   { from: "human", name: "Priya Rajan",          avatar: "https://i.pravatar.cc/150?img=44" },
  td:   { from: "human", name: "Tom Decker",           avatar: "https://i.pravatar.cc/150?img=53" },
  ao:   { from: "human", name: "Amara Osei",           avatar: "https://i.pravatar.cc/150?img=38" },
  bf:   { from: "human", name: "Jason Park",           avatar: "https://i.pravatar.cc/150?img=33" },
  vw:   { from: "human", name: "Patrick Lee",          avatar: "https://i.pravatar.cc/150?img=60" },
  cm:   { from: "human", name: "Sara Chen",            avatar: "https://i.pravatar.cc/150?img=20" },
  bubs: { from: "vau",   name: "Bubs",                 color: "#2563eb" },
  kara: { from: "vau",   name: "Kara",                 color: "#6B5CE7" },
  eric: { from: "vau",   name: "Eric",                 color: "#059669" },
};

const REPLIES: Record<string, string[]> = {
  js:   ["Totally agree!", "Let me check and get back to you.", "Ooh good point, hadn't thought of that.", "Yes! Let's sync later this week."],
  lg:   ["Makes sense to me.", "Happy to help with that.", "Can you send me the doc?", "On it!"],
  hw:   ["Noted, I'll follow up.", "Sounds good — let me loop in the team.", "Good catch, thanks for flagging.", "Will do!"],
  bw:   ["I'm in!", "Let me check my calendar.", "That works for me.", "Thanks for the heads up."],
  ms:   ["Great idea!", "I was just thinking the same thing.", "Let me pull the numbers on that.", "100% aligned."],
  pr:   ["Love this direction.", "Can we get Bubs to draft something?", "I'll review by EOD.", "Adding this to the board now."],
  td:   ["On my radar.", "Will circle back after standup.", "Good to know, thanks."],
  ao:   ["Absolutely!", "This is really exciting.", "Let's make it happen."],
  bf:   ["Good update — keeping the thread going.", "We're on track for launch.", "Let's review together Thursday."],
  vw:   ["Tagging Eric on this too.", "Great thread everyone.", "Agreed — should we update the doc?"],
  cm:   ["Sara is already on it!", "Content calendar is updated.", "This fits perfectly with Q3 goals."],
  bubs: [
    "On it! Give me a moment to think through that.",
    "Great question. Here's how I'd approach it: start with the outcome you want, then work backwards.",
    "Sure! I can help with that. Want me to draft something for you to react to?",
    "Done! Let me know if you'd like me to take it in a different direction.",
  ],
  kara: [
    "Happy to help with content! What's the target audience?",
    "I'd suggest leading with a strong hook — something that surprises or challenges the reader.",
    "On it! I'll have a first draft ready in a few seconds.",
    "Love that direction. Shall I optimize it for SEO too?",
  ],
  eric: [
    "Let's run an experiment on that! I'd suggest an A/B test with two variants.",
    "Based on your past experiments, this hypothesis is worth testing.",
    "Interesting hypothesis. What's your success metric?",
    "I can set that experiment up for you. What's your target lift?",
  ],
};

export function getReply(id: string): string {
  const pool = REPLIES[id] ?? ["Got it!", "Sure thing.", "Thanks for the update!"];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getMockTime(index: number): string {
  const base = 9 * 60 + 30;
  const total = base + index * 4;
  const h = Math.floor(total / 60) % 12 || 12;
  const m = total % 60;
  const ap = Math.floor(total / 60) < 12 ? "AM" : "PM";
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}

export function getConversationName(id: string): string {
  return DMS.find((d) => d.id === id)?.name ?? GROUPS.find((g) => g.id === id)?.name ?? "";
}

export function getDM(id: string): DMItem | undefined {
  return DMS.find((d) => d.id === id);
}

export function getGroup(id: string): GroupItem | undefined {
  return GROUPS.find((g) => g.id === id);
}

export function getUnreadQueue(): string[] {
  const unreadDMs = DMS.filter(d => (d.unread ?? 0) > 0).map(d => d.id);
  const unreadGroups = GROUPS.filter(g => (g.unread ?? 0) > 0).map(g => g.id);
  return [...unreadDMs, ...unreadGroups];
}

export function getLastReadIndex(id: string): number {
  const thread = THREADS[id] ?? [];
  const unread = DMS.find(d => d.id === id)?.unread ?? GROUPS.find(g => g.id === id)?.unread ?? 0;
  return Math.max(0, thread.length - unread);
}

export const QUICK_EMOJIS = ["👍", "❤️", "😂", "🔥", "🚀", "👏"];

export type Artifact = {
  id: string;
  title: string;
  type: string;
  author: string;
  authorColor?: string;
  isVAU?: boolean;
  thumbnail?: string;
  updatedAt: string;
  status: "draft" | "review" | "approved" | "published";
};

export const ARTIFACTS: Artifact[] = [
  { id: "a1",  title: "Q3 Content Strategy: How AI Is Reshaping Marketing", type: "Blog Post",     author: "Bubs",  authorColor: "#2563eb", isVAU: true,  updatedAt: "2 min ago",   status: "review",    thumbnail: "https://picsum.photos/seed/opal-a1/200/150" },
  { id: "a2",  title: "Black Friday Campaign Email Series",                  type: "Email Draft",  author: "Bubs",  authorColor: "#2563eb", isVAU: true,  updatedAt: "1 hr ago",    status: "draft",     thumbnail: "https://picsum.photos/seed/opal-a2/200/150" },
  { id: "a3",  title: "LinkedIn Thought Leadership Series — November",       type: "Social Copy",  author: "Bubs",  authorColor: "#2563eb", isVAU: true,  updatedAt: "3 hr ago",    status: "approved",  thumbnail: "https://picsum.photos/seed/opal-a3/200/150" },
  { id: "a4",  title: "2026 Brand Voice Guidelines Update",                  type: "Content Brief", author: "Kara", authorColor: "#6B5CE7", isVAU: true,  updatedAt: "Yesterday",   status: "draft",     thumbnail: "https://picsum.photos/seed/opal-a4/200/150" },
  { id: "a5",  title: "Top 10 AI Marketing Tools for Enterprise Teams",      type: "SEO Article",  author: "Kara",  authorColor: "#6B5CE7", isVAU: true,  updatedAt: "Yesterday",   status: "review",    thumbnail: "https://picsum.photos/seed/opal-a5/200/150" },
  { id: "a6",  title: "Optimizely Product Launch Email Sequence",            type: "Email Draft",  author: "Kara",  authorColor: "#6B5CE7", isVAU: true,  updatedAt: "2 days ago",  status: "published", thumbnail: "https://picsum.photos/seed/opal-a6/200/150" },
  { id: "a7",  title: "Homepage CTA Multivariate Test",                      type: "A/B Test",     author: "Eric",  authorColor: "#059669", isVAU: true,  updatedAt: "1 hr ago",    status: "review",    thumbnail: "https://picsum.photos/seed/opal-a7/200/150" },
  { id: "a8",  title: "Pricing Page Copy Variants (3 versions)",             type: "Test Variants", author: "Eric", authorColor: "#059669", isVAU: true,  updatedAt: "3 days ago",  status: "approved",  thumbnail: "https://picsum.photos/seed/opal-a8/200/150" },
  { id: "a9",  title: "Homepage Redesign Mockups v3",                        type: "Design File",  author: "Jane Smith",                    isVAU: false, updatedAt: "2 days ago",  status: "review",    thumbnail: "https://picsum.photos/seed/opal-a9/200/150" },
  { id: "a10", title: "Q4 Editorial Calendar",                               type: "Document",     author: "Lisa Gray",                     isVAU: false, updatedAt: "3 days ago",  status: "approved",  thumbnail: "https://picsum.photos/seed/opal-a10/200/150" },
  { id: "a11", title: "User Research Synthesis — Onboarding",                type: "Report",       author: "Priya Rajan",                   isVAU: false, updatedAt: "4 days ago",  status: "published", thumbnail: "https://picsum.photos/seed/opal-a11/200/150" },
  { id: "a12", title: "Platform Architecture Spec v2",                       type: "Technical Doc", author: "Harry Winston-Brown",           isVAU: false, updatedAt: "1 week ago",  status: "published", thumbnail: "https://picsum.photos/seed/opal-a12/200/150" },
];

export const ARTIFACT_TYPES = ["All", "Blog Post", "Email Draft", "Social Copy", "A/B Test", "Document", "Report", "Design File"];

export const STATUS_LABEL: Record<Artifact["status"], string> = {
  draft:     "Draft",
  review:    "Needs review",
  approved:  "Approved",
  published: "Published",
};

export const STATUS_INTENT: Record<Artifact["status"], string> = {
  draft:     "neutral",
  review:    "warning",
  approved:  "success",
  published: "information",
};

export const HITL_NOTIFICATIONS: HITLNotification[] = [
  // Approval — needs sign-off, has buttons
  {
    id: "h1",
    type: "approval",
    vauName: "Bubs",
    vauAvatar: "/vau-bubs.svg",
    vauColor: "#2563eb",
    title: "Ready to publish — needs your sign-off",
    description: "I've finished the Q3 blog post draft. It's 1,240 words, SEO-optimized, and includes the personalization section Priya requested.",
    timestamp: "2 min ago",
    read: false,
    artifact: { title: "Q3 Content Strategy: How AI Is Reshaping Marketing", type: "Blog Post" },
    actions: [{ label: "Approve & publish" }, { label: "Request changes" }],
  },
  // Question — needs input, has buttons
  {
    id: "h2",
    type: "question",
    vauName: "Kara",
    vauAvatar: "/vau-kara.svg",
    vauColor: "#6B5CE7",
    title: "Direction needed before I proceed",
    description: "Should the new brand voice apply to social copy only, or all channels including email and long-form? This affects about 40 templates.",
    timestamp: "14 min ago",
    read: false,
    actions: undefined,
  },
  // Complete — no action needed, no buttons
  {
    id: "h3",
    type: "complete",
    vauName: "Bubs",
    vauAvatar: "/vau-bubs.svg",
    vauColor: "#2563eb",
    title: "LinkedIn series — all 5 posts drafted",
    description: "Your November thought leadership series is ready. Posts are scheduled for Mon/Wed/Fri cadence and optimized for peak engagement windows.",
    timestamp: "1 hr ago",
    read: false,
    artifact: { title: "LinkedIn Thought Leadership Series — November", type: "Social Copy" },
    actions: undefined,
  },
  // Review — results ready, has buttons
  {
    id: "h4",
    type: "review",
    vauName: "Eric",
    vauAvatar: "/vau-eric.svg",
    vauColor: "#059669",
    title: "Test results ready for your review",
    description: "The homepage hero A/B test hit significance at 94% confidence. Variant B is outperforming control by 23% on trial sign-ups.",
    timestamp: "3 hr ago",
    read: true,
    artifact: { title: "Homepage CTA Multivariate Test — Results", type: "Test Report" },
    actions: undefined,
  },
  // Complete — workflow finished, no buttons
  {
    id: "h5",
    type: "complete",
    vauName: "Kara",
    vauAvatar: "/vau-kara.svg",
    vauColor: "#6B5CE7",
    title: "SEO audit complete — 12 pages optimized",
    description: "Kara finished updating meta descriptions and title tags across the top-traffic pages. No action needed.",
    timestamp: "4 hr ago",
    read: true,
    actions: undefined,
  },
  // Question — missing source, has buttons
  {
    id: "h6",
    type: "question",
    vauName: "Kara",
    vauAvatar: "/vau-kara.svg",
    vauColor: "#6B5CE7",
    title: "Missing source — can you help?",
    description: "The SEO article references a 2025 Gartner report on content ROI, but I can't locate the original document in Context.",
    timestamp: "Yesterday",
    read: true,
    actions: undefined,
  },
  // Approval — Black Friday campaign, no buttons (already actioned)
  {
    id: "h7",
    type: "approval",
    vauName: "Bubs",
    vauAvatar: "/vau-bubs.svg",
    vauColor: "#2563eb",
    title: "Black Friday email sequence — approved",
    description: "You approved the 4-email sequence on Jul 24. Scheduled to send starting Nov 25.",
    timestamp: "2 days ago",
    read: true,
    artifact: { title: "Black Friday Email Series", type: "Email Draft" },
    actions: undefined,
  },
  // New message — from Priya
  {
    id: "h8",
    type: "complete",
    category: "new_message",
    vauName: "Priya Rajan",
    vauAvatar: "https://i.pravatar.cc/150?img=44",
    vauColor: "#6B5CE7",
    title: "New message from Priya Rajan",
    description: "Can you share the brand voice doc before Friday? The agency needs it for the brief.",
    timestamp: "32 min ago",
    read: false,
    actions: undefined,
  },
  // New reply — Marcus in group
  {
    id: "h9",
    type: "complete",
    category: "new_reply",
    vauName: "Marcus Santos",
    vauAvatar: "https://i.pravatar.cc/150?img=68",
    vauColor: "#059669",
    title: "Marcus replied in Black Friday Campaign",
    description: "\"Let's align on the final copy before launch — are we still shipping Thursday?\"",
    timestamp: "1 hr ago",
    read: false,
    actions: undefined,
  },
  // Reaction — Jane
  {
    id: "h10",
    type: "complete",
    category: "reaction",
    vauName: "Jane Smith",
    vauAvatar: "https://i.pravatar.cc/150?img=47",
    vauColor: "#f59e0b",
    title: "Jane reacted 👍 to your message",
    description: "\"The new content calendar looks great — shipping Friday\" in Campaign Planning.",
    timestamp: "2 hr ago",
    read: true,
    actions: undefined,
  },
  // Mention — Tom
  {
    id: "h11",
    type: "complete",
    category: "mention",
    vauName: "Tom Decker",
    vauAvatar: "https://i.pravatar.cc/150?img=53",
    vauColor: "#2563eb",
    title: "@Pei — quick question on the Q4 roadmap",
    description: "Tom mentioned you in VAU Working Group. He wants your input on prioritisation before the planning session.",
    timestamp: "3 hr ago",
    read: true,
    actions: undefined,
  },
];
