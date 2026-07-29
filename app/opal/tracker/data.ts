// Seed data for the Tracker prototype.
import type { Task } from "./types";

export const INITIAL_GROUPS: { name: string; tasks: Task[] }[] = [
  {
    name: "HITL Design",
    tasks: [
      { id: "t1", title: "Approve sticky board spec draft", badgeLabel: "Workflow", badgeIntent: "success", due: "Jul 7", overdue: true, type: "approval", createdBy: "Social Strategist", createdIn: "IM" },
      { id: "t2", title: "Share D1+D2 decisions with Nikita", badgeLabel: "Added", badgeIntent: "neutral", due: "Jul 7", overdue: true, type: "normal", createdBy: "You" },
      { id: "t3", title: "Review M4 sticky board requirements", badgeLabel: "Brief", badgeIntent: "information", due: "Jul 10", type: "normal" },
    ],
  },
  {
    name: "Campaign Q3",
    tasks: [
      { id: "t4", title: "Finalize Q3 social calendar", badgeLabel: "Workflow", badgeIntent: "success", vauName: "Marketing Asst", type: "agent", createdIn: "IM" },
      { id: "t5", title: "Review hero copy for landing page", badgeLabel: "Brief", badgeIntent: "information", due: "Jul 8", type: "normal" },
      { id: "t6", title: "Schedule content review with Ana", badgeLabel: "Added", badgeIntent: "neutral", type: "normal" },
    ],
  },
  {
    name: "IM Research",
    tasks: [
      { id: "t7", title: "Update Little Birds wiki — Session 6", badgeLabel: "Meeting", badgeIntent: "neutral", due: "Jul 7", overdue: true, type: "normal" },
      { id: "t8", title: "Share IM concept deck with Erika", badgeLabel: "Added", badgeIntent: "neutral", type: "normal" },
      {
        id: "cl1",
        title: "Opal catch-up — Jul 8",
        type: "normal",
        itemType: "checklist",
        checklistSource: "Opal",
        checklistGroups: [
          {
            name: "High Priority (Immediate Action)", emoji: "🔴",
            items: [
              { id: "cl1-1", bold: "Opal/AI Redesign Inconsistencies:", text: " Review the Create Specialized Agent page bugs flagged by Trisha (missing slider guidance bar and incorrect backtick formatting).", checked: false },
              { id: "cl1-2", bold: "Home Vision Work Scope:", text: " Schedule a sync with Tom Censani while in SF to align on scope/timeline for the “Home Vision” project.", checked: false },
              { id: "cl1-3", bold: "Opal Terminology Finalization:", text: " Connect with Ali Hart, Mona, and Amit to lock in the final naming for “Primitives” and “Abilities”.", checked: false },
            ],
          },
          {
            name: "Medium Priority (Follow-up)", emoji: "⚡",
            items: [
              { id: "cl1-4", bold: "Icons for Rebrand/Axiom 3:", text: " Brainstorm alternative icons for the Artifacts and Context tabs to resolve the similarity issue flagged by Nikita.", checked: false },
              { id: "cl1-5", bold: "Turnstile VAU Sync Verification:", text: " Verify the Admin Center rename sync shipped by Imran Yousuf is working correctly in production.", checked: false },
            ],
          },
          {
            name: "Low Priority (FYI)", emoji: "✏️",
            items: [
              { id: "cl1-6", bold: "AI Share & Learn Recording:", text: " Skim the recording of today's session to see what AI workflows the broader design team shared.", checked: false },
            ],
          },
        ],
      },
    ],
  },
];

// Seed for the "Rich" tray design (Option 1). Mirrors the Figma "Planner — List"
// content: avatar-led cards, tinted content blocks, an embedded image, comment
// counts, a reminder, and checklist cards. Kept separate from INITIAL_GROUPS so
// the Basic (Board) design and other views are unaffected.
export const RICH_GROUPS: { name: string; tasks: Task[] }[] = [
  {
    name: "Follow-up",
    tasks: [
      {
        id: "r1", title: "Approve sticky board spec draft", type: "approval",
        avatarName: "Social Strategist", avatarSrc: "/avatars/vau-poppy.png", badgeLabel: "PRD", badgeIntent: "neutral",
        commentCount: 2, due: "Jul 7", overdue: true, createdBy: "Social Strategist", createdIn: "IM",
        preview: {
          emoji: "👋",
          title: "PRD: Human-in-the-Loop (HITL) Governance",
          body: "Opal's governance model for injecting human judgment into autonomous workflows at critical decision points.",
          contents: ["Introduction", "Approval Surface Areas Overview", "Workflow Design & Execution", "Approval Interfaces", "CMP Integration"],
        },
      },
      {
        id: "r2", title: "Share D1+D2 decisions with Nikita", type: "normal",
        avatarName: "Nikita Rao", badgeLabel: "Daily Brief", badgeIntent: "neutral",
        commentCount: 3, due: "Jul 25",
        description: "This was a product review meeting focused on three themes: performance monitoring framework for Opal, virtual teammates alpha launch, and dashboard design.",
      },
      {
        id: "r3", title: "Review Opticon keynote scripts", type: "normal",
        avatarName: "Content Strategist", avatarSrc: "/avatars/vau-mayling.png", createdBy: "Content Strategist", createdIn: "IM", badgeLabel: "Meeting Prep", badgeIntent: "neutral",
        commentCount: 1, due: "Jul 27",
        description: "This was a product review meeting focused on three themes: performance monitoring framework for Opal, virtual teammates alpha launch, and dashboard design.",
        previewImage: "/planner-keynote-preview.png",
      },
      {
        id: "r4", title: "Reminder for research recruit email", type: "normal", reminder: true,
        avatarName: "You", avatarSrc: "/avatars/avatar-3.png", due: "Jul 27",
        description: "This was a product review meeting focused on three themes: performance monitoring framework for Opal, virtual teammates alpha launch, and dashboard design.",
      },
    ],
  },
  {
    name: "Campaign Q3",
    tasks: [
      {
        id: "r5", title: "Camp Opticon Content Calendar", type: "normal",
        avatarName: "Social Strategist", avatarSrc: "/avatars/vau-poppy.png", createdBy: "Social Strategist", createdIn: "IM",
        due: "Jul 25", itemType: "checklist", checklistSource: "Social Strategist",
        checklistGroups: [
          {
            name: "Campaign Posts", emoji: "🏕️",
            items: [
              { id: "r5-1", bold: "🏕️ Pack Your Bag —", text: " Now · Early July", checked: false },
              { id: "r5-2", bold: "🪵 Get In the Lodge —", text: " ~2 Weeks Out", checked: false },
              { id: "r5-3", bold: "🔥 No Slides. No Scripts. —", text: " Week Before · ~Aug 25", checked: false },
              { id: "r5-4", bold: "🌄 What the Trail Looked Like —", text: " After Sept 1", checked: false },
            ],
          },
        ],
      },
      { id: "r6", title: "Finalize Q3 social calendar", type: "agent", vauName: "Marketing Asst", avatarName: "Marketing Asst", avatarSrc: "/avatars/chair.png", badgeLabel: "Workflow", badgeIntent: "success", createdIn: "IM", description: "Building the Q3 posting cadence across LinkedIn, X, and the blog." },
      { id: "r7", title: "Schedule content review with Ana", type: "normal", avatarName: "Ana Ruiz", badgeLabel: "Added", badgeIntent: "neutral", description: "Set up a working session to review campaign assets before launch." },
    ],
  },
  {
    name: "IM Research",
    tasks: [
      { id: "r8", title: "Update Little Birds wiki — Session 6", type: "normal", avatarName: "You", avatarSrc: "/avatars/avatar-3.png", createdBy: "You", badgeLabel: "Meeting", badgeIntent: "neutral", due: "Jul 7", overdue: true, description: "Summarize the Session 6 findings and file them in the research wiki." },
      { id: "r9", title: "Share IM concept deck with Erika", type: "normal", avatarName: "Erika Chen", avatarSrc: "https://i.pravatar.cc/150?img=9", createdBy: "Erika Chen", createdIn: "IM", badgeLabel: "Added", badgeIntent: "neutral", description: "Send the latest IM concept deck and gather feedback before the review." },
      {
        id: "r10", title: "Opal catch-up — Jul 8", type: "normal",
        avatarName: "Opal", itemType: "checklist", checklistSource: "Opal",
        checklistGroups: INITIAL_GROUPS[2].tasks.find((t) => t.id === "cl1")?.checklistGroups ?? [],
      },
    ],
  },
];

// Seed for the "Fun" design's Unsorted drawer — clipped/captured items (Dia-style)
// that haven't been filed into a section yet. 12 items to exercise the drawer.
export const RICH_UNSORTED: Task[] = [
  { id: "u1", title: "The Monday Brief", type: "normal", itemType: "note", createdIn: "Chat", badgeLabel: "Brief", badgeIntent: "neutral", description: "Opal's weekly kickoff — what shipped and what's next." },
  { id: "u2", title: "Post | Feed", type: "normal", itemType: "note", createdIn: "IM", createdBy: "Priya Rajan", avatarSrc: "https://i.pravatar.cc/150?img=44", description: "Draft the LinkedIn launch post for review." },
  { id: "u3", title: "Terms of Service Updates", type: "normal", itemType: "note", createdIn: "IM", createdBy: "Jane Smith", avatarSrc: "https://i.pravatar.cc/150?img=47", description: "You're receiving a notice about our Terms of Service updates." },
  { id: "u4", title: "Q1 2026 Analytics Review", type: "normal", avatarSrc: "/avatars/avatar-3.png", createdBy: "You", createdIn: "Chat", badgeLabel: "Report", badgeIntent: "neutral", description: "Pull the quarterly numbers and flag anomalies." },
  { id: "u5", title: "Microsoft Loop", type: "normal", itemType: "note", createdIn: "IM", createdBy: "Amara Osei", avatarSrc: "https://i.pravatar.cc/150?img=38", description: "Shared workspace for the campaign brief." },
  { id: "u6", title: "The Friday Brief", type: "normal", itemType: "note", createdIn: "Chat", badgeLabel: "Brief", badgeIntent: "neutral", description: "Nothing until nearly noon and just two syncs after that." },
  { id: "u7", title: "Project Stella Q2 Status Report", type: "normal", avatarSrc: "/avatars/vau-kerby.png", createdBy: "Randy", createdIn: "IM", description: "Stella is on track for a July 14 launch with two open risks." },
  { id: "u8", title: "Social Habit Tracker", type: "normal", avatarSrc: "/avatars/avatar-3.png", createdBy: "You", createdIn: "Chat", description: "Keep the daily posting streak going." },
  { id: "u9", title: "Draft Q3 campaign angles", type: "normal", createdIn: "IM", createdBy: "Amara Osei", avatarSrc: "https://i.pravatar.cc/150?img=38", description: "Three angles to test for the Opticon push." },
  { id: "u10", title: "Reschedule 1:1 with Randy", type: "normal", avatarSrc: "/avatars/vau-kerby.png", createdBy: "Randy", createdIn: "IM", description: "Move Thursday's sync to next week." },
  { id: "u11", title: "Reply to security questionnaire", type: "normal", itemType: "note", createdIn: "Chat", description: "Vendor security review — 14 questions outstanding." },
  { id: "u12", title: "Bookmark: competitor pricing page", type: "normal", avatarSrc: "/avatars/avatar-3.png", createdBy: "You", createdIn: "Chat", description: "Compare tiers before the pricing sync." },
];

export const INITIAL_LANES: { label: string; color: string; tasks: Task[] }[] = [
  { label: "To Do", color: "var(--ax-colors-fg-tertiary)", tasks: INITIAL_GROUPS[0].tasks },
  { label: "Doing", color: "var(--ax-colors-fg-information)", tasks: INITIAL_GROUPS[1].tasks },
  { label: "Done", color: "var(--ax-colors-fg-success)", tasks: INITIAL_GROUPS[2].tasks },
];

export const ALL_TASKS: Task[] = INITIAL_GROUPS.flatMap((g) => g.tasks);

// Calendar config — July 2026 (offset: month starts on Wednesday).
export const CAL_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
export const JULY_2026_OFFSET = 3;
export const JULY_DAYS = 31;
export const TASK_DOTS: Record<number, string> = {
  7: "var(--ax-colors-fg-warning)",
  8: "var(--ax-colors-fg-information)",
  10: "var(--ax-colors-fg-information)",
  14: "var(--ax-colors-fg-success)",
};
