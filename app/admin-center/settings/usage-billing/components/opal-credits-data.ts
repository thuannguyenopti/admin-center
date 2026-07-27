// ── Credit allocation ─────────────────────────────────────────────────────────

export const OPAL_CREDITS = {
  purchased: 15_000,
  bonus: 1_000,
  get total() { return this.purchased + this.bonus; },
  used: 8_200,
  get remaining() { return this.total - this.used; },
  get usedPct() { return Math.round((this.used / this.total) * 100); },
  resetDate: "Aug 1, 2026",
} as const;

// ── Category breakdown ────────────────────────────────────────────────────────

export type CreditCategory = {
  id: string;
  name: string;
  cost: number; // USD
};

export const CREDIT_CATEGORIES: CreditCategory[] = [
  { id: "ai-cards",      name: "AI cards",                         cost: 0    },
  { id: "ai-fields",     name: "AI fields",                        cost: 0    },
  { id: "ai-tasks",      name: "AI tasks (Assign and Prioritize)", cost: 0    },
  { id: "ambient",       name: "Ambient answers",                  cost: 0    },
  { id: "autopilot",     name: "Autopilot Agents",                 cost: 0    },
  { id: "super-agents",  name: "Super Agents",                     cost: 0.62 },
  { id: "image-gen",     name: "Image generation",                 cost: 0    },
];

// ── Daily usage (Jul 1–22) ────────────────────────────────────────────────────

export type DailyUsage = {
  date: string;   // "Jul 1", "Jul 3" … (odd-indexed days have empty labels for chart spacing)
  chat: number;   // credits
  workflow: number;
};

export const DAILY_USAGE: DailyUsage[] = [
  { date: "Jul 1",  chat: 350,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 3",  chat: 250,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 5",  chat: 650,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 7",  chat: 450,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 9",  chat: 750,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 11", chat: 300,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 13", chat: 550,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 15", chat: 1000, workflow: 400  },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 17", chat: 500,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 19", chat: 100,  workflow: 0    },
  { date: "",       chat: 0,    workflow: 0    },
  { date: "Jul 21", chat: 150,  workflow: 1350 },
  { date: "Jul 22", chat: 0,    workflow: 500  },
];

// ── Product summary ───────────────────────────────────────────────────────────

export type ProductUsageRow = {
  name: string;
  color: string;       // hex, data-viz use only
  credits: number;
  pctOfTotal: string;
  vsPrior: string | null;
  vsPriorIntent: "warning" | "neutral";
};

export const PRODUCT_USAGE: ProductUsageRow[] = [
  { name: "Chat",     color: "#4f8ef7", credits: 5823, pctOfTotal: "72.3%", vsPrior: "+222.4%", vsPriorIntent: "warning" },
  { name: "Workflow", color: "#e05a2b", credits: 2234, pctOfTotal: "27.7%", vsPrior: null,       vsPriorIntent: "neutral" },
  { name: "Design",   color: "#22c55e", credits:  143, pctOfTotal: "—",     vsPrior: null,       vsPriorIntent: "neutral" },
];

// ── Super Agents breakdown ────────────────────────────────────────────────────

export type SuperAgent = {
  id: string;
  name: string;
  cost: number;        // USD
  /** 22 values — Jul 1 through Jul 22, credits per day */
  daily: number[];
};

export const SUPER_AGENTS: SuperAgent[] = [
  {
    id: "chief-of-staff",
    name: "Chief of Staff Companion",
    cost: 0.47,
    daily: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,55,60,65,60,100,90,65],
  },
  {
    id: "comm-coach",
    name: "Communication Coach – Channel Refiner",
    cost: 0.15,
    daily: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,55,70,0],
  },
  {
    id: "kickoff-brief",
    name: "Project Kickoff Brief Manager",
    cost: 0,
    daily: Array(22).fill(0) as number[],
  },
];
