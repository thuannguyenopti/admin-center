export interface WorkItem {
  id: string;
  taskId: string;
  title: string;
  project: {
    name: string;
    color: string;
  };
  step: {
    current: number;
    total: number;
    name: string;
    assignee: {
      name: string;
      avatar: string;
    };
  };
  dueDate: Date;
  daysUntilDue: number;
}

export interface RecentlyViewedItem {
  id: string;
  taskId: string;
  title: string;
  project: {
    name: string;
    color: string;
  };
  lastViewed: string;
}

export const myWorkItems: WorkItem[] = [
  {
    id: "1",
    taskId: "TSK-42859",
    title: "A simple Opal icon for product X and update the website too",
    project: { name: "Creative Requests", color: "#EF4444" },
    step: {
      current: 8,
      total: 8,
      name: "Graphic: Design + Deploy",
      assignee: { name: "Sarah Chen", avatar: "/avatars/sarah.jpg" },
    },
    dueDate: new Date("2025-02-28"),
    daysUntilDue: 4,
  },
  {
    id: "2",
    taskId: "TSK-56888",
    title: "Landing Page - Optimizely vs Adobe Experience Manager",
    project: { name: "Creative Requests", color: "#22C55E" },
    step: {
      current: 2,
      total: 5,
      name: "Legal",
      assignee: { name: "Alex Rivera", avatar: "/avatars/alex.jpg" },
    },
    dueDate: new Date("2025-02-28"),
    daysUntilDue: 4,
  },
  {
    id: "3",
    taskId: "TSK-21222",
    title: "Branding Venue for 2025 Roadshow Amsterdam",
    project: { name: "Creative Requests", color: "#EF4444" },
    step: {
      current: 7,
      total: 8,
      name: "Team meeting with stak...",
      assignee: { name: "David Kim", avatar: "/avatars/david.jpg" },
    },
    dueDate: new Date("2025-02-28"),
    daysUntilDue: 4,
  },
  {
    id: "4",
    taskId: "TSK-42859",
    title: "Optimizely, Netlify & Netcel Lunch Event",
    project: { name: "Creative Requests", color: "#22C55E" },
    step: {
      current: 8,
      total: 8,
      name: "Graphic: Design + Deploy",
      assignee: { name: "Sarah Chen", avatar: "/avatars/sarah.jpg" },
    },
    dueDate: new Date("2025-02-28"),
    daysUntilDue: 4,
  },
];

export const teamWorkItems: WorkItem[] = [
  {
    id: "5",
    taskId: "TSK-33445",
    title: "Q1 Marketing Campaign Assets",
    project: { name: "Marketing", color: "#3B82F6" },
    step: {
      current: 3,
      total: 6,
      name: "Design Review",
      assignee: { name: "Alice Johnson", avatar: "/avatars/alice.jpg" },
    },
    dueDate: new Date("2025-03-05"),
    daysUntilDue: 9,
  },
  {
    id: "6",
    taskId: "TSK-33446",
    title: "Product Launch Video",
    project: { name: "Creative Requests", color: "#EF4444" },
    step: {
      current: 1,
      total: 4,
      name: "Script Writing",
      assignee: { name: "David Kim", avatar: "/avatars/david.jpg" },
    },
    dueDate: new Date("2025-03-10"),
    daysUntilDue: 14,
  },
  {
    id: "7",
    taskId: "TSK-33447",
    title: "Social Media Graphics Bundle",
    project: { name: "Social", color: "#8B5CF6" },
    step: {
      current: 5,
      total: 5,
      name: "Final Approval",
      assignee: { name: "Sarah Chen", avatar: "/avatars/sarah.jpg" },
    },
    dueDate: new Date("2025-02-26"),
    daysUntilDue: 2,
  },
  {
    id: "8",
    taskId: "TSK-33448",
    title: "Annual Report Design",
    project: { name: "Corporate", color: "#F59E0B" },
    step: {
      current: 2,
      total: 7,
      name: "Data Collection",
      assignee: { name: "Alex Rivera", avatar: "/avatars/alex.jpg" },
    },
    dueDate: new Date("2025-03-15"),
    daysUntilDue: 19,
  },
  {
    id: "9",
    taskId: "TSK-33449",
    title: "Website Banner Refresh",
    project: { name: "Creative Requests", color: "#22C55E" },
    step: {
      current: 4,
      total: 4,
      name: "Deployment",
      assignee: { name: "Alice Johnson", avatar: "/avatars/alice.jpg" },
    },
    dueDate: new Date("2025-02-27"),
    daysUntilDue: 3,
  },
  {
    id: "10",
    taskId: "TSK-33450",
    title: "Email Template Redesign",
    project: { name: "Marketing", color: "#3B82F6" },
    step: {
      current: 2,
      total: 5,
      name: "Design",
      assignee: { name: "David Kim", avatar: "/avatars/david.jpg" },
    },
    dueDate: new Date("2025-03-01"),
    daysUntilDue: 5,
  },
  {
    id: "11",
    taskId: "TSK-33451",
    title: "Podcast Cover Art",
    project: { name: "Creative Requests", color: "#EF4444" },
    step: {
      current: 3,
      total: 3,
      name: "Review",
      assignee: { name: "Sarah Chen", avatar: "/avatars/sarah.jpg" },
    },
    dueDate: new Date("2025-02-25"),
    daysUntilDue: 1,
  },
  {
    id: "12",
    taskId: "TSK-33452",
    title: "Trade Show Booth Graphics",
    project: { name: "Events", color: "#EC4899" },
    step: {
      current: 1,
      total: 6,
      name: "Kickoff",
      assignee: { name: "Alex Rivera", avatar: "/avatars/alex.jpg" },
    },
    dueDate: new Date("2025-03-20"),
    daysUntilDue: 24,
  },
];

export const watchingItems: WorkItem[] = [
  {
    id: "13",
    taskId: "TSK-44001",
    title: "Brand Guidelines Update",
    project: { name: "Corporate", color: "#F59E0B" },
    step: {
      current: 6,
      total: 8,
      name: "Stakeholder Review",
      assignee: { name: "Alice Johnson", avatar: "/avatars/alice.jpg" },
    },
    dueDate: new Date("2025-03-08"),
    daysUntilDue: 12,
  },
  {
    id: "14",
    taskId: "TSK-44002",
    title: "Partner Co-marketing Assets",
    project: { name: "Marketing", color: "#3B82F6" },
    step: {
      current: 4,
      total: 5,
      name: "Legal Review",
      assignee: { name: "David Kim", avatar: "/avatars/david.jpg" },
    },
    dueDate: new Date("2025-03-02"),
    daysUntilDue: 6,
  },
];

export const recentlyViewedItems: RecentlyViewedItem[] = [
  {
    id: "r1",
    taskId: "TSK-37971",
    title: "Opticon personalization survey",
    project: { name: "Product Research & Design | Complete Data Analysis", color: "#F59E0B" },
    lastViewed: "5 days ago",
  },
  {
    id: "r2",
    taskId: "TSK-37971",
    title: "AI Suggested Segments Design Feedback",
    project: { name: "Product Research & Design | Complete Data Analysis", color: "#F59E0B" },
    lastViewed: "5 days ago",
  },
  {
    id: "r3",
    taskId: "TSK-37971",
    title: "A simple Opal icon for product X and update the website too",
    project: { name: "Product Research & Design | Complete Data Analysis", color: "#F59E0B" },
    lastViewed: "5 days ago",
  },
  {
    id: "r4",
    taskId: "TSK-37971",
    title: "Graphic: Design+ Deploy",
    project: { name: "Product Research & Design | Complete Data Analysis", color: "#F59E0B" },
    lastViewed: "5 days ago",
  },
];
