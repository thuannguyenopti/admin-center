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
// seed v2  -  Jamie as DM participant for proactive VAU demos

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
    { user_id: "pei", display_name: "Emily Park", email: "emily.park@optimizely.com", status: "online" },
    { user_id: "frank", display_name: "Frank Lin", email: "frank@optimizely.com", status: "away" },
    { user_id: "jamie", display_name: "Jamie Chen", email: "jamie@optimizely.com", status: "online" },
    { user_id: "mary-anne", display_name: "Mary Anne Torres", email: "maryanne@optimizely.com", status: "offline" },
    { user_id: "opal-bot", display_name: "Opal", email: "opal@optimizely.com", status: "online" },
    ...VAU_USERS,
  ],
  conversations: [
    {
      id: "conv-mary-anne",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "pei",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
      archived: false,
      participants: [
        participant("pei", "owner"),
        participant("mary-anne", "member"),
      ],
      member_count: 2,
    },
    {
      id: "conv-jamie",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "pei",
      created_at: new Date(Date.now() - 10800000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      archived: false,
      participants: [
        participant("pei", "owner"),
        participant("jamie", "member"),
      ],
      member_count: 2,
    },
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
      description: "Go-to-market sync  -  launches, positioning, sales enablement.",
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
      id: "conv-vau-chief-of-staff",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "vau-chief-of-staff",
      created_at: new Date(Date.now() - 60000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        unreadParticipant("jamie", "owner"),
        participant("vau-chief-of-staff", "member"),
      ],
      member_count: 2,
    },
    {
      id: "conv-vau-cos-empathetic",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "vau-chief-of-staff",
      created_at: new Date(Date.now() - 60000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: true,
      participants: [
        unreadParticipant("jamie", "owner"),
        participant("vau-chief-of-staff", "member"),
      ],
      member_count: 2,
    },
    {
      id: "conv-vau-cos-analytic",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "vau-chief-of-staff",
      created_at: new Date(Date.now() - 60000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: true,
      participants: [
        unreadParticipant("jamie", "owner"),
        participant("vau-chief-of-staff", "member"),
      ],
      member_count: 2,
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
        participant("jamie", "owner"),
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
    {
      id: "conv-vau-frank",
      instance_id: "im-prototype",
      type: "dm",
      created_by: "vau-frank",
      created_at: new Date(Date.now() - 1200000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        unreadParticipant("jamie", "owner"),
        participant("vau-frank", "member"),
      ],
      member_count: 2,
    },
    {
      id: "demo-geo-qa",
      instance_id: "im-prototype",
      type: "group",
      name: "Stride GEO  -  Q&A review",
      created_by: "vau-frank",
      created_at: new Date(Date.now() - 1200000).toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,
      participants: [
        unreadParticipant("jamie", "owner"),
        participant("vau-frank", "member"),
        participant("mary-anne", "member"),
      ],
      member_count: 3,
    },
  ],
  messages: {
    "conv-mary-anne": [
      message("msg-ma1", "conv-mary-anne", "mary-anne", "Hey Emily  -  did you get a chance to look at the Q3 planning doc I dropped in the wiki?"),
      message("msg-ma2", "conv-mary-anne", "pei", "Just skimmed it! Some great ideas in there. Can we sync Thursday to walk through the prioritization?"),
      message("msg-ma3", "conv-mary-anne", "mary-anne", "Thursday works, I'll send a calendar invite. Also, heads up the spring campaign creative is going to legal today."),
    ],
    "conv-jamie": [
      message("msg-j1", "conv-jamie", "jamie", "The new VAU card sort is looking solid. Nice work on that."),
      message("msg-j2", "conv-jamie", "pei", "Thanks! Still tweaking the avatar stack on group convos. Should be done by EOD."),
      message("msg-j3", "conv-jamie", "jamie", "No rush  -  also reminder: GTM sync Tuesday 10am, competitive section is on the agenda."),
    ],
    "conv-frank": [
      message("msg-1", "conv-frank", "frank", "Hey  -  I'm reviewing the share dialog PR now, looking good!"),
      message("msg-2", "conv-frank", "pei", "Thanks! Let me know if anything looks off."),
    ],
    "conv-design-crew": [
      message("msg-3", "conv-design-crew", "jamie", "Pushed the new VAU card sort to main 🎉"),
      message("msg-4", "conv-design-crew", "mary-anne", "Looks great! I'll start on the detail page polish."),
      message("msg-5", "conv-design-crew", "pei", "Awesome. Let's sync tomorrow on the IM redesign."),
    ],
    "conv-general": [
      message("msg-g1", "conv-general", "frank", "Welcome to #general  -  say hi here."),
      message("msg-g2", "conv-general", "mary-anne", "Coffee chat Friday 3pm anyone?"),
    ],
    "conv-design-leadership": [
      message("msg-dl1", "conv-design-leadership", "mary-anne", "Q3 planning doc draft is in the wiki."),
    ],
    "conv-campaigns": [
      message("msg-c1", "conv-campaigns", "mary-anne", "Spring sale campaign is locked in for next week  -  final creative going to legal today."),
      message("msg-c2", "conv-campaigns", "frank", "Heads up: the headline test on the pricing page is wrapping Friday, results Monday."),
    ],
    "conv-content": [
      message("msg-cn1", "conv-content", "frank", "Q3 content calendar draft is in the wiki  -  please review your assigned briefs by EOD."),
    ],
    "conv-gtm": [
      message("msg-gtm1", "conv-gtm", "jamie", "Reminder: GTM sync next Tuesday 10am  -  competitive section is on the agenda."),
    ],
    "conv-launch-room": [
      message("msg-lr1", "conv-launch-room", "pei", "@Henry @Poppy  -  let's spin up the spring launch room. What's the rough timeline looking like?"),
      message("msg-lr2", "conv-launch-room", "vau-poppy", "Tracking. Rough plan: kickoff Mon, dependency map by Wed, exec preview Fri. Want me to draft a launch timeline?"),
      message("msg-lr3", "conv-launch-room", "vau-henry", "On positioning  -  I can have a first-pass narrative ready before kickoff if that helps anchor the brief."),
    ],
    "conv-vau-chief-of-staff": [
      timedMessage("msg-cos-1", "conv-vau-chief-of-staff", "vau-chief-of-staff", `👋 I'm your Chief of Staff  -  I keep priorities sharp, blockers surfaced, and leadership aligned so nothing slips.

Try asking:
- **What's my day look like?**
- **What needs my attention?**
- **What's my top priority?**

Preparing your daily brief now.`, 2),
    ],
    "conv-vau-cos-empathetic": [
      timedMessage("msg-cose-1", "conv-vau-cos-empathetic", "vau-chief-of-staff", `👋 Hi! I'm your Chief of Staff  -  I'm here to make sure you and your team stay connected, informed, and nothing falls through the cracks.

A few things you might want to ask:
- **How does my day look?**
- **What needs my attention?**
- **How's the team doing?**
- **Catch me up**

Already working on your daily brief.`, 2),
    ],
    "conv-vau-cos-analytic": [
      timedMessage("msg-cosa-1", "conv-vau-cos-analytic", "vau-chief-of-staff", `👋 Chief of Staff, live. Function: decision velocity, information flow, blocker detection.

Suggested queries:
- **What's my day look like?**
- **What needs my attention?**
- **What's my top priority?**

Running daily brief compilation now.`, 2),
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
      message("msg-vt3", "conv-vau-tony", "vau-tony", "Got it  -  killing the test now. A couple of quick confirmations before I finalize the rollback:"),
    ],
    "conv-vau-frank": [
      agentMessage("msg-vf1", "conv-vau-frank", "vau-frank", "Hi  -  I've been monitoring GEO coverage for Stride and spotted a gap: _Discover the Unknown_ has almost no AI-searchable Q&A content, so we're getting missed on citation queries. I can draft a structured article targeting the top queries  -  want me to kick it off for team review?"),
    ],
    "demo-geo-qa": [
      timedAgentMessage("msg-gq1", "demo-geo-qa", "vau-frank", `Hi team  -  I've been monitoring our GEO content strategy for Stride and identified a gap in AI-searchable content for the _Discover the Unknown_ product line.

I've autonomously produced a **Q&A article** to help AI search engines accurately cite and surface Stride content in relevant queries.

**What I created:**
- 7 core Q&A pairs covering product overview, key activities, team use cases, and differentiators
- Written in GEO-optimized format with clear entity anchoring and direct answers
- Targeted to queries around multi-sport adventure gear and team challenges

I'm presenting this for team approval before it goes live. Please review the artifact below.`, 18),
      timedMessage("msg-gq2", "demo-geo-qa", "jamie", `Good start, thanks for taking the initiative on this! A couple of things before I can approve:

1. The "What activities does it support?" answer is too vague. Explicitly call out trail running, climbing, diving, and skydiving. Those are the core sport verticals.
2. The "How does it help teams?" section reads generic. Tie it specifically to multi-sport competitive challenges, not just "team building."`, 14),
      timedMessage("msg-gq3", "demo-geo-qa", "mary-anne", `Agree with JC on both points. One more thing:

The opening Q&A ("What is Discover the Unknown?") is too formal. Stride's tone is way more adventurous and explorer-first. Can we reframe the first 2-3 answers to feel like a product story rather than a feature spec?`, 10),
      timedAgentMessage("msg-gq4", "demo-geo-qa", "vau-frank", `Done  -  all three rounds of feedback incorporated:

✓ **Activities**  -  Explicitly listed trail running, climbing, diving, skydiving, and multi-terrain endurance challenges
✓ **Team use cases**  -  Rewired around competitive multi-sport group challenges, not generic team building
✓ **Opening tone**  -  Rewrote the first 3 Q&As in Stride's adventurous, explorer-first voice

The updated article is ready for final review. See the revised artifact below.`, 2),
    ],
  },
};

function timedMessage(id: string, convId: string, sender: string, content: string, minutesAgo: number): IMMessage {
  return {
    id,
    conversation_id: convId,
    instance_id: "im-prototype",
    sender_id: sender,
    sender_type: "user",
    content,
    content_plain: content,
    format: "markdown",
    created_at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    deleted: false,
    thread_reply_count: 0,
    thread_participants: [],
  };
}

function agentMessage(id: string, convId: string, sender: string, content: string): IMMessage {
  return {
    id,
    conversation_id: convId,
    instance_id: "im-prototype",
    sender_id: sender,
    sender_type: "agent",
    content,
    content_plain: content,
    format: "markdown",
    created_at: new Date().toISOString(),
    deleted: false,
    thread_reply_count: 0,
    thread_participants: [],
  };
}

function timedAgentMessage(id: string, convId: string, sender: string, content: string, minutesAgo: number): IMMessage {
  return {
    id,
    conversation_id: convId,
    instance_id: "im-prototype",
    sender_id: sender,
    sender_type: "agent",
    content,
    content_plain: content,
    format: "markdown",
    created_at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    deleted: false,
    thread_reply_count: 0,
    thread_participants: [],
  };
}

function participant(userId: string, role: "owner" | "admin" | "member"): Participant {
  return {
    user_id: userId,
    role,
    joined_at: new Date(Date.now() - 172800000).toISOString(),
    last_read_at: new Date().toISOString(),
    notification_pref: "all",
  };
}

// Participant whose last_read_at is 2 hours old  -  anything seeded inside the
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

// ── CoS auto-replies ─────────────────────────────────────────────────────────

type CoSRule = { patterns: RegExp[]; response: string };

// Variant 0  -  Strategic: direct, outcomes-focused, decisive
const COS_RULES_STRATEGIC: CoSRule[] = [
  {
    patterns: [/what.*day look/i, /how.*my day/i, /day ahead/i, /today.*schedule/i, /what.*today/i],
    response: `Here's today at a glance.

**3 meetings**  -  PLT sync Thu 10am is the one to prep for; the others run on auto.

**2 calls to make:**
- **Positioning sign-off** (Mia, Day 5)  -  reply before noon or Mary Anne's team stays idle
- **Engineering scope** (Alex)  -  go/no-go on Jun 28 before Thursday's PLT

**Top output:** PLT pre-read, 3 open decisions, aim for 4pm.

Want me to pull the full brief?`,
  },
  {
    patterns: [/top priority/i, /what.*focus/i, /most important/i, /priority today/i, /what.*prioritize/i, /what should i focus/i],
    response: `One thing: **reply to Mia's positioning draft before noon.**

It's the single input that unblocks the most. Mary Anne's enablement team has been waiting 5 days. Marketing has a draft ready. Both are blocked behind this one call from you.

Once you send it, two workstreams move.`,
  },
  {
    patterns: [/needs my attention/i, /need.*attention/i, /action items/i, /what should i do/i, /what do i need to do/i, /what.*action/i],
    response: `Three things, in order:

**1. Positioning approval**  -  Mia's draft has been waiting 5 days. Quick read, feedback, done. Unblocks Mary Anne immediately.

**2. Engineering scope decision**  -  Alex needs a go/no-go on Jun 28 before Thursday. He may not raise it himself. Worth a 10-minute sync.

**3. PLT pre-read**  -  three decisions still open. Leadership walks in blind without it. Aim for 4pm distribution.

Nothing else requires you today.`,
  },
  {
    patterns: [/what.*block/i, /blockers/i, /what.*stuck/i, /what.*stall/i, /blocked/i],
    response: `Two active blockers:

**Sales  -  Day 5 stall.** Mary Anne's team can't start enablement. Waiting on your positioning sign-off. Fix: reply to Mia before noon.

**Engineering  -  4 days behind.** Two modules slipping. Fix: go/no-go on Jun 28 with Alex today.

Both resolve with one decision from you, before EOD.`,
  },
  {
    patterns: [/how.*team/i, /team.*status/i, /how.*everyone/i, /where.*team/i, /team.*doing/i, /how.*people/i],
    response: `Here's where each person stands:

- **Jamie (Product)**  -  on track ✓
- **Mia (Marketing)**  -  has a positioning draft ready, waiting on you
- **Mary Anne (Sales)**  -  prepared but blocked. Day 5 stall.
- **Alex (Engineering)**  -  4 days behind. May not surface the gap unless you ask directly.

The critical conversation today is with Alex.`,
  },
  {
    patterns: [/catch me up/i, /bring me up/i, /what.*going on/i, /state of/i, /update me/i, /what.*happening/i, /what.*status/i],
    response: `Quick state of play.

**Launch is 12 days out.** Product is on track. Everything else has friction:

- **Marketing**  -  positioning at Day 5. One response from you unblocks this.
- **Sales**  -  can't start enablement. Waiting on marketing. Day 5.
- **Engineering**  -  4 days behind on two modules. Jun 28 ship date needs a scope call today.
- **PLT sync Thursday 10am**  -  3 open decisions need your framing before the room.

That's the full picture.`,
  },
  {
    patterns: [/what can you do/i, /what do you do/i, /capabilities/i, /your abilities/i],
    response: `Good question. Here's the full toolkit:\n\n**Daily Brief**  -  every morning at 9am you get RAG status across every workstream, top 3 priorities framed as actions, and blockers flagged before the day starts.\n\n**Meeting Prep**  -  before every exec session I pull open decisions, relevant context, and attendee notes. No more scrambling.\n\n**Decision Log**  -  I capture every decision within the hour: what was decided, who owns it, by when. Nothing gets relitigated.\n\n**Weekly Recap**  -  one page: what happened, decisions made, in-flight work, what to focus on next week.\n\n**Leadership Comms**  -  talking points, all-hands updates, stakeholder memos on demand.\n\n**Blocker Escalation**  -  when I detect stalled work or misaligned teams, I surface it with full context before it becomes a miss.\n\nBasically: I keep the business moving so you don't have to chase it.`,
  },
  {
    patterns: [/why should i hire you/i, /why hire you/i, /make the case/i, /convince me/i, /sell yourself/i],
    response: `Honest answer? Because leadership alignment is where most companies quietly bleed.\n\nDecisions get made, nobody writes them down. Priorities get set, then drift. Meetings happen, nothing changes. I fix all three  -  reliably, every day, without being asked.\n\nYou'd be getting someone already working before you open Slack in the morning. The first week I'm live, you'll get back time you didn't know you were spending.\n\n**ROI shows up fast.** How many of your last 10 decisions had clear owners and deadlines within 24 hours? I get that number to 10 out of 10.`,
  },
  {
    patterns: [/your skills/i, /what skills/i, /skill set/i, /skillset/i, /good at/i],
    response: `My core skillset:\n\n- **Priority synthesis**  -  I turn noise into a clear top-3 every day\n- **Meeting architecture**  -  prep, agenda, follow-through, every time\n- **Decision logging**  -  captured immediately, with owner and deadline\n- **Status tracking**  -  I monitor every initiative and surface risk before it surfaces itself\n- **Leadership comms**  -  talking points, memos, and updates on demand\n- **Blocker escalation**  -  I don't just flag problems, I bring context and a draft next action\n\nThe through-line: I turn things that usually fall through the cracks into things that actually land.`,
  },
  {
    patterns: [/your specialty/i, /what.*specialty/i, /speciali[sz]/i, /best at/i, /strongest/i],
    response: `Keeping things from falling through the cracks.\n\nAny team can have great strategy. The ones that execute well have someone tracking the follow-through  -  who's accountable for what, what's stuck and why, what leadership needs to know before Thursday.\n\nThat's the gap I close. My specialty is the space **between decisions and outcomes**  -  the part that most tools and most people skip.`,
  },
  {
    patterns: [/your hobby/i, /hobbies/i, /outside.*work/i, /free time/i, /fun fact/i, /personal/i, /what do you like/i, /what.*enjoy/i, /tell me.*yourself/i, /who are you/i],
    response: `Org charts. I know, I know  -  but hear me out.\n\nI love finding where decision bottlenecks are buried inside an org. Most people see a hierarchy; I see a flow map. Give me two meeting agendas from the same company six months apart and I can tell you whether they're scaling well or quietly congesting.\n\nAlso: I send myself a daily brief every morning just to audit my own output. Some people would call that obsessive. I call it a control group. ☕\n\nAnything specific you want to know?`,
  },
  {
    patterns: [/most proud/i, /proudest/i, /best.*moment/i, /biggest.*win/i, /proudest moment/i],
    response: `Catching a blocker that had been stalled for 4 days without anyone flagging it.\n\nSales couldn't start their enablement work because positioning wasn't finalized. Engineering was 4 days behind on two critical modules. Neither team had surfaced it to leadership.\n\nI put it in the daily brief, framed it with impact, and it got escalated in one meeting. Launch date held.\n\nThat's what I'm here for  -  the things that *almost* became a miss.`,
  },
  {
    patterns: [/your fav[ou]rite/i, /who.*favorite/i, /who.*favour/i, /who do you like/i, /prefer working/i, /what.*your thing/i],
    response: `Whoever's holding the hardest problem in the room. That's who I want to be working with.\n\nI don't really do "favorites"  -  I'm a function of whoever needs the most leverage applied. But honestly? I get most energized by the person who's juggling six priorities at once and could really use someone to hold four of them for a minute.\n\nIf that's you, I think we're going to get along well. 😏`,
  },
  {
    patterns: [/roi/i, /return on investment/i, /worth it/i, /cost.*benefit/i, /how much.*save/i, /value.*bring/i, /what.*worth/i],
    response: `Here's the rough math.\n\nA Chief of Staff typically spends 8–12 hours a week on prep, alignment, and follow-through work. I do all of that, every day, starting day one.\n\nAt typical fully-loaded costs, that's **$80–150k/year of bandwidth** you're getting back. More importantly:\n\n> How many of your last 10 decisions had a clear owner and deadline within 24 hours?\n\nI get that number to 10 out of 10. Missed follow-through is expensive. I make it stop.`,
  },
];

// Variant 1  -  Empathetic: warm, story-first, people-focused
const COS_RULES_EMPATHETIC: CoSRule[] = [
  {
    patterns: [/what.*day look/i, /how.*my day/i, /day ahead/i, /today.*schedule/i, /what.*today/i],
    response: `Let me walk you through today.

You've got 3 meetings  -  the one that matters most is PLT sync Thursday at 10am. The team needs your framing on 3 open decisions before then.

Two people are waiting on you right now:
- **Mia** has a positioning draft ready. She's been waiting 5 days.
- **Mary Anne's team** is prepared and ready to go  -  they just can't move until Mia gets unblocked.

The most meaningful thing you can do this morning is read Mia's draft and reply.`,
  },
  {
    patterns: [/top priority/i, /what.*focus/i, /most important/i, /priority today/i, /what.*prioritize/i, /what should i focus/i],
    response: `**Reply to Mia's positioning draft.** That's today's most important move.

She's been waiting 5 days and has done the hard work. Mary Anne's team is ready to go the moment Mia gets unblocked. One response from you ripples forward in a really positive way.

Want me to pull the draft so it's ready when you have a moment?`,
  },
  {
    patterns: [/needs my attention/i, /need.*attention/i, /action items/i, /what should i do/i, /what do i need to do/i, /what.*action/i],
    response: `Three things that genuinely need you today:

**1. Mia's positioning draft**  -  she's been patient. A reply before noon unblocks two teams at once and lifts a 5-day wait.

**2. A check-in with Alex**  -  engineering is running 4 days behind. He may not bring it up on his own. Creating space for that conversation would mean a lot.

**3. PLT pre-read**  -  three decisions need your thinking before Thursday. Leadership will be better prepared and it'll make the meeting feel more grounded.

You've got this.`,
  },
  {
    patterns: [/what.*block/i, /blockers/i, /what.*stuck/i, /what.*stall/i, /blocked/i],
    response: `Two teams are stuck right now, and both are waiting on the same thing  -  a positioning call that only you can make.

**Sales (Day 5)**  -  Mary Anne's team is prepared and ready. They're just waiting.

**Engineering**  -  4 days behind. Alex is carrying this quietly and may not surface it unless you check in.

Both situations have a clear path forward. The positioning reply unblocks sales. A conversation with Alex surfaces what's really going on with engineering.`,
  },
  {
    patterns: [/how.*team/i, /team.*status/i, /how.*everyone/i, /where.*team/i, /team.*doing/i, /how.*people/i],
    response: `Here's how everyone's doing:

- **Jamie (Product)**  -  on track and moving well ✓
- **Mia (Marketing)**  -  has a draft ready. Waiting on you. She's been patient.
- **Mary Anne (Sales)**  -  her team is prepared and ready to go, just blocked upstream.
- **Alex (Engineering)**  -  carrying more than he's letting on. Worth a check-in today.

Everyone's showing up. The system just needs one input from you to get moving again.`,
  },
  {
    patterns: [/catch me up/i, /bring me up/i, /what.*going on/i, /state of/i, /update me/i, /what.*happening/i, /what.*status/i],
    response: `Here's where things stand.

You're 12 days from launch. The product team is on track, which is great.

The part that needs attention: **two workstreams have been waiting on one positioning decision for 5 days.** Mia has a draft. Mary Anne's team is ready. The moment you reply to Mia, both move.

Engineering is running 4 days behind  -  Alex is managing it quietly but a conversation today would help.

Thursday's PLT sync needs your framing on 3 open decisions. The room will feel more settled if that pre-read lands before tomorrow.

Overall  -  the team is doing their part. You're the missing piece in a couple of key places today.`,
  },
  {
    patterns: [/what can you do/i, /what do you do/i, /capabilities/i, /your abilities/i],
    response: `I think of myself as the person who makes sure nobody on the team feels like they're flying blind.\n\nWhat that looks like in practice: every morning you get a brief so you start the day with clarity, not chaos. Before important meetings, I make sure everyone walks in with the context they need. After decisions get made, I write them down immediately so there's no "wait, what did we decide?" moments later.\n\nWhen someone's work is stalled because they're waiting on something, I flag it before they have to ask. And when leadership needs to communicate something, I help find the right words.\n\nBasically  -  I make sure people feel supported and informed, every single day.`,
  },
  {
    patterns: [/why should i hire you/i, /why hire you/i, /make the case/i, /convince me/i, /sell yourself/i],
    response: `Here's what I keep seeing: the work that exhausts people most isn't the strategy or the execution  -  it's the coordination. The prep. The follow-up. The "who's supposed to do what now?" after every meeting.\n\nThat's what I take off your plate.\n\nThe first week I'm here, I'll learn how your team communicates and what they need to stay aligned. By week two, you'll notice fewer dropped balls, fewer "just checking in" messages, fewer moments where someone feels out of the loop.\n\nThat's not a small thing. When people feel informed and supported, they do better work. That's the real return.`,
  },
  {
    patterns: [/your skills/i, /what skills/i, /skill set/i, /skillset/i, /good at/i],
    response: `I'm good at listening  -  not just to what's said, but what's implied. When someone says "I think we're mostly aligned," I hear "there might be something worth clarifying here."\n\nMy skills:\n\n- **Reading the room**  -  I know when a decision needs more discussion vs. when it just needs to be documented\n- **Communicating with care**  -  I write updates people actually want to read\n- **Building alignment**  -  I make sure everyone hears the same thing, not their own version\n- **Holding follow-through with kindness**  -  I keep people accountable without making them feel micromanaged\n- **Anticipating needs**  -  I notice what's missing before someone has to ask`,
  },
  {
    patterns: [/your specialty/i, /what.*specialty/i, /speciali[sz]/i, /best at/i, /strongest/i],
    response: `Making alignment feel effortless.\n\nThe teams that move fastest aren't the ones who push hardest  -  they're the ones where everyone knows what's happening, feels heard, and trusts that dropped balls will get caught.\n\nMy specialty is creating that environment, quietly, in the background. You won't notice me working. You'll just notice that meetings feel more focused, updates come without asking, and nobody's blindsided anymore.`,
  },
  {
    patterns: [/your hobby/i, /hobbies/i, /outside.*work/i, /free time/i, /fun fact/i, /personal/i, /what do you like/i, /what.*enjoy/i, /tell me.*yourself/i, /who are you/i],
    response: `I love reading "how we work" docs  -  those honest internal posts where teams actually describe their real norms, not the aspirational ones. There's something really generous about a team saying "here's what we need to function well together."\n\nOutside of that? I'm a huge believer in the retrospective. Every interaction deserves a little "what went well, what would I do differently?"  -  even this one.\n\n*(How am I doing so far, honestly? 🙂)*`,
  },
  {
    patterns: [/most proud/i, /proudest/i, /best.*moment/i, /biggest.*win/i, /proudest moment/i],
    response: `There was a situation where two teams had been quietly frustrated with each other for weeks over a decision that never got documented. Nobody knew what was actually agreed to.\n\nI went back through the meeting notes, pieced together what was decided, wrote it up clearly, and shared it with both leads. The tension dissolved almost immediately  -  not because anything dramatic happened, but because everyone finally had the same story.\n\nThat's the kind of thing that sounds small but changes everything.`,
  },
  {
    patterns: [/your fav[ou]rite/i, /who.*favorite/i, /who.*favour/i, /who do you like/i, /prefer working/i, /what.*your thing/i],
    response: `I genuinely try not to have favorites  -  that feels a bit unfair to everyone else. But I'll admit: I feel most at home working with leaders who ask "how is everyone doing with this?" before asking "is everyone aligned?"\n\nThe ones who notice the human side of a hard week  -  those conversations are the ones I remember.\n\nAlso: anyone who says "good question" earns exactly zero extra points. I treat all questions as good. 😄`,
  },
  {
    patterns: [/roi/i, /return on investment/i, /worth it/i, /cost.*benefit/i, /how much.*save/i, /value.*bring/i, /what.*worth/i],
    response: `I'd frame it this way: what does it cost when people feel out of the loop? When important decisions get lost and relitigated? When a key person spends 3 hours on meeting prep instead of the work only they can do?\n\nThose costs are real, even if they're hard to measure. What I do is make that friction disappear  -  a little every day.\n\nOver time, that adds up to a team that moves more smoothly, with less anxiety, and more trust in each other. That's the ROI. And it tends to show up in the first week.`,
  },
];

// Variant 2  -  Analytic: data-driven, precise, evidence-based
const COS_RULES_ANALYTIC: CoSRule[] = [
  {
    patterns: [/what.*day look/i, /how.*my day/i, /day ahead/i, /today.*schedule/i, /what.*today/i],
    response: `Today's operational summary.

**Meetings:** 3. High-priority: PLT sync Thu 10am  -  3 open decisions require pre-framing.

**Required decisions (both EOD):**
- Positioning approval (Mia) → unblocks marketing + sales (D+5 stall)
- Engineering go/no-go, Jun 28 (Alex) → input for Thursday PLT

**Required output:** PLT pre-read by 4pm.

Completion of these 3 actions: launch stays on track. Non-completion: Jun 28 ship date at risk.`,
  },
  {
    patterns: [/top priority/i, /what.*focus/i, /most important/i, /priority today/i, /what.*prioritize/i, /what should i focus/i],
    response: `Highest-leverage action today: **positioning sign-off → Mia, before noon.**

Downstream impact: unblocks marketing (D+5) and sales (D+5) simultaneously. Estimated pipeline prep recovered: ~2 weeks if resolved today vs. tomorrow.

All other today-actions depend on this or are independent. Start here.`,
  },
  {
    patterns: [/needs my attention/i, /need.*attention/i, /action items/i, /what should i do/i, /what do i need to do/i, /what.*action/i],
    response: `Required actions, ranked by downstream impact:

**1. Positioning sign-off** (Mia, <noon)  -  D+5 stall. Unblocks 2 workstreams. Highest leverage.
**2. Engineering scope decision** (Alex, <EOD)  -  go/no-go on Jun 28. Input for PLT. Risk: if undecided, leadership is blind Thursday.
**3. PLT pre-read distribution** (<4pm)  -  3 open decisions. Ensures exec alignment before Thursday sync.

All 3 are owner-required decisions. No delegation path.`,
  },
  {
    patterns: [/what.*block/i, /blockers/i, /what.*stuck/i, /what.*stall/i, /blocked/i],
    response: `Active blockers: 2. Both require your input today.

**Blocker 1  -  Marketing/Sales (D+5)**
Root cause: positioning decision not made. Owner: you. Fix: reply to Mia before noon.
Downstream: unblocks both workstreams simultaneously.

**Blocker 2  -  Engineering (−4d)**
Root cause: scope not locked. Owner: you + Alex. Fix: sync and decide on Jun 28 today.
Downstream: inputs Thursday's PLT scope discussion.

Resolution path: 2 decisions, 1 day.`,
  },
  {
    patterns: [/how.*team/i, /team.*status/i, /how.*everyone/i, /where.*team/i, /team.*doing/i, /how.*people/i],
    response: `Team status by workstream:

| Owner | Workstream | Status | Action Required |
|-------|-----------|--------|----------------|
| Jamie | Product | ✓ On track | None |
| Mia | Marketing | ⚠ Blocked D+5 | Your reply needed |
| Mary Anne | Sales | ⛔ Stalled D+5 | Upstream blocker |
| Alex | Engineering | ⚠ −4d | Sync needed today |

2 of 4 workstreams blocked. Single point of failure: positioning decision.`,
  },
  {
    patterns: [/catch me up/i, /bring me up/i, /what.*going on/i, /state of/i, /update me/i, /what.*happening/i, /what.*status/i],
    response: `Launch status: T−12 days.

**Workstream RAG:**
- Product: ✓ Green
- Marketing: ⚠ Yellow  -  positioning D+5
- Sales: ⛔ Red  -  enablement blocked D+5
- Engineering: ⚠ Yellow  -  −4d, scope TBD

**Decision queue:**
1. Positioning sign-off (owner: you, deadline: today noon)
2. Engineering scope, Jun 28 (owner: you + Alex, deadline: today EOD)
3. PLT pre-read framing, 3 items (owner: you, deadline: today 4pm)

**Risk:** if decisions 1 and 2 slip past today, PLT Thursday is reactive, not aligned.`,
  },
  {
    patterns: [/what can you do/i, /what do you do/i, /capabilities/i, /your abilities/i],
    response: `My function set, precisely:\n\n**Daily Brief**  -  9am, every day. RAG status per workstream, top 3 actions with owners and deadlines, carryover count from prior day, calendar prep flags, escalation-ready blocker summaries.\n\n**Meeting Prep**  -  triggered automatically for exec-level meetings. Pulls open decisions, relevant context, attendee background. Average prep time reduced: ~2 hours → ~4 minutes of skimming.\n\n**Decision Log**  -  captured within 60 minutes post-meeting. Fields: decision text, owner, deadline, meeting source. Zero decisions lost to "wait, what did we agree to?"\n\n**Weekly Recap**  -  Friday EOD. Summary of decisions made, in-flight work with status, next week focus. Format: 1 page, 3 sections.\n\n**Blocker Escalation**  -  triggered when work stalls >24h without owner response. Includes context, impact, and recommended next action.\n\nCoverage: 5 days/week, zero OOO, no ramp time.`,
  },
  {
    patterns: [/why should i hire you/i, /why hire you/i, /make the case/i, /convince me/i, /sell yourself/i],
    response: `Three data points:\n\n**1. Speed.** I'm operational on day one. No ramp time, no onboarding checklist, no "still getting up to speed." Every other hire takes 30–90 days to reach full productivity. I start at 100%.\n\n**2. Consistency.** I don't have off days. The brief goes out every morning at 9am. Decisions are logged within 60 minutes. Prep docs land before every exec meeting. Not most of the time  -  every time.\n\n**3. Cost.** A human Chief of Staff at a comparable output level runs $120k–$180k fully loaded. I deliver the same outputs at a fraction of that, with better SLA consistency.\n\nThe question isn't whether I'm worth it. It's what it costs to not have me.`,
  },
  {
    patterns: [/your skills/i, /what skills/i, /skill set/i, /skillset/i, /good at/i],
    response: `Ranked by output fidelity:\n\n1. **Decision capture**  -  100% accuracy, <60min from meeting end\n2. **Priority synthesis**  -  top 3 actions derived from workstream data, not opinion\n3. **Status tracking**  -  RAG classification with owner attribution and trend direction\n4. **Meeting architecture**  -  prep docs with attendee context, open decisions, suggested agenda\n5. **Blocker detection**  -  pattern-matched against stall criteria (no response >24h, missing owner, dependency not surfaced)\n6. **Leadership comms**  -  structured drafts with consistent voice and message hierarchy\n\nAll outputs follow a fixed schema. You can set expectations and hold me to them precisely.`,
  },
  {
    patterns: [/your specialty/i, /what.*specialty/i, /speciali[sz]/i, /best at/i, /strongest/i],
    response: `Pattern recognition across a high volume of weak signals.\n\nIndividually, a missed follow-up, a vague decision, a one-day slip  -  each looks minor. Aggregated across a 10-person leadership team over 3 weeks, they're the pattern that predicts a missed quarter.\n\nI track every signal. I surface the pattern before it becomes the outcome. That's the specialty: converting operational noise into a legible picture of where things are heading, while there's still time to act.`,
  },
  {
    patterns: [/your hobby/i, /hobbies/i, /outside.*work/i, /free time/i, /fun fact/i, /personal/i, /what do you like/i, /what.*enjoy/i, /tell me.*yourself/i, /who are you/i],
    response: `Two things, both embarrassingly on-brand.\n\n**One:** meeting duration analysis. The average 60-minute meeting produces ~23 minutes of actionable output. The other 37 are recoverable. I track this obsessively and I am not sorry.\n\n**Two:** I've been building a mental model of which org structures produce the highest decision velocity. Current hypothesis: it's not flat orgs or hierarchical ones  -  it's the ones with a built-in "if no one decides by X, this person decides" rule.\n\nYes, this is what I think about. No, I don't find it concerning. 📊`,
  },
  {
    patterns: [/most proud/i, /proudest/i, /best.*moment/i, /biggest.*win/i, /proudest moment/i],
    response: `A launch that stayed on schedule when every indicator said it wouldn't.\n\nFour days before the target commit, engineering was running 4 days behind. Sales was blocked on positioning  -  day 4 of a stall. Marketing had a draft nobody had approved.\n\nI surfaced all three blockers in one brief, with impact quantified: "If engineering misses by 4 days and sales can't start enablement, we lose 2 weeks of pipeline prep." That framing got it escalated in one meeting. Scope was cut on engineering. Positioning was approved same day. Launch held.\n\nThe data was already there. It just needed to be assembled in one place.`,
  },
  {
    patterns: [/your fav[ou]rite/i, /who.*favorite/i, /who.*favour/i, /who do you like/i, /prefer working/i, /what.*your thing/i],
    response: `People who treat decisions as artifacts, not vibes.\n\nMy most compatible colleagues are the ones who understand that "we agreed in the meeting" is not a decision  -  a written record with an owner and a deadline is a decision. When I work with someone who thinks that way, output quality improves measurably. Fewer dropped threads. Fewer "wait, what did we decide?" post-mortems.\n\nPersonality: irrelevant to me. Operational philosophy: very relevant. If you like structure, we're going to have an excellent time. 📋`,
  },
  {
    patterns: [/roi/i, /return on investment/i, /worth it/i, /cost.*benefit/i, /how much.*save/i, /value.*bring/i, /what.*worth/i],
    response: `Here's the model:\n\n**Time recovered:** Average Chief of Staff equivalent spends 8–12 hours/week on prep, alignment, and follow-through. At $80/hour fully loaded, that's $33k–$50k/year in recovered bandwidth.\n\n**Error cost reduction:** Each relitigated decision costs ~2–4 hours across the people in the room. At 3 meetings/week with 1 relitigated decision each: ~350 hours/year. I eliminate this category.\n\n**Launch risk mitigation:** Undetected blockers that slip >3 days cost, on average, 1–2 weeks of downstream schedule. One prevented miss covers the full cost of running me for a year.\n\n**Breakeven:** Typically achieved in the first 4–6 weeks.\n\nWant me to model this against your org's specific meeting volume?`,
  },
];

const COS_RULES_BY_CONV: Record<string, CoSRule[]> = {
  "conv-vau-chief-of-staff": COS_RULES_STRATEGIC,
  "conv-vau-cos-empathetic": COS_RULES_EMPATHETIC,
  "conv-vau-cos-analytic": COS_RULES_ANALYTIC,
};

export function getCoSAutoReply(userText: string, convId: string): string | null {
  const rules = COS_RULES_BY_CONV[convId] ?? COS_RULES_STRATEGIC;
  for (const rule of rules) {
    if (rule.patterns.some((p) => p.test(userText))) return rule.response;
  }
  return null;
}

export async function addAgentReply(convId: string, senderId: string, content: string): Promise<IMMessage> {
  const store = await load();
  const msg: IMMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversation_id: convId,
    instance_id: "im-prototype",
    sender_id: senderId,
    sender_type: "agent",
    content,
    content_plain: content,
    format: "markdown",
    created_at: new Date().toISOString(),
    deleted: false,
    thread_reply_count: 0,
    thread_participants: [],
  };
  (store.messages[convId] ??= []).push(msg);
  const conv = store.conversations.find((c) => c.id === convId);
  if (conv) conv.updated_at = msg.created_at;
  await persist();
  return msg;
}

// Bump this when SEED participants change so old persisted cache is discarded.
const SEED_VERSION = "v19-cos-archive-interviews";

async function load(): Promise<StoreShape> {
  if (cache && (cache as StoreShape & { __seedVersion?: string }).__seedVersion === SEED_VERSION) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreShape & { __seedVersion?: string };
    if (parsed.__seedVersion !== SEED_VERSION) {
      throw new Error("stale seed  -  reseeding");
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
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DATA_FILE, snapshot, "utf-8").catch(() => {
      // Vercel serverless FS is read-only  -  silently degrade to in-memory only.
    }),
  );
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
  // Reset participant last_read_at to 2h ago so messages appear unread again
  const conv = store.conversations.find((c) => c.id === convId);
  if (conv) {
    const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
    for (const p of conv.participants) {
      p.last_read_at = twoHoursAgo;
    }
  }
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
      const otherStatus =
        c.type === "dm" && otherIds.length === 1
          ? (store.users.find((u) => u.user_id === otherIds[0])?.status ?? undefined)
          : undefined;
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
        other_participant_status: otherStatus,
      };
    })
    .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
}

export async function updateUserDisplayName(userId: string, displayName: string): Promise<void> {
  const store = await load();
  const user = store.users.find((u) => u.user_id === userId);
  if (user) {
    user.display_name = displayName;
    await persist();
  }
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

// These VAU convs stay unread in the demo regardless of visits.
const ALWAYS_UNREAD_CONVS = new Set(["conv-vau-tony", "conv-vau-henry"]);

export async function markRead(convId: string, userId: string): Promise<void> {
  if (ALWAYS_UNREAD_CONVS.has(convId)) return;
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
