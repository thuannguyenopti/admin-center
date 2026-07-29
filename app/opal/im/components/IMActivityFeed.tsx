"use client";

import {Box, Button, Text} from "@optiaxiom/react";
import {
	IconFileLines,
	IconCircleCheck,
	IconArrowRight,
	IconDatabase,
	IconTriangleExclamation,
	IconMagnifyingGlass,
	IconEnvelope,
} from "@optiaxiom/icons";
import type {ReactNode} from "react";

type ActivityAction = "review" | "open" | "undo" | null;

type ActivityItem = {
	id: string;
	icon: ReactNode;
	iconBg: string;
	iconColor?: string;
	action: string;
	subtitle?: string;
	project?: string;
	projectColor?: string;
	timeAgo: string;
	actionButton?: ActivityAction;
};

type ActivityGroup = {
	label: string;
	items: ActivityItem[];
};

// ── Icon helpers ──────────────────────────────────────────────────────────────

function ActivityIcon({icon, bg, color}: {icon: ReactNode; bg: string; color?: string}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			style={{
				width: 36,
				height: 36,
				borderRadius: 9,
				background: bg,
				flexShrink: 0,
				color: color ?? "var(--ax-colors-fg-secondary)",
			}}
		>
			{icon}
		</Box>
	);
}

// ── Mock data per VAU name ────────────────────────────────────────────────────

const FRANK_ACTIVITIES: ActivityGroup[] = [
	{
		label: "TODAY",
		items: [
			{
				id: "f1",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Drafted discover-the-unknown-qa.md",
				subtitle: "GEO Q&A article · 7 Q&A pairs · updated",
				project: "Discover the Unknown",
				projectColor: "#4f46e5",
				timeAgo: "12m ago",
				actionButton: "review",
			},
			{
				id: "f2",
				icon: <IconMagnifyingGlass size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Ran keyword cluster analysis",
				project: "Stride / GEO",
				projectColor: "#059669",
				timeAgo: "45m ago",
				actionButton: null,
			},
			{
				id: "f3",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Updated SERP shift digest",
				subtitle: "14 position changes detected",
				project: "Stride / GEO",
				projectColor: "#059669",
				timeAgo: "1h ago",
				actionButton: "open",
			},
			{
				id: "f4",
				icon: <IconTriangleExclamation size={18} />,
				iconBg: "var(--ax-colors-bg-warning-subtle)",
				iconColor: "var(--ax-colors-fg-warning-strong)",
				action: "Flagged topic gap: AI overview coverage",
				subtitle: "3 queries missing structured answer content",
				project: "Stride / GEO",
				projectColor: "#059669",
				timeAgo: "2h ago",
				actionButton: null,
			},
		],
	},
	{
		label: "YESTERDAY",
		items: [
			{
				id: "f5",
				icon: <IconCircleCheck size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Completed schema audit",
				subtitle: "12 pages flagged for markup gaps",
				project: "Stride CMS",
				projectColor: "#0891b2",
				timeAgo: "1d ago",
				actionButton: "open",
			},
			{
				id: "f6",
				icon: <IconEnvelope size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Sent weekly citation tracker",
				subtitle: "Sent to #seo-geo channel",
				project: "Stride / GEO",
				projectColor: "#059669",
				timeAgo: "1d ago",
				actionButton: null,
			},
			{
				id: "f7",
				icon: <IconArrowRight size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Updated internal linking suggestions",
				project: "stride.com/discover",
				projectColor: "#7c3aed",
				timeAgo: "1d ago",
				actionButton: null,
			},
		],
	},
];

const TONY_ACTIVITIES: ActivityGroup[] = [
	{
		label: "TODAY",
		items: [
			{
				id: "t1",
				icon: <IconTriangleExclamation size={18} />,
				iconBg: "var(--ax-colors-bg-warning-subtle)",
				iconColor: "var(--ax-colors-fg-warning-strong)",
				action: "Flagged conversion drop on /pricing",
				subtitle: "–18% vs. 7-day avg · Variant B affected",
				project: "Stride Pricing",
				projectColor: "#d97706",
				timeAgo: "8m ago",
				actionButton: "review",
			},
			{
				id: "t2",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Updated channel mix recommendation",
				subtitle: "Shifted +12% budget to paid social",
				project: "Q2 Media Plan",
				projectColor: "#059669",
				timeAgo: "1h ago",
				actionButton: "open",
			},
			{
				id: "t3",
				icon: <IconMagnifyingGlass size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Ran landing page audit",
				subtitle: "7 friction points identified",
				project: "Stride / CRO",
				projectColor: "#0891b2",
				timeAgo: "2h ago",
				actionButton: null,
			},
		],
	},
	{
		label: "YESTERDAY",
		items: [
			{
				id: "t4",
				icon: <IconCircleCheck size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Completed funnel teardown",
				subtitle: "Drop-off at checkout step 2 identified",
				project: "Q2 Funnel",
				projectColor: "#0891b2",
				timeAgo: "1d ago",
				actionButton: "open",
			},
			{
				id: "t5",
				icon: <IconEnvelope size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Sent bid optimization brief",
				subtitle: "Google Search · 4 ad groups updated",
				project: "Paid Search",
				projectColor: "#d97706",
				timeAgo: "1d ago",
				actionButton: "undo",
			},
		],
	},
];

const HENRY_ACTIVITIES: ActivityGroup[] = [
	{
		label: "TODAY",
		items: [
			{
				id: "h1",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Drafted Stride Discover launch positioning",
				subtitle: "Messaging framework · 3 buyer segments",
				project: "Q3 Launch",
				projectColor: "#4f46e5",
				timeAgo: "20m ago",
				actionButton: "review",
			},
			{
				id: "h2",
				icon: <IconDatabase size={18} />,
				iconBg: "var(--ax-colors-bg-information-subtle)",
				iconColor: "var(--ax-colors-fg-information-strong)",
				action: "Added competitor research to memory",
				subtitle: "Eventbrite, Spartan Race positioning",
				project: undefined,
				timeAgo: "1h ago",
				actionButton: null,
			},
			{
				id: "h3",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Updated competitive positioning brief",
				subtitle: "Stride vs. Eventbrite — 2 new differentiators",
				project: "Q3 GTM",
				projectColor: "#7c3aed",
				timeAgo: "2h ago",
				actionButton: "open",
			},
		],
	},
	{
		label: "YESTERDAY",
		items: [
			{
				id: "h4",
				icon: <IconCircleCheck size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Completed messaging framework refresh",
				subtitle: "3 personas · 5 value props updated",
				project: "Q3 GTM",
				projectColor: "#7c3aed",
				timeAgo: "1d ago",
				actionButton: null,
			},
			{
				id: "h5",
				icon: <IconEnvelope size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Sent sales enablement kit",
				subtitle: "Sent to #sales-enablement",
				project: "Q3 Launch",
				projectColor: "#4f46e5",
				timeAgo: "1d ago",
				actionButton: "open",
			},
			{
				id: "h6",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Drafted buyer persona update",
				subtitle: "Adventure Athlete · Corporate Team segments",
				project: "Q3 GTM",
				projectColor: "#7c3aed",
				timeAgo: "1d ago",
				actionButton: "open",
			},
		],
	},
];

const POPPY_ACTIVITIES: ActivityGroup[] = [
	{
		label: "TODAY",
		items: [
			{
				id: "p1",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Updated launch timeline",
				subtitle: "Q3 Discover — 4 dependencies resolved",
				project: "Q3 Launch",
				projectColor: "#4f46e5",
				timeAgo: "30m ago",
				actionButton: "review",
			},
			{
				id: "p2",
				icon: <IconEnvelope size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Sent cross-team standup digest",
				subtitle: "Sent to #launch-q3",
				project: "Q3 Launch",
				projectColor: "#4f46e5",
				timeAgo: "1h ago",
				actionButton: "undo",
			},
			{
				id: "p3",
				icon: <IconTriangleExclamation size={18} />,
				iconBg: "var(--ax-colors-bg-warning-subtle)",
				iconColor: "var(--ax-colors-fg-warning-strong)",
				action: "Flagged risk: content assets 3 days late",
				subtitle: "Creative team · design deliverable",
				project: "Q3 Launch",
				projectColor: "#4f46e5",
				timeAgo: "2h ago",
				actionButton: null,
			},
		],
	},
	{
		label: "YESTERDAY",
		items: [
			{
				id: "p4",
				icon: <IconCircleCheck size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Completed launch readiness check",
				subtitle: "8/10 items green · 2 open",
				project: "Q3 Launch",
				projectColor: "#4f46e5",
				timeAgo: "1d ago",
				actionButton: "open",
			},
			{
				id: "p5",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Updated rollout dependency map",
				subtitle: "CMS, CMP, and Paid channels mapped",
				project: "Q3 Launch",
				projectColor: "#4f46e5",
				timeAgo: "1d ago",
				actionButton: "open",
			},
		],
	},
];

const KERBY_ACTIVITIES: ActivityGroup[] = [
	{
		label: "TODAY",
		items: [
			{
				id: "k1",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Drafted outreach sequence for Accenture",
				subtitle: "5-step email + LinkedIn · 3 personas",
				project: "Target Accounts",
				projectColor: "#0891b2",
				timeAgo: "25m ago",
				actionButton: "review",
			},
			{
				id: "k2",
				icon: <IconDatabase size={18} />,
				iconBg: "var(--ax-colors-bg-information-subtle)",
				iconColor: "var(--ax-colors-fg-information-strong)",
				action: "Refreshed target account list",
				subtitle: "12 accounts added · 3 removed",
				project: "ABM Q3",
				projectColor: "#0891b2",
				timeAgo: "1h ago",
				actionButton: null,
			},
			{
				id: "k3",
				icon: <IconTriangleExclamation size={18} />,
				iconBg: "var(--ax-colors-bg-warning-subtle)",
				iconColor: "var(--ax-colors-fg-warning-strong)",
				action: "Flagged intent surge: Salesforce",
				subtitle: "3 contacts showing buying signals",
				project: "ABM Q3",
				projectColor: "#0891b2",
				timeAgo: "2h ago",
				actionButton: "open",
			},
		],
	},
	{
		label: "YESTERDAY",
		items: [
			{
				id: "k4",
				icon: <IconCircleCheck size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Completed account heat map",
				subtitle: "Top 20 accounts scored",
				project: "ABM Q3",
				projectColor: "#0891b2",
				timeAgo: "1d ago",
				actionButton: "open",
			},
			{
				id: "k5",
				icon: <IconEnvelope size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Sent sales handoff brief for Okta",
				subtitle: "Sent to #sales-enterprise",
				project: "Target Accounts",
				projectColor: "#0891b2",
				timeAgo: "1d ago",
				actionButton: "undo",
			},
		],
	},
];

const JONAS_ACTIVITIES: ActivityGroup[] = [
	{
		label: "TODAY",
		items: [
			{
				id: "j1",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Surfaced personalization opportunities",
				subtitle: "Homepage hero · 3 audience segments",
				project: "Stride Journey",
				projectColor: "#7c3aed",
				timeAgo: "15m ago",
				actionButton: "review",
			},
			{
				id: "j2",
				icon: <IconDatabase size={18} />,
				iconBg: "var(--ax-colors-bg-information-subtle)",
				iconColor: "var(--ax-colors-fg-information-strong)",
				action: "Analyzed cohort behavior",
				subtitle: "Adventure Athlete segment · week-over-week",
				project: "Stride ODP",
				projectColor: "#0891b2",
				timeAgo: "1h ago",
				actionButton: null,
			},
			{
				id: "j3",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Proposed A/B test: checkout CTA copy",
				subtitle: "Expected +4-8% conversion lift",
				project: "Stride / CRO",
				projectColor: "#0891b2",
				timeAgo: "2h ago",
				actionButton: "open",
			},
		],
	},
	{
		label: "YESTERDAY",
		items: [
			{
				id: "j4",
				icon: <IconCircleCheck size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Completed journey friction report",
				subtitle: "Drop-off at step 3 of onboarding",
				project: "Stride Journey",
				projectColor: "#7c3aed",
				timeAgo: "1d ago",
				actionButton: "open",
			},
			{
				id: "j5",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Groomed test backlog",
				subtitle: "8 hypotheses prioritized",
				project: "Stride / CRO",
				projectColor: "#0891b2",
				timeAgo: "1d ago",
				actionButton: null,
			},
		],
	},
];

const MAYLING_ACTIVITIES: ActivityGroup[] = [
	{
		label: "TODAY",
		items: [
			{
				id: "m1",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Drafted weekly social calendar",
				subtitle: "Instagram · LinkedIn · X · 14 posts",
				project: "Social May",
				projectColor: "#7c3aed",
				timeAgo: "10m ago",
				actionButton: "review",
			},
			{
				id: "m2",
				icon: <IconDatabase size={18} />,
				iconBg: "var(--ax-colors-bg-information-subtle)",
				iconColor: "var(--ax-colors-fg-information-strong)",
				action: "Flagged trending topic: #AdventureChallenge",
				subtitle: "12K posts in 24h · brand fit: high",
				project: "Social May",
				projectColor: "#7c3aed",
				timeAgo: "45m ago",
				actionButton: null,
			},
			{
				id: "m3",
				icon: <IconFileLines size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Created post variants for Discover launch",
				subtitle: "Instagram + LinkedIn · 3 angles",
				project: "Q3 Launch",
				projectColor: "#4f46e5",
				timeAgo: "2h ago",
				actionButton: "open",
			},
		],
	},
	{
		label: "YESTERDAY",
		items: [
			{
				id: "m4",
				icon: <IconCircleCheck size={18} />,
				iconBg: "var(--ax-colors-bg-success-subtle)",
				iconColor: "var(--ax-colors-fg-success-strong)",
				action: "Completed channel performance digest",
				subtitle: "LinkedIn outperforming by +22%",
				project: "Social May",
				projectColor: "#7c3aed",
				timeAgo: "1d ago",
				actionButton: "open",
			},
			{
				id: "m5",
				icon: <IconEnvelope size={18} />,
				iconBg: "var(--ax-colors-bg-tertiary)",
				action: "Sent influencer outreach list",
				subtitle: "8 creators · adventure niche",
				project: "Social May",
				projectColor: "#7c3aed",
				timeAgo: "1d ago",
				actionButton: "undo",
			},
		],
	},
];

const ACTIVITIES_BY_VAU: Record<string, ActivityGroup[]> = {
	frank: FRANK_ACTIVITIES,
	tony: TONY_ACTIVITIES,
	henry: HENRY_ACTIVITIES,
	poppy: POPPY_ACTIVITIES,
	kerby: KERBY_ACTIVITIES,
	jonas: JONAS_ACTIVITIES,
	mayling: MAYLING_ACTIVITIES,
};

// ── Action button labels ──────────────────────────────────────────────────────

const ACTION_LABELS: Record<NonNullable<ActivityAction>, string> = {
	review: "Review",
	open: "Open",
	undo: "Undo",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function IMActivityFeed({vauName}: {vauName?: string}) {
	const key = vauName?.toLowerCase() ?? "";
	const groups = ACTIVITIES_BY_VAU[key] ?? FRANK_ACTIVITIES;

	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{flex: 1, overflowY: "auto", padding: "24px 0"}}
		>
			<Box style={{maxWidth: 720, width: "100%", margin: "0 auto"}}>
				{groups.map((group) => (
					<Box key={group.label} display="flex" flexDirection="column" mb="24">
						{/* Section header */}
						<Text
							style={{
								fontSize: 11,
								fontWeight: 600,
								letterSpacing: "0.06em",
								color: "var(--ax-colors-fg-tertiary)",
								padding: "0 24px",
								marginBottom: 8,
							}}
						>
							{group.label}
						</Text>

						{/* Items */}
						{group.items.map((item) => (
							<Box
								key={item.id}
								display="flex"
								alignItems="center"
								gap="12"
								style={{
									padding: "10px 24px",
									borderBottom: "1px solid var(--ax-colors-border-secondary)",
									minHeight: 52,
								}}
							>
								{/* Icon */}
								<ActivityIcon
									icon={item.icon}
									bg={item.iconBg}
									color={item.iconColor}
								/>

								{/* Text block */}
								<Box
									display="flex"
									flexDirection="column"
									style={{flex: 1, minWidth: 0, gap: 2}}
								>
									<Text
										style={{
											fontSize: 13,
											fontWeight: 500,
											color: "var(--ax-colors-fg-default)",
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
										}}
									>
										{item.action}
									</Text>

									{/* Project tag + time */}
									<Box display="flex" alignItems="center" gap="6">
										{item.project && (
											<>
												<Box
													style={{
														width: 8,
														height: 8,
														borderRadius: 2,
														background:
															item.projectColor ??
															"var(--ax-colors-bg-secondary)",
														flexShrink: 0,
													}}
												/>
												<Text
													style={{
														fontSize: 12,
														color: "var(--ax-colors-fg-secondary)",
														whiteSpace: "nowrap",
													}}
												>
													{item.project}
												</Text>
												<Text
													style={{
														fontSize: 12,
														color: "var(--ax-colors-fg-tertiary)",
													}}
												>
													·
												</Text>
											</>
										)}
										<Text
											style={{
												fontSize: 12,
												color: "var(--ax-colors-fg-tertiary)",
												whiteSpace: "nowrap",
											}}
										>
											{item.timeAgo}
										</Text>
									</Box>
								</Box>

								{/* Optional action button */}
								{item.actionButton && (
									<Button
										appearance="subtle"
										size="sm"
										style={{flexShrink: 0, fontWeight: 500}}
									>
										{ACTION_LABELS[item.actionButton]}
									</Button>
								)}
							</Box>
						))}
					</Box>
				))}
			</Box>
		</Box>
	);
}
