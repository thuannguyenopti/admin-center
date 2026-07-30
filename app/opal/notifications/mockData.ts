// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationType =
    | "agent_execution_chat"
    | "agent_execution_autonomous"
    | "agent_execution_failed"
    | "agent_execution_long_running"
    | "approval_required"
    | "guardrail_observer"
    | "guardrail_enforcer"
    | "guardrail_quality"
    | "guardrail_support_ticket"
    | "directory_new_agent"
    | "directory_update_available"
    | "directory_install_request"
    | "tools_new_available"
    | "tools_deprecated"
    | "tools_auth_required"
    | "tools_auth_expired"
    | "collaboration_agent_modified"
    | "collaboration_agent_activated"
    | "collaboration_agent_deactivated"
    | "system_announcement"
<<<<<<< HEAD
    | "system_maintenance";
=======
    | "system_maintenance"
    | "im_new_message"
    | "im_mention"
    | "im_thread_reply";
>>>>>>> origin/main

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    status: "unread" | "read";
    priority: "low" | "medium" | "high" | "critical";
    category:
    | "agent_execution"
    | "guardrail"
    | "directory"
    | "tools"
    | "system"
<<<<<<< HEAD
    | "collaboration";
=======
    | "collaboration"
    | "messages";
>>>>>>> origin/main

    // Context & metadata
    agentId?: string;
    agentName?: string;
    agentVersion?: string;
    executionId?: string;
    workflowId?: string;
    errorType?: string;
    guardrailType?: string;

    // Actions & linking
    deepLink: string;
    actionRequired: boolean;
    approvalRequired?: boolean;
    approvalType?: "opal_admin" | "cmp_workflow";

    // Timestamps
    createdAt: Date;
    readAt?: Date;
    dismissedAt?: Date;

    // Display helpers
    timestamp: string;
    date: string;

    // Additional metadata
    executionStatus?: "success" | "failed";
    guardrailStatus?:
    | "success"
    | "failed"
    | "triggered"
    | "warning"
    | "terminated";
    errorSource?: string;
    duration?: string;
    author?: { name: string; avatar: string | null };
    triggeredBy?: {
        type:
        | "email"
        | "in_app"
        | "scheduler"
        | "webhook"
        | "user"
        | "api"
        | "system";
        name: string;
        username?: string;
    };
}

export interface NotificationPreference {
    enabled: boolean;
    channels: ("in-app" | "email" | "slack" | "teams" | "browser")[];
}

export interface UserPreferences {
    preferences: Record<string, NotificationPreference>;
    emailDigest: "immediate" | "hourly" | "daily" | "never";
}

export interface WatchedAgent {
    id: string;
    name: string;
    createdBy: string;
    watchedAt: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const now = new Date("2024-05-20T14:00:00Z"); // Fixed base time for consistency
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000);
const m = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000);

const formatTime = (d: Date) => {
    const hours = d.getUTCHours();
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

const formatDate = (d: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getUTCMonth()];
    const day = d.getUTCDate();

    // Deterministic "Today" check using UTC
    const isToday = d.getUTCFullYear() === now.getUTCFullYear() &&
        d.getUTCMonth() === now.getUTCMonth() &&
        d.getUTCDate() === now.getUTCDate();

    if (isToday) return "Today";
    return `${month} ${day}`;
};

export const mockNotifications: Notification[] = [
<<<<<<< HEAD
=======
    // ── IM Messages ─────────────────────────────────────────────────────────
    {
        id: "n-im01",
        userId: "u1",
        type: "im_new_message",
        title: "Priya Rajan sent you a message",
        message: '"Can we add a section on personalization? It\'s super relevant to our ICP right now."',
        status: "unread",
        priority: "low",
        category: "messages",
        deepLink: "/opal/messages?conversation=pr",
        actionRequired: false,
        createdAt: m(2),
        timestamp: formatTime(m(2)),
        date: formatDate(m(2)),
        author: { name: "Priya Rajan", avatar: "https://i.pravatar.cc/150?img=44" },
    },
    {
        id: "n-im02",
        userId: "u1",
        type: "im_mention",
        title: "Marcus Santos mentioned you in Black Friday Campaign",
        message: '"@erika can you review the brief before EOD? Need your sign-off."',
        status: "unread",
        priority: "medium",
        category: "messages",
        deepLink: "/opal/messages?conversation=bf",
        actionRequired: true,
        createdAt: m(8),
        timestamp: formatTime(m(8)),
        date: formatDate(m(8)),
        author: { name: "Marcus Santos", avatar: "https://i.pravatar.cc/150?img=68" },
    },
    {
        id: "n-im03",
        userId: "u1",
        type: "im_thread_reply",
        title: "Priya Rajan replied in your thread",
        message: 'Thread on "Can we review the Q3 blog?" — 2 new replies since your last visit.',
        status: "unread",
        priority: "low",
        category: "messages",
        deepLink: "/opal/messages?conversation=pr",
        actionRequired: false,
        createdAt: m(15),
        timestamp: formatTime(m(15)),
        date: formatDate(m(15)),
        author: { name: "Priya Rajan", avatar: "https://i.pravatar.cc/150?img=44" },
    },
>>>>>>> origin/main
    // ── Approval Required ───────────────────────────────────────────────────
    {
        id: "n-a01",
        userId: "u1",
        type: "agent_execution_autonomous",
        title: "Voice-of-Customer Analyzer ran autonomously",
        message:
            'Scheduled run completed. Analyzed 847 customer feedback entries and generated sentiment report for Q1 review.',
        status: "unread",
        priority: "low",
        category: "agent_execution",
        agentId: "a-voc",
        agentName: "Voice-of-Customer Analyzer",
        agentVersion: "V2",
        executionId: "ex-a01",
        deepLink: "/opal/notifications/ex-a01",
        actionRequired: false,
        createdAt: m(3),
        timestamp: formatTime(m(3)),
        date: formatDate(m(3)),
        executionStatus: "success",
        duration: "2m 14s",
        author: { name: "system", avatar: null },
        triggeredBy: { type: "scheduler", name: "Daily Schedule" },
    },
    {
        id: "n-a02",
        userId: "u1",
        type: "approval_required",
        title: "Tool access request: Shopify Product Feed",
        message:
            'Sarah Chen is requesting access to the Shopify Product Feed connector for the Marketing Automation workspace. Approve or deny this tool request.',
        status: "unread",
        priority: "high",
        category: "tools",
        deepLink: "/opal/tools/shopify-feed/access-request",
        actionRequired: true,
        approvalRequired: true,
        approvalType: "opal_admin",
        createdAt: m(7),
        timestamp: formatTime(m(7)),
        date: formatDate(m(7)),
        author: { name: "Sarah Chen", avatar: null },
    },
    {
        id: "n-a03",
        userId: "u1",
        type: "approval_required",
        title: "Content ready for review: Holiday Campaign",
        message:
            'The "Holiday Campaign" content creation step is complete. 12 assets across 4 languages are ready for your review before moving to the next workflow step.',
        status: "unread",
        priority: "high",
        category: "collaboration",
        deepLink: "/cms/workflows/holiday-campaign/review",
        actionRequired: true,
        approvalRequired: true,
        approvalType: "cmp_workflow",
        createdAt: m(15),
        timestamp: formatTime(m(15)),
        date: formatDate(m(15)),
        author: { name: "Content Localizer", avatar: null },
    },

    // ── Agent Execution ─────────────────────────────────────────────────────
    {
        id: "n-001",
        userId: "u1",
        type: "agent_execution_failed",
        title: "Hypothesis Creator failed",
        message:
            "Execution b2953c08 hit a tool timeout after 62.45s. Workflow halted at Hypothesis Creator.",
        status: "unread",
        priority: "critical",
        category: "agent_execution",
        agentId: "a1",
        agentName: "Hypothesis Creator",
        agentVersion: "V15",
        executionId: "b2953c08",
        workflowId: "wf-001",
        errorType: "Tool Timeout",
        deepLink: "/opal/notifications/b2953c08",
        actionRequired: true,
        createdAt: m(5),
        timestamp: formatTime(m(5)),
        date: formatDate(m(5)),
        executionStatus: "failed",
        errorSource: "Agent",
        duration: "62.45s",
        author: { name: "bigmonkiki", avatar: null },
        triggeredBy: { type: "scheduler", name: "Daily 7AM Run" },
    },
    // groups with n-001: same agent + scheduler + failed, 4 min gap
    {
        id: "n-057",
        userId: "u1",
        type: "agent_execution_failed",
        title: "Hypothesis Creator failed — retry also timed out",
        message:
            "Automatic retry of execution b2953c08 also hit a tool timeout after 62.10s. Workflow permanently halted.",
        status: "unread",
        priority: "critical",
        category: "agent_execution",
        agentId: "a1",
        agentName: "Hypothesis Creator",
        agentVersion: "V15",
        executionId: "b2953c08-r2",
        workflowId: "wf-001",
        errorType: "Tool Timeout",
        deepLink: "/opal/notifications/b2953c08-r2",
        actionRequired: true,
        createdAt: m(9),
        timestamp: formatTime(m(9)),
        date: formatDate(m(9)),
        executionStatus: "failed",
        errorSource: "Agent",
        duration: "62.10s",
        author: { name: "bigmonkiki", avatar: null },
        triggeredBy: { type: "scheduler", name: "Daily 7AM Run" },
    },
    {
        id: "n-002",
        userId: "u1",
        type: "agent_execution_chat",
        title: "Content Localizer completed",
        message:
            'Chat-triggered execution finished successfully. Result: "Campaign copy translated to 4 languages."',
        status: "read",
        priority: "low",
        category: "agent_execution",
        agentId: "a2",
        agentName: "Content Localizer",
        agentVersion: "V12",
        executionId: "d8k2o19s",
        deepLink: "/opal/notifications/d8k2o19s",
        actionRequired: false,
        createdAt: m(12),
        timestamp: formatTime(m(12)),
        date: formatDate(m(12)),
        executionStatus: "success",
        duration: "12.20s",
        author: { name: "bigmonkiki", avatar: null },
        triggeredBy: { type: "user", name: "bigmonkiki", username: "bigmonkiki" },
    },
    // groups with n-002: same agent + user + chat, 4 min gap
    {
        id: "n-059",
        userId: "u1",
        type: "agent_execution_chat",
        title: "Content Localizer completed — follow-up run",
        message:
            'Follow-up chat execution finished successfully. Translated 3 additional copy variants into US English.',
        status: "read",
        priority: "low",
        category: "agent_execution",
        agentId: "a2",
        agentName: "Content Localizer",
        agentVersion: "V12",
        executionId: "d8k2o19s-2",
        deepLink: "/opal/notifications/d8k2o19s-2",
        actionRequired: false,
        createdAt: m(8),
        timestamp: formatTime(m(8)),
        date: formatDate(m(8)),
        executionStatus: "success",
        duration: "9.80s",
        author: { name: "bigmonkiki", avatar: null },
        triggeredBy: { type: "user", name: "bigmonkiki", username: "bigmonkiki" },
    },
    {
        id: "n-003",
        userId: "u1",
        type: "agent_execution_failed",
        title: "Web Researcher failed",
        message:
            "Trigger timeout after 120s. The in-app event trigger did not respond.",
        status: "unread",
        priority: "high",
        category: "agent_execution",
        agentId: "a3",
        agentName: "Web Researcher",
        agentVersion: "V8",
        executionId: "f9s2m10x",
        workflowId: "wf-003",
        errorType: "Trigger Timeout",
        deepLink: "/opal/notifications/f9s2m10x",
        actionRequired: true,
        createdAt: m(30),
        timestamp: formatTime(m(30)),
        date: formatDate(m(30)),
        executionStatus: "failed",
        errorSource: "Trigger: In-app Event",
        duration: "120.0s",
        author: { name: "bigmonkiki", avatar: null },
        triggeredBy: { type: "in_app", name: "In-App Event Trigger" },
    },
    {
        id: "n-004",
        userId: "u1",
        type: "agent_execution_autonomous",
        title: "Email Composer ran autonomously",
        message:
            'Scheduled autonomous run completed. Generated 12 email variants for "Spring Sale" campaign.',
        status: "read",
        priority: "low",
        category: "agent_execution",
        agentId: "a4",
        agentName: "Email Composer",
        agentVersion: "V5",
        executionId: "ex-004",
        deepLink: "/opal/notifications/ex-004",
        actionRequired: false,
        createdAt: h(1),
        timestamp: formatTime(h(1)),
        date: formatDate(h(1)),
        executionStatus: "success",
        duration: "45.30s",
        author: { name: "system", avatar: null },
        triggeredBy: { type: "scheduler", name: "Hourly Schedule" },
    },
    {
        id: "n-005",
        userId: "u1",
        type: "agent_execution_long_running",
        title: "Data Pipeline Agent in progress",
        message:
            "Long-running execution started 45 minutes ago. Processing 2.3M records. Currently at 72% completion.",
        status: "unread",
        priority: "medium",
        category: "agent_execution",
        agentId: "a5",
        agentName: "Data Pipeline Agent",
        agentVersion: "V3",
        executionId: "ex-005",
        deepLink: "/opal/notifications/ex-005",
        actionRequired: false,
        createdAt: m(45),
        timestamp: formatTime(m(45)),
        date: formatDate(m(45)),
        duration: "45m+",
        triggeredBy: { type: "api", name: "ETL Pipeline API" },
    },
    {
        id: "n-006",
        userId: "u1",
        type: "agent_execution_chat",
        title: "SEO Analyzer completed",
        message:
            'Chat execution finished. Found 14 optimization opportunities for "/products/sneakers".',
        status: "read",
        priority: "low",
        category: "agent_execution",
        agentId: "a6",
        agentName: "SEO Analyzer",
        agentVersion: "V9",
        executionId: "ex-006",
        deepLink: "/opal/notifications/ex-006",
        actionRequired: false,
        createdAt: h(2),
        timestamp: formatTime(h(2)),
        date: formatDate(h(2)),
        executionStatus: "success",
        duration: "8.12s",
        triggeredBy: {
            type: "user",
            name: "Sarah Chen",
            username: "sarah.chen",
        },
    },
    {
        id: "n-007",
        userId: "u1",
        type: "agent_execution_failed",
        title: "Social Media Publisher failed",
        message:
            "API rate limit exceeded on X/Twitter. 3 of 8 posts were not published.",
        status: "read",
        priority: "high",
        category: "agent_execution",
        agentId: "a7",
        agentName: "Social Media Publisher",
        agentVersion: "V6",
        executionId: "ex-007",
        errorType: "API Rate Limit",
        deepLink: "/opal/notifications/ex-007",
        actionRequired: true,
        createdAt: m(20),
        timestamp: formatTime(m(20)),
        date: formatDate(m(20)),
        executionStatus: "failed",
        errorSource: "Tool: X/Twitter API",
        duration: "34.50s",
        triggeredBy: { type: "scheduler", name: "Daily 9AM Post Schedule" },
    },
    // groups with n-007: same agent + scheduler + failed, 3 min gap
    {
        id: "n-060",
        userId: "u1",
        type: "agent_execution_failed",
        title: "Social Media Publisher failed — retry",
        message:
            "Retry attempt still hitting X/Twitter rate limit. 5 of 8 posts remain unpublished.",
        status: "read",
        priority: "high",
        category: "agent_execution",
        agentId: "a7",
        agentName: "Social Media Publisher",
        agentVersion: "V6",
        executionId: "ex-007-r2",
        errorType: "API Rate Limit",
        deepLink: "/opal/notifications/ex-007-r2",
        actionRequired: true,
        createdAt: m(17),
        timestamp: formatTime(m(17)),
        date: formatDate(m(17)),
        executionStatus: "failed",
        errorSource: "Tool: X/Twitter API",
        duration: "28.10s",
        triggeredBy: { type: "scheduler", name: "Daily 9AM Post Schedule" },
    },
    {
        id: "n-008",
        userId: "u1",
        type: "agent_execution_autonomous",
        title: "A/B Test Analyzer completed",
        message:
            'Autonomous analysis finished. Experiment "CTA Button Color" has reached statistical significance (p=0.003).',
        status: "read",
        priority: "medium",
        category: "agent_execution",
        agentId: "a8",
        agentName: "A/B Test Analyzer",
        agentVersion: "V4",
        executionId: "ex-008",
        deepLink: "/opal/notifications/ex-008",
        actionRequired: true,
        createdAt: m(50),
        timestamp: formatTime(m(50)),
        date: formatDate(m(50)),
        executionStatus: "success",
        duration: "180.00s",
        triggeredBy: { type: "system", name: "Significance Monitor" },
    },

    // ── Guardrail Notifications ─────────────────────────────────────────────
    {
        id: "n-009",
        userId: "u1",
        type: "guardrail_observer",
        title: "Guardrail Warning — Review recommended",
        message:
            'Content Localizer output flagged by "Brand Voice" guardrail in observer mode. Score: 65/100.',
        status: "unread",
        priority: "medium",
        category: "guardrail",
        agentId: "a2",
        agentName: "Content Localizer",
        agentVersion: "V12",
        executionId: "ex-009",
        guardrailType: "Brand Voice",
        deepLink: "/opal/notifications/ex-009",
        actionRequired: false,
        createdAt: m(15),
        timestamp: formatTime(m(15)),
        date: formatDate(m(15)),
        guardrailStatus: "warning",
    },
    {
        id: "n-010",
        userId: "u1",
        type: "guardrail_enforcer",
        title: "Guardrail Blocked — Execution terminated",
        message:
            'Email Composer output blocked by "PII Detection" guardrail. Found 3 instances of unmasked email addresses.',
        status: "unread",
        priority: "critical",
        category: "guardrail",
        agentId: "a4",
        agentName: "Email Composer",
        agentVersion: "V5",
        executionId: "ex-010",
        guardrailType: "PII Detection",
        deepLink: "/opal/notifications/ex-010",
        actionRequired: true,
        createdAt: m(8),
        timestamp: formatTime(m(8)),
        date: formatDate(m(8)),
        guardrailStatus: "terminated",
    },
    // groups with n-010: same agent + no trigger + guardrail_enforcer, 4 min gap
    {
        id: "n-058",
        userId: "u1",
        type: "guardrail_enforcer",
        title: "Guardrail blocked — PII in retry attempt",
        message:
            'Second execution of Email Composer also blocked by "PII Detection" guardrail. 1 additional unmasked phone number found.',
        status: "unread",
        priority: "critical",
        category: "guardrail",
        agentId: "a4",
        agentName: "Email Composer",
        agentVersion: "V5",
        executionId: "ex-058",
        guardrailType: "PII Detection",
        deepLink: "/opal/notifications/n-058",
        actionRequired: true,
        createdAt: m(4),
        timestamp: formatTime(m(4)),
        date: formatDate(m(4)),
        guardrailStatus: "terminated",
    },
    {
        id: "n-011",
        userId: "u1",
        type: "guardrail_quality",
        title: "Quality score dropped below threshold",
        message:
            'Hypothesis Creator quality score fell to 58% (threshold: 70%). Triggered by last 5 executions.',
        status: "unread",
        priority: "high",
        category: "guardrail",
        agentId: "a1",
        agentName: "Hypothesis Creator",
        agentVersion: "V15",
        guardrailType: "Quality Score",
        deepLink: "/opal/notifications/n-011",
        actionRequired: true,
        createdAt: m(25),
        timestamp: formatTime(m(25)),
        date: formatDate(m(25)),
        guardrailStatus: "failed",
    },
    {
        id: "n-012",
        userId: "u1",
        type: "guardrail_observer",
        title: "Guardrail observation logged",
        message:
            'SEO Analyzer output logged by "Factual Accuracy" guardrail. No issues detected. Score: 94/100.',
        status: "read",
        priority: "low",
        category: "guardrail",
        agentId: "a6",
        agentName: "SEO Analyzer",
        agentVersion: "V9",
        guardrailType: "Factual Accuracy",
        deepLink: "/opal/notifications/n-012",
        actionRequired: false,
        createdAt: h(3),
        timestamp: formatTime(h(3)),
        date: formatDate(h(3)),
        guardrailStatus: "success",
    },
    {
        id: "n-013",
        userId: "u1",
        type: "guardrail_enforcer",
        title: "Guardrail enforcement — Content rewritten",
        message:
            'Social Media Publisher output modified by "Compliance" guardrail. Removed 2 unapproved claims.',
        status: "read",
        priority: "high",
        category: "guardrail",
        agentId: "a7",
        agentName: "Social Media Publisher",
        agentVersion: "V6",
        guardrailType: "Compliance",
        deepLink: "/opal/notifications/n-013",
        actionRequired: true,
        createdAt: h(1.5),
        timestamp: formatTime(h(1.5)),
        date: formatDate(h(1.5)),
        guardrailStatus: "triggered",
    },

    // ── Directory Notifications ─────────────────────────────────────────────
    {
        id: "n-014",
        userId: "u1",
        type: "directory_new_agent",
        title: "New agent available: Competitor Monitor",
        message:
            "A new agent has been published to the directory. Tracks competitor pricing and product changes across 50+ sites.",
        status: "read",
        priority: "low",
        category: "directory",
        agentName: "Competitor Monitor",
        deepLink: "/opal/agents/directory/competitor-monitor",
        actionRequired: false,
        createdAt: h(2),
        timestamp: formatTime(h(2)),
        date: formatDate(h(2)),
        author: { name: "Optimizely", avatar: null },
    },
    {
        id: "n-015",
        userId: "u1",
        type: "directory_update_available",
        title: "Update available: Content Localizer V13",
        message:
            "A new version is available with improved language detection and 40% faster translations.",
        status: "read",
        priority: "medium",
        category: "directory",
        agentId: "a2",
        agentName: "Content Localizer",
        agentVersion: "V13",
        deepLink: "/opal/agents/content-localizer/update",
        actionRequired: false,
        createdAt: h(4),
        timestamp: formatTime(h(4)),
        date: formatDate(h(4)),
        author: { name: "Optimizely", avatar: null },
    },
    {
        id: "n-016",
        userId: "u1",
        type: "directory_install_request",
        title: "Install request: Data Analyzer",
        message:
            'John Doe (Marketing) is requesting to install "Data Analyzer" for the marketing team workspace.',
        status: "read",
        priority: "high",
        category: "directory",
        agentName: "Data Analyzer",
        deepLink: "/opal/notifications/n-016",
        actionRequired: true,
        createdAt: m(35),
        timestamp: formatTime(m(35)),
        date: formatDate(m(35)),
        author: { name: "John Doe", avatar: null },
        triggeredBy: { type: "user", name: "John Doe", username: "john.doe" },
    },
    {
        id: "n-017",
        userId: "u1",
        type: "directory_new_agent",
        title: "New agent available: Brand Guardian",
        message:
            "Automatically monitors all content outputs for brand consistency across voice, tone, and visual guidelines.",
        status: "read",
        priority: "low",
        category: "directory",
        agentName: "Brand Guardian",
        deepLink: "/opal/agents/directory/brand-guardian",
        actionRequired: false,
        createdAt: h(8),
        timestamp: formatTime(h(8)),
        date: formatDate(h(8)),
        author: { name: "Optimizely", avatar: null },
    },
    {
        id: "n-018",
        userId: "u1",
        type: "directory_install_request",
        title: "Install request: Customer Insights Engine",
        message:
            'Emily Park (Product) is requesting to install "Customer Insights Engine" for the product team.',
        status: "read",
        priority: "high",
        category: "directory",
        agentName: "Customer Insights Engine",
        deepLink: "/opal/notifications/n-018",
        actionRequired: true,
        createdAt: h(1),
        timestamp: formatTime(h(1)),
        date: formatDate(h(1)),
        author: { name: "Emily Park", avatar: null },
        triggeredBy: {
            type: "user",
            name: "Emily Park",
            username: "emily.park",
        },
    },
    {
        id: "n-019",
        userId: "u1",
        type: "directory_update_available",
        title: "Update available: Hypothesis Creator V16",
        message:
            "Major update includes fix for the computation timeout issue and improved prompt chain.",
        status: "read",
        priority: "medium",
        category: "directory",
        agentId: "a1",
        agentName: "Hypothesis Creator",
        agentVersion: "V16",
        deepLink: "/opal/agents/hypothesis-creator/update",
        actionRequired: false,
        createdAt: h(5),
        timestamp: formatTime(h(5)),
        date: formatDate(h(5)),
        author: { name: "Optimizely", avatar: null },
    },

    // ── Tools & Connections ─────────────────────────────────────────────────
    {
        id: "n-020",
        userId: "u1",
        type: "tools_new_available",
        title: "New tool: Google Analytics 4 Connector",
        message:
            "A new GA4 integration is available. Connect your analytics data to enable audience insights and performance tracking agents.",
        status: "read",
        priority: "low",
        category: "tools",
        deepLink: "/opal/tools/ga4-connector",
        actionRequired: false,
        createdAt: h(6),
        timestamp: formatTime(h(6)),
        date: formatDate(h(6)),
    },
    {
        id: "n-021",
        userId: "u1",
        type: "tools_deprecated",
        title: "Tool deprecation notice: Legacy CRM Connector",
        message:
            'The "Legacy CRM Connector" will be deprecated on March 1, 2026. Please migrate to the new CRM v2 connector.',
        status: "read",
        priority: "high",
        category: "tools",
        deepLink: "/opal/tools/legacy-crm",
        actionRequired: true,
        createdAt: h(12),
        timestamp: formatTime(h(12)),
        date: formatDate(h(12)),
    },
    {
        id: "n-022",
        userId: "u1",
        type: "tools_auth_required",
        title: "Authentication required: Salesforce",
        message:
            "The Salesforce connection requires re-authentication. 3 agents depend on this connection.",
        status: "read",
        priority: "critical",
        category: "tools",
        deepLink: "/opal/connections/salesforce",
        actionRequired: true,
        createdAt: m(10),
        timestamp: formatTime(m(10)),
        date: formatDate(m(10)),
    },
    {
        id: "n-023",
        userId: "u1",
        type: "tools_auth_expired",
        title: "Auth expired: Slack Integration",
        message:
            "Your Slack OAuth token has expired. Notification delivery to Slack channels is paused.",
        status: "read",
        priority: "high",
        category: "tools",
        deepLink: "/opal/connections/slack",
        actionRequired: true,
        createdAt: h(3),
        timestamp: formatTime(h(3)),
        date: formatDate(h(3)),
    },
    {
        id: "n-024",
        userId: "u1",
        type: "tools_new_available",
        title: "New tool: Figma Design Importer",
        message:
            "Import Figma designs directly into your content workflows. Supports auto-extraction of images, copy, and layout.",
        status: "read",
        priority: "low",
        category: "tools",
        deepLink: "/opal/tools/figma-importer",
        actionRequired: false,
        createdAt: h(24),
        timestamp: formatTime(h(24)),
        date: formatDate(h(24)),
    },
    {
        id: "n-025",
        userId: "u1",
        type: "tools_auth_required",
        title: "Authentication required: HubSpot",
        message:
            "Your HubSpot API key is nearing its expiry. Please rotate the key to avoid disruption.",
        status: "read",
        priority: "medium",
        category: "tools",
        deepLink: "/opal/connections/hubspot",
        actionRequired: true,
        createdAt: h(18),
        timestamp: formatTime(h(18)),
        date: formatDate(h(18)),
    },

    // ── Collaboration ───────────────────────────────────────────────────────
    {
        id: "n-026",
        userId: "u1",
        type: "collaboration_agent_modified",
        title: "Agent modified: Content Localizer",
        message:
            "Sarah Chen updated the prompt chain and added a new output format for Content Localizer.",
        status: "read",
        priority: "medium",
        category: "collaboration",
        agentId: "a2",
        agentName: "Content Localizer",
        agentVersion: "V12",
        deepLink: "/opal/agents/a2/history",
        actionRequired: false,
        createdAt: m(40),
        timestamp: formatTime(m(40)),
        date: formatDate(m(40)),
        author: { name: "Sarah Chen", avatar: null },
    },
    {
        id: "n-027",
        userId: "u1",
        type: "collaboration_agent_activated",
        title: "Agent activated: Campaign Optimizer",
        message:
            "Mike Johnson activated Campaign Optimizer in the production environment.",
        status: "read",
        priority: "medium",
        category: "collaboration",
        agentName: "Campaign Optimizer",
        deepLink: "/opal/agents/campaign-optimizer",
        actionRequired: false,
        createdAt: h(1),
        timestamp: formatTime(h(1)),
        date: formatDate(h(1)),
        author: { name: "Mike Johnson", avatar: null },
    },
    {
        id: "n-028",
        userId: "u1",
        type: "collaboration_agent_deactivated",
        title: "Agent deactivated: Legacy Email Writer",
        message:
            'Admin "Operations Team" deactivated Legacy Email Writer. Reason: replaced by Email Composer V5.',
        status: "read",
        priority: "low",
        category: "collaboration",
        agentName: "Legacy Email Writer",
        deepLink: "/opal/agents/legacy-email-writer",
        actionRequired: false,
        createdAt: h(10),
        timestamp: formatTime(h(10)),
        date: formatDate(h(10)),
        author: { name: "Operations Team", avatar: null },
    },
    {
        id: "n-029",
        userId: "u1",
        type: "collaboration_agent_modified",
        title: "Agent modified: Hypothesis Creator",
        message:
            "You updated the timeout configuration and added retry logic to Hypothesis Creator.",
        status: "read",
        priority: "low",
        category: "collaboration",
        agentId: "a1",
        agentName: "Hypothesis Creator",
        agentVersion: "V15",
        deepLink: "/opal/agents/a1/history",
        actionRequired: false,
        createdAt: h(5),
        timestamp: formatTime(h(5)),
        date: formatDate(h(5)),
        author: { name: "bigmonkiki", avatar: null },
    },
    {
        id: "n-030",
        userId: "u1",
        type: "collaboration_agent_activated",
        title: "Agent activated: SEO Analyzer",
        message:
            "Lisa Wang activated SEO Analyzer for the marketing workspace.",
        status: "read",
        priority: "low",
        category: "collaboration",
        agentId: "a6",
        agentName: "SEO Analyzer",
        deepLink: "/opal/agents/a6",
        actionRequired: false,
        createdAt: h(14),
        timestamp: formatTime(h(14)),
        date: formatDate(h(14)),
        author: { name: "Lisa Wang", avatar: null },
    },

    // ── System Announcements ────────────────────────────────────────────────
    {
        id: "n-031",
        userId: "u1",
        type: "system_announcement",
        title: "New feature: Workflow Builder V2",
        message:
            "The all-new Workflow Builder is here with drag-and-drop, branching logic, and real-time collaboration.",
        status: "read",
        priority: "low",
        category: "system",
        deepLink: "/opal/announcements/workflow-builder-v2",
        actionRequired: false,
        createdAt: h(6),
        timestamp: formatTime(h(6)),
        date: formatDate(h(6)),
    },
    {
        id: "n-032",
        userId: "u1",
        type: "system_maintenance",
        title: "Scheduled maintenance: Feb 15, 2-4 AM EST",
        message:
            "Opal will undergo scheduled maintenance. Agent executions will be paused during this window.",
        status: "read",
        priority: "medium",
        category: "system",
        deepLink: "/opal/announcements/maintenance-feb-15",
        actionRequired: false,
        createdAt: h(8),
        timestamp: formatTime(h(8)),
        date: formatDate(h(8)),
    },
    {
        id: "n-033",
        userId: "u1",
        type: "system_announcement",
        title: "Opal is now SOC 2 Type II certified",
        message:
            "We're excited to announce that Opal has achieved SOC 2 Type II compliance. Learn more about our security posture.",
        status: "read",
        priority: "low",
        category: "system",
        deepLink: "/opal/announcements/soc2",
        actionRequired: false,
        createdAt: h(48),
        timestamp: formatTime(h(48)),
        date: formatDate(h(48)),
    },

    // ── More Agent Execution ────────────────────────────────────────────────
    {
        id: "n-034",
        userId: "u1",
        type: "agent_execution_chat",
        title: "Image Generator completed",
        message:
            'Generated 6 hero banner variations for "Summer Collection" campaign.',
        status: "read",
        priority: "low",
        category: "agent_execution",
        agentName: "Image Generator",
        agentVersion: "V2",
        executionId: "ex-034",
        deepLink: "/opal/notifications/ex-034",
        actionRequired: false,
        createdAt: m(55),
        timestamp: formatTime(m(55)),
        date: formatDate(m(55)),
        executionStatus: "success",
        duration: "23.40s",
        triggeredBy: { type: "user", name: "bigmonkiki" },
    },
    {
        id: "n-035",
        userId: "u1",
        type: "agent_execution_failed",
        title: "Audience Segmenter failed",
        message:
            "Memory limit exceeded while processing 5M user profiles. Consider filtering the input dataset.",
        status: "read",
        priority: "high",
        category: "agent_execution",
        agentName: "Audience Segmenter",
        agentVersion: "V7",
        executionId: "ex-035",
        errorType: "Memory Limit Exceeded",
        deepLink: "/opal/notifications/ex-035",
        actionRequired: true,
        createdAt: h(1.5),
        timestamp: formatTime(h(1.5)),
        date: formatDate(h(1.5)),
        executionStatus: "failed",
        errorSource: "System",
        duration: "90.00s",
    },
    {
        id: "n-036",
        userId: "u1",
        type: "agent_execution_autonomous",
        title: "Newsletter Curator ran autonomously",
        message:
            "Weekly newsletter curated with 8 articles. Preview available for review.",
        status: "read",
        priority: "medium",
        category: "agent_execution",
        agentName: "Newsletter Curator",
        agentVersion: "V3",
        executionId: "ex-036",
        deepLink: "/opal/notifications/ex-036",
        actionRequired: true,
        createdAt: h(2),
        timestamp: formatTime(h(2)),
        date: formatDate(h(2)),
        executionStatus: "success",
        duration: "55.20s",
        triggeredBy: { type: "scheduler", name: "Weekly Monday 8AM" },
    },
    {
        id: "n-037",
        userId: "u1",
        type: "agent_execution_long_running",
        title: "Content Migration Agent still running",
        message:
            "Migrating 12,000 pages from legacy CMS. Currently at 45% (5,400/12,000 pages). ETA: 2 hours.",
        status: "read",
        priority: "medium",
        category: "agent_execution",
        agentName: "Content Migration Agent",
        agentVersion: "V1",
        executionId: "ex-037",
        deepLink: "/opal/notifications/ex-037",
        actionRequired: false,
        createdAt: h(1),
        timestamp: formatTime(h(1)),
        date: formatDate(h(1)),
        duration: "1h+",
    },
    {
        id: "n-038",
        userId: "u1",
        type: "agent_execution_chat",
        title: "Personalization Engine completed",
        message:
            "Generated personalized hero sections for 5 audience segments. Ready for A/B testing.",
        status: "read",
        priority: "low",
        category: "agent_execution",
        agentName: "Personalization Engine",
        agentVersion: "V4",
        executionId: "ex-038",
        deepLink: "/opal/notifications/ex-038",
        actionRequired: false,
        createdAt: h(4),
        timestamp: formatTime(h(4)),
        date: formatDate(h(4)),
        executionStatus: "success",
        duration: "15.80s",
        triggeredBy: { type: "user", name: "Sarah Chen" },
    },

    // ── More Guardrails ─────────────────────────────────────────────────────
    {
        id: "n-039",
        userId: "u1",
        type: "guardrail_enforcer",
        title: "Guardrail blocked — Toxicity detected",
        message:
            "Social Media Publisher output blocked by toxicity guardrail. Detected potentially offensive language in post #3.",
        status: "read",
        priority: "critical",
        category: "guardrail",
        agentId: "a7",
        agentName: "Social Media Publisher",
        guardrailType: "Toxicity Detection",
        deepLink: "/opal/notifications/n-039",
        actionRequired: true,
        createdAt: m(18),
        timestamp: formatTime(m(18)),
        date: formatDate(m(18)),
        guardrailStatus: "terminated",
    },
    {
        id: "n-040",
        userId: "u1",
        type: "guardrail_observer",
        title: "Guardrail observation — Readability check",
        message:
            "Newsletter Curator output has readability score of 72 (target: 80). Content may be too complex for the target audience.",
        status: "read",
        priority: "medium",
        category: "guardrail",
        agentName: "Newsletter Curator",
        guardrailType: "Readability",
        deepLink: "/opal/notifications/n-040",
        actionRequired: false,
        createdAt: h(3),
        timestamp: formatTime(h(3)),
        date: formatDate(h(3)),
        guardrailStatus: "warning",
    },

    // ── More Tools ──────────────────────────────────────────────────────────
    {
        id: "n-041",
        userId: "u1",
        type: "tools_deprecated",
        title: "Tool sunset: Google Universal Analytics",
        message:
            "Google Universal Analytics connector is being removed on April 1, 2026. Please switch to GA4.",
        status: "read",
        priority: "medium",
        category: "tools",
        deepLink: "/opal/tools/google-ua",
        actionRequired: true,
        createdAt: h(36),
        timestamp: formatTime(h(36)),
        date: formatDate(h(36)),
    },
    {
        id: "n-042",
        userId: "u1",
        type: "tools_new_available",
        title: "New tool: Shopify Product Feed",
        message:
            "Sync your Shopify catalog directly into Opal workflows for product-aware content generation.",
        status: "read",
        priority: "low",
        category: "tools",
        deepLink: "/opal/tools/shopify-feed",
        actionRequired: false,
        createdAt: h(16),
        timestamp: formatTime(h(16)),
        date: formatDate(h(16)),
    },

    // ── More Collaboration ──────────────────────────────────────────────────
    {
        id: "n-043",
        userId: "u1",
        type: "collaboration_agent_modified",
        title: "Agent modified: A/B Test Analyzer",
        message:
            "David Kim added Bayesian analysis mode and updated the significance threshold in A/B Test Analyzer.",
        status: "read",
        priority: "medium",
        category: "collaboration",
        agentName: "A/B Test Analyzer",
        deepLink: "/opal/agents/a8/history",
        actionRequired: false,
        createdAt: h(3),
        timestamp: formatTime(h(3)),
        date: formatDate(h(3)),
        author: { name: "David Kim", avatar: null },
    },
    {
        id: "n-044",
        userId: "u1",
        type: "collaboration_agent_deactivated",
        title: "Agent paused: Data Pipeline Agent",
        message:
            "System automatically paused Data Pipeline Agent after 3 consecutive failures in the last hour.",
        status: "read",
        priority: "critical",
        category: "collaboration",
        agentId: "a5",
        agentName: "Data Pipeline Agent",
        deepLink: "/opal/agents/a5",
        actionRequired: true,
        createdAt: m(22),
        timestamp: formatTime(m(22)),
        date: formatDate(m(22)),
        author: { name: "System", avatar: null },
    },

    // ── More System ─────────────────────────────────────────────────────────
    {
        id: "n-045",
        userId: "u1",
        type: "system_announcement",
        title: "Usage report: January 2026",
        message:
            "Your team ran 1,284 agent executions in January. Top agent: Content Localizer (342 runs). View full report.",
        status: "read",
        priority: "low",
        category: "system",
        deepLink: "/opal/reports/january-2026",
        actionRequired: false,
        createdAt: h(72),
        timestamp: formatTime(h(72)),
        date: formatDate(h(72)),
    },
    {
        id: "n-046",
        userId: "u1",
        type: "system_maintenance",
        title: "Emergency patch applied",
        message:
            "A hotfix was deployed to resolve the agent execution queue backlog. All pending executions have been requeued.",
        status: "read",
        priority: "high",
        category: "system",
        deepLink: "/opal/announcements/hotfix-feb-10",
        actionRequired: false,
        createdAt: h(20),
        timestamp: formatTime(h(20)),
        date: formatDate(h(20)),
    },

    // ── Additional diverse entries ──────────────────────────────────────────
    {
        id: "n-047",
        userId: "u1",
        type: "agent_execution_chat",
        title: "Copy Editor completed",
        message:
            "Proofread and corrected 14 pages of product descriptions. 23 edits made.",
        status: "read",
        priority: "low",
        category: "agent_execution",
        agentName: "Copy Editor",
        agentVersion: "V11",
        executionId: "ex-047",
        deepLink: "/opal/notifications/ex-047",
        actionRequired: false,
        createdAt: h(7),
        timestamp: formatTime(h(7)),
        date: formatDate(h(7)),
        executionStatus: "success",
        duration: "30.10s",
        triggeredBy: { type: "user", name: "Lisa Wang" },
    },
    {
        id: "n-048",
        userId: "u1",
        type: "agent_execution_failed",
        title: "Translation Agent failed",
        message:
            "Unsupported target language: Klingon. Please use a supported ISO 639-1 language code.",
        status: "read",
        priority: "medium",
        category: "agent_execution",
        agentName: "Translation Agent",
        agentVersion: "V2",
        executionId: "ex-048",
        errorType: "Invalid Input",
        deepLink: "/opal/notifications/ex-048",
        actionRequired: false,
        createdAt: h(15),
        timestamp: formatTime(h(15)),
        date: formatDate(h(15)),
        executionStatus: "failed",
        errorSource: "Input Validation",
        duration: "0.5s",
    },
    {
        id: "n-049",
        userId: "u1",
        type: "guardrail_quality",
        title: "Quality score improved",
        message:
            "Email Composer quality score improved from 72% to 89% after recent prompt updates. Now above threshold.",
        status: "read",
        priority: "low",
        category: "guardrail",
        agentName: "Email Composer",
        guardrailType: "Quality Score",
        deepLink: "/opal/notifications/n-049",
        actionRequired: false,
        createdAt: h(6),
        timestamp: formatTime(h(6)),
        date: formatDate(h(6)),
        guardrailStatus: "success",
    },
    {
        id: "n-050",
        userId: "u1",
        type: "collaboration_agent_modified",
        title: "Agent modified: Social Media Publisher",
        message:
            "You added Instagram Reels support and updated the content calendar integration.",
        status: "read",
        priority: "low",
        category: "collaboration",
        agentId: "a7",
        agentName: "Social Media Publisher",
        deepLink: "/opal/agents/a7/history",
        actionRequired: false,
        createdAt: h(9),
        timestamp: formatTime(h(9)),
        date: formatDate(h(9)),
        author: { name: "bigmonkiki", avatar: null },
    },
    {
        id: "n-051",
        userId: "u1",
        type: "directory_new_agent",
        title: "New agent available: Voice-of-Customer Analyzer",
        message:
            "Analyzes support tickets, reviews, and NPS surveys to surface product improvement opportunities.",
        status: "read",
        priority: "low",
        category: "directory",
        agentName: "Voice-of-Customer Analyzer",
        deepLink: "/opal/agents/directory/voc-analyzer",
        actionRequired: false,
        createdAt: h(11),
        timestamp: formatTime(h(11)),
        date: formatDate(h(11)),
        author: { name: "Optimizely", avatar: null },
    },
    {
        id: "n-052",
        userId: "u1",
        type: "tools_auth_expired",
        title: "Auth expiring soon: Google Ads",
        message:
            "Your Google Ads OAuth token will expire in 3 days. Re-authenticate to avoid disruption.",
        status: "read",
        priority: "medium",
        category: "tools",
        deepLink: "/opal/connections/google-ads",
        actionRequired: true,
        createdAt: h(4),
        timestamp: formatTime(h(4)),
        date: formatDate(h(4)),
    },
    {
        id: "n-053",
        userId: "u1",
        type: "system_announcement",
        title: "New: Notification preferences",
        message:
            "You can now customize which notifications you receive and how. Visit Settings → Notifications.",
        status: "read",
        priority: "low",
        category: "system",
        deepLink: "/opal/settings/notifications",
        actionRequired: false,
        createdAt: h(2),
        timestamp: formatTime(h(2)),
        date: formatDate(h(2)),
    },
    {
        id: "n-054",
        userId: "u1",
        type: "agent_execution_autonomous",
        title: "Report Generator completed",
        message:
            "Weekly performance report generated for all active campaigns. PDF available for download.",
        status: "read",
        priority: "low",
        category: "agent_execution",
        agentName: "Report Generator",
        agentVersion: "V6",
        executionId: "ex-054",
        deepLink: "/opal/notifications/ex-054",
        actionRequired: false,
        createdAt: h(3),
        timestamp: formatTime(h(3)),
        date: formatDate(h(3)),
        executionStatus: "success",
        duration: "120.00s",
        triggeredBy: { type: "scheduler", name: "Weekly Friday 6PM" },
    },
    {
        id: "n-055",
        userId: "u1",
        type: "guardrail_enforcer",
        title: "Guardrail enforced — Copyright check",
        message:
            "Image Generator output blocked. 2 of 6 generated images flagged for potential copyright similarity.",
        status: "read",
        priority: "high",
        category: "guardrail",
        agentName: "Image Generator",
        guardrailType: "Copyright Detection",
        deepLink: "/opal/notifications/n-055",
        actionRequired: true,
        createdAt: m(42),
        timestamp: formatTime(m(42)),
        date: formatDate(m(42)),
        guardrailStatus: "triggered",
    },
    {
        id: "n-056",
        userId: "u1",
        type: "guardrail_support_ticket",
        title: "Guardrail violation linked to ticket #OPT-4821",
        message:
            'The PII Detection guardrail block on Email Composer (execution ex-010) has been automatically linked to support ticket #OPT-4821. Track resolution and view details in your support portal.',
        status: "unread",
        priority: "high",
        category: "guardrail",
        agentId: "a4",
        agentName: "Email Composer",
        agentVersion: "V5",
        executionId: "ex-010",
        guardrailType: "PII Detection",
        deepLink: "/opal/notifications/n-056",
        actionRequired: true,
        createdAt: m(6),
        timestamp: formatTime(m(6)),
        date: formatDate(m(6)),
        guardrailStatus: "terminated",
    },
];

// ─── User Preferences ────────────────────────────────────────────────────────

export const mockUserPreferences: UserPreferences = {
    preferences: {
        agent_execution_chat: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        agent_execution_autonomous: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        agent_execution_failed: {
            enabled: true,
            channels: ["in-app", "email", "slack"],
        },
        agent_execution_long_running: {
            enabled: true,
            channels: ["in-app"],
        },
        guardrail_observer: {
            enabled: true,
            channels: ["in-app"],
        },
        guardrail_enforcer: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        guardrail_quality: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        guardrail_support_ticket: {
            enabled: true,
            channels: ["in-app", "email", "slack"],
        },
        directory_new_agent: {
            enabled: true,
            channels: ["in-app"],
        },
        directory_update_available: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        directory_install_request: {
            enabled: true,
            channels: ["in-app", "email", "slack"],
        },
        tools_new_available: {
            enabled: false,
            channels: ["in-app"],
        },
        tools_deprecated: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        tools_auth_required: {
            enabled: true,
            channels: ["in-app", "email", "slack"],
        },
        tools_auth_expired: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        collaboration_agent_modified: {
            enabled: true,
            channels: ["in-app"],
        },
        collaboration_agent_activated: {
            enabled: true,
            channels: ["in-app"],
        },
        collaboration_agent_deactivated: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        system_announcement: {
            enabled: true,
            channels: ["in-app"],
        },
        system_maintenance: {
            enabled: true,
            channels: ["in-app", "email"],
        },
    },
    emailDigest: "daily",
};

// ─── Watched Agents ──────────────────────────────────────────────────────────

export const mockWatchedAgents: WatchedAgent[] = [
    {
        id: "a1",
        name: "Hypothesis Creator",
        createdBy: "me",
        watchedAt: "2025-12-15T10:00:00Z",
    },
    {
        id: "a2",
        name: "Content Localizer",
        createdBy: "Sarah Chen",
        watchedAt: "2026-01-03T14:30:00Z",
    },
    {
        id: "a4",
        name: "Email Composer",
        createdBy: "me",
        watchedAt: "2026-01-10T09:00:00Z",
    },
    {
        id: "a7",
        name: "Social Media Publisher",
        createdBy: "Mike Johnson",
        watchedAt: "2026-01-20T16:45:00Z",
    },
    {
        id: "a8",
        name: "A/B Test Analyzer",
        createdBy: "David Kim",
        watchedAt: "2026-02-01T11:20:00Z",
    },
];

// ─── Org Default Preferences ─────────────────────────────────────────────────

export const mockOrgDefaultPreferences: UserPreferences = {
    preferences: {
        agent_execution_chat: {
            enabled: true,
            channels: ["in-app"],
        },
        agent_execution_autonomous: {
            enabled: true,
            channels: ["in-app"],
        },
        agent_execution_failed: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        agent_execution_long_running: {
            enabled: true,
            channels: ["in-app"],
        },
        guardrail_observer: {
            enabled: false,
            channels: ["in-app"],
        },
        guardrail_enforcer: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        guardrail_quality: {
            enabled: true,
            channels: ["in-app"],
        },
        guardrail_support_ticket: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        directory_new_agent: {
            enabled: true,
            channels: ["in-app"],
        },
        directory_update_available: {
            enabled: true,
            channels: ["in-app"],
        },
        directory_install_request: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        tools_new_available: {
            enabled: false,
            channels: [],
        },
        tools_deprecated: {
            enabled: true,
            channels: ["in-app"],
        },
        tools_auth_required: {
            enabled: true,
            channels: ["in-app", "email"],
        },
        tools_auth_expired: {
            enabled: true,
            channels: ["in-app"],
        },
        collaboration_agent_modified: {
            enabled: true,
            channels: ["in-app"],
        },
        collaboration_agent_activated: {
            enabled: true,
            channels: ["in-app"],
        },
        collaboration_agent_deactivated: {
            enabled: true,
            channels: ["in-app"],
        },
        system_announcement: {
            enabled: true,
            channels: ["in-app"],
        },
        system_maintenance: {
            enabled: true,
            channels: ["in-app", "email"],
        },
    },
    emailDigest: "daily",
};

// ─── Helper Functions ────────────────────────────────────────────────────────

export function filterNotifications(
    notifications: Notification[],
    filters: {
        type?: string;
        status?: string;
        agent?: string;
        priority?: string;
        category?: string;
        dateRange?: string;
    }
): Notification[] {
    return notifications.filter((n) => {
        if (filters.type && filters.type !== "All" && n.type !== filters.type)
            return false;
        if (
            filters.status &&
            filters.status !== "All" &&
            n.status !== filters.status.toLowerCase()
        )
            return false;
        if (
            filters.agent &&
            filters.agent !== "All" &&
            n.agentName !== filters.agent
        )
            return false;
        if (
            filters.priority &&
            filters.priority !== "All" &&
            n.priority !== filters.priority.toLowerCase()
        )
            return false;
        if (
            filters.category &&
            filters.category !== "All" &&
            n.category !== filters.category
        )
            return false;
        if (filters.dateRange && filters.dateRange !== "All") {
            const hoursMap: Record<string, number> = {
                "Last Hour": 1,
                "Last 24 Hours": 24,
                "Last 7 Days": 168,
                "Last 30 Days": 720,
            };
            const hours = hoursMap[filters.dateRange];
            if (hours) {
                const cutoff = new Date(Date.now() - hours * 3600000);
                if (n.createdAt < cutoff) return false;
            }
        }
        return true;
    });
}

export function searchNotifications(
    notifications: Notification[],
    query: string
): Notification[] {
    if (!query.trim()) return notifications;
    const q = query.toLowerCase();
    return notifications.filter(
        (n) =>
            n.title.toLowerCase().includes(q) ||
            n.message.toLowerCase().includes(q) ||
            (n.agentName && n.agentName.toLowerCase().includes(q)) ||
            (n.executionId && n.executionId.toLowerCase().includes(q)) ||
            (n.errorType && n.errorType.toLowerCase().includes(q))
    );
}

export function groupNotificationsByDate(
    notifications: Notification[]
): Record<string, Notification[]> {
    const groups: Record<string, Notification[]> = {};
    for (const n of notifications) {
        const key = n.date;
        if (!groups[key]) groups[key] = [];
        groups[key].push(n);
    }
    return groups;
}

export function getUnreadCount(notifications: Notification[]): number {
    return notifications.filter((n) => n.status === "unread").length;
}

export function getUniqueAgentNames(notifications: Notification[]): string[] {
    const names = new Set<string>();
    for (const n of notifications) {
        if (n.agentName) names.add(n.agentName);
    }
    return Array.from(names).sort();
}

export function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        agent_execution: "Agent Execution",
        guardrail: "Guardrails",
        directory: "Agent Directory",
        tools: "Tools & Connections",
        system: "System",
        collaboration: "Collaborative",
<<<<<<< HEAD
=======
        messages: "Messages",
>>>>>>> origin/main
    };
    return labels[category] || category;
}

export function getNotificationTypeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
        agent_execution_chat: "Chat Execution",
        agent_execution_autonomous: "Autonomous Execution",
        agent_execution_failed: "Failed Execution",
        agent_execution_long_running: "Long-Running Execution",
        approval_required: "Approval Required",
        guardrail_observer: "Guardrail Observer",
        guardrail_enforcer: "Guardrail Enforcer",
        guardrail_quality: "Quality Score",
        guardrail_support_ticket: "Linked to Support Ticket",
        directory_new_agent: "New Agent",
        directory_update_available: "Update Available",
        directory_install_request: "Install Request",
        tools_new_available: "New Tool",
        tools_deprecated: "Tool Deprecated",
        tools_auth_required: "Auth Required",
        tools_auth_expired: "Auth Expired",
        collaboration_agent_modified: "Agent Modified",
        collaboration_agent_activated: "Agent Activated",
        collaboration_agent_deactivated: "Agent Deactivated",
        system_announcement: "Announcement",
        system_maintenance: "Maintenance",
<<<<<<< HEAD
=======
        im_new_message: "New Message",
        im_mention: "Mention",
        im_thread_reply: "Thread Reply",
>>>>>>> origin/main
    };
    return labels[type] || type;
}

export function formatPreferenceKey(key: string): string {
    return key
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}
