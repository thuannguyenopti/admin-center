"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	AlertDialog, AlertDialogAction, AlertDialogBody, AlertDialogCancel,
	AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
	Box, Button, Heading, Menu, MenuContent, MenuTrigger, Text,
} from "@optiaxiom/react";
import { IconArrowRight, IconChevronLeft, IconChevronRight, IconComments, IconImage, IconLock, IconPause } from "@optiaxiom/icons";
import { ReviewCanvas } from "./ReviewCanvas";
import Image from "next/image";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const KPIS = [
	{ label: "Time reclaimed", value: "4.5 hrs", sub: "+12% vs last week", subGreen: true },
	{ label: "Fires prevented", value: "9", sub: "Across 4 workstreams", subGreen: false },
	{ label: "Threads closed", value: "14", sub: "−4 min avg response time", subGreen: false },
	{ label: "Commitments tracked", value: "23", sub: "0% dropped", subGreen: false },
];

const APPROVALS = [
	{
		icon: "✉️",
		title: "Draft follow-up email",
		sub: '"Hi Sarah — circling back on the Q3 campaign brief…" · Today, 8:40 AM',
	},
	{
		icon: "📋",
		title: "Update CMP task status",
		sub: 'Mark "Spring launch creative" as in review · Today, 7:55 AM',
	},
	{
		icon: "🔔",
		title: "Send Slack reminder",
		sub: "Ping #marketing about deck review at 3PM · Today, 9:15 AM",
	},
	{
		icon: "📅",
		title: "Schedule stakeholder sync",
		sub: "Block Thursday 2pm for Q3 planning with the exec team · Today, 9:30 AM",
	},
	{
		icon: "✍️",
		title: "Approve meeting notes",
		sub: 'Notes from "Product strategy kickoff" ready for sign-off · Today, 8:05 AM',
	},
	{
		icon: "📊",
		title: "Share performance report",
		sub: "Weekly metrics digest ready to send to #leadership · Today, 7:45 AM",
	},
	{
		icon: "🔗",
		title: "Publish blog post draft",
		sub: '"AI in content workflows" is ready for final sign-off · Today, 9:00 AM',
	},
];

const WORK_ITEMS = [
	{
		priority: "Urgent",
		priorityBg: "#FAD9E7",
		priorityColor: "#8B1A3A",
		title: "Q3 Marketing Roadmap Brief",
		source: "Meeting_Prep",
		description: "Review before 3 PM meeting today. Deck has 4 outstanding sections needing your input.",
		time: "10:15 AM",
	},
	{
		priority: "Medium Priority",
		priorityBg: "#FFF3C4",
		priorityColor: "#7A4F00",
		title: "Sarah Chen Follow-up Email",
		source: "Email_Triage",
		description: "Approve to send. HITL gated — will not send without your action.",
		time: "9:15 AM",
	},
	{
		priority: "No Rush",
		priorityBg: "var(--ax-colors-bg-secondary)",
		priorityColor: "var(--ax-colors-fg-secondary)",
		title: "Weekly Performance Summary",
		source: "Performance_Digest",
		description: "Acknowledge before Friday sync. Covers email open rate, CMP throughput, and campaign deltas.",
		time: "8:00 AM",
	},
	{
		priority: "Urgent",
		priorityBg: "#FAD9E7",
		priorityColor: "#8B1A3A",
		title: "Competitor Analysis Draft",
		source: "Market_Intel",
		description: "New entry-level SaaS players flagged. Review before the positioning meeting at 4pm.",
		time: "9:45 AM",
	},
	{
		priority: "Medium Priority",
		priorityBg: "#FFF3C4",
		priorityColor: "#7A4F00",
		title: "Slack Announcement Draft",
		source: "Comms_Agent",
		description: "Ready to post to #all-company for Q3 OKR rollout. Review tone before sending.",
		time: "8:45 AM",
	},
	{
		priority: "No Rush",
		priorityBg: "var(--ax-colors-bg-secondary)",
		priorityColor: "var(--ax-colors-fg-secondary)",
		title: "LinkedIn Post Series",
		source: "Content_Producer",
		description: "3 posts scheduled for next week. Review and approve the content calendar.",
		time: "8:30 AM",
	},
	{
		priority: "Urgent",
		priorityBg: "#FAD9E7",
		priorityColor: "#8B1A3A",
		title: "Customer Renewal Memo",
		source: "CRM_Agent",
		description: "Acme Corp renewal at risk. Drafted memo for CSM team — needs sign-off by EOD.",
		time: "7:55 AM",
	},
	{
		priority: "No Rush",
		priorityBg: "var(--ax-colors-bg-secondary)",
		priorityColor: "var(--ax-colors-fg-secondary)",
		title: "Q3 Campaign Calendar",
		source: "Campaign_Strategist",
		description: "Full Q3 campaign calendar drafted. Review dates and asset dependencies before locking.",
		time: "7:30 AM",
	},
];

type PinnedItem =
	| { type: "artifact"; title: string; image: string; visibility: string; age: string }
	| { type: "action"; priority: string; priorityBg: string; priorityColor: string; title: string; description: string; filename: string; fileType: string; age: string };

const PINNED_ITEMS: PinnedItem[] = [
	{ type: "artifact", title: "Sunset", image: "/Sunset.jpg", visibility: "Private", age: "5 days ago" },
	{ type: "artifact", title: "Mountain", image: "/nature-bg.png", visibility: "Private", age: "5 days ago" },
	{ type: "action", priority: "Urgent", priorityBg: "#FAD9E7", priorityColor: "#8B1A3A", title: "Team approval needed", description: "Review the updated Q&A article. Approve to proceed to publishing, or request further changes.", filename: "Discover-the-unknown-qa.md", fileType: "GEO Q&A ARTICLE", age: "5 days ago" },
];

function KpiCard({ label, value, sub, subGreen }: { label: string; value: string; sub: string; subGreen: boolean }) {
	return (
		<Box
			bg="bg.default"
			style={{
				flex: 1,
				border: "1px solid var(--ax-colors-border-default)",
				borderRadius: 8,
				padding: 16,
				display: "flex",
				flexDirection: "column",
				gap: 6,
				minWidth: 0,
			}}
		>
			<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>{label}</span>
			<Text
				style={{
					fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
					fontSize: 28,
					fontWeight: 900,
					lineHeight: "1",
					color: "#226b1e",
				}}
			>
				{value}
			</Text>
			<Text fontSize="sm" style={{ color: subGreen ? "#226b1e" : "var(--ax-colors-fg-secondary)" }}>
				{sub}
			</Text>
		</Box>
	);
}

const SECTION_HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 18,
	fontWeight: 600,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

function CountBadge({ count }: { count: number }) {
	return (
		<Box
			style={{
				width: 20,
				height: 20,
				borderRadius: "50%",
				background: "var(--ax-colors-fg-default)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
			}}
		>
			<span
				style={{
					color: "var(--ax-colors-bg-default)",
					fontSize: 11,
					fontWeight: 700,
					fontFamily: "Roboto Mono, monospace",
					lineHeight: 1,
				}}
			>
				{count}
			</span>
		</Box>
	);
}

export default function VATOverviewPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const [showBreakDialog, setShowBreakDialog] = useState(false);
	const [reviewItem, setReviewItem] = useState<typeof WORK_ITEMS[0] | null>(null);
	const [dismissedTitles, setDismissedTitles] = useState<Set<string>>(new Set());

	// Approvals pagination
	const [visibleApprovals, setVisibleApprovals] = useState(3);
	const prevVisibleRef = useRef(3);
	useEffect(() => {
		prevVisibleRef.current = visibleApprovals;
	}, [visibleApprovals]);

	// Carousel state
	const [carouselPage, setCarouselPage] = useState(0);
	const carouselRef = useRef<HTMLDivElement>(null);
	const [cardWidth, setCardWidth] = useState(0);

	useEffect(() => {
		const el = carouselRef.current;
		if (!el) return;
		const measure = () => setCardWidth(Math.floor((el.offsetWidth - 40) / 3));
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	if (!vau) return null;

	const name = vau.characterName ?? vau.name;

	// Approvals computed
	const allApprovalsVisible = visibleApprovals >= APPROVALS.length;
	const remainingApprovals = APPROVALS.length - visibleApprovals;
	const nextBatch = Math.min(3, remainingApprovals);

	// Pinned carousel computed
	const totalPinnedPages = Math.ceil(PINNED_ITEMS.length / 3);
	const canGoBack = carouselPage > 0;
	const canGoForward = carouselPage < totalPinnedPages - 1;
	const translateX = cardWidth > 0 ? -(carouselPage * 3 * (cardWidth + 20)) : 0;
	const flexBasis = cardWidth > 0 ? `${cardWidth}px` : "calc((100% - 40px) / 3)";

	return (
		<>
		<Box style={{ padding: "32px 40px", maxWidth: 960 }}>
			{/* Page header */}
			<Box display="flex" alignItems="center" gap="16" mb="32">
				<Box
					style={{
						width: 56,
						height: 56,
						minWidth: 56,
						borderRadius: 8,
						overflow: "hidden",
						backgroundColor: vau.avatarBg,
						flexShrink: 0,
						border: "1px solid var(--ax-colors-border-default)",
					}}
				>
					<Image
						src={vau.avatar}
						alt={name}
						width={56}
						height={56}
						unoptimized
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				</Box>
				<Box style={{ flex: 1, minWidth: 0 }}>
					<Heading level="2" mb="4">
						{name}&apos;s dashboard
					</Heading>
					<Text color="fg.secondary" fontSize="md">
						What {name}&apos;s been up to and where they still need you.
					</Text>
				</Box>
				<Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
					<Button appearance="default" size="md" addonBefore={<IconPause />} onClick={() => setShowBreakDialog(true)}>
						Give {name} a break
					</Button>
					<Button appearance="primary" size="md" addonBefore={<IconComments />} onClick={() => router.push("/opal/im")}>
						Chat with {name}
					</Button>
				</Box>
			</Box>
			<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", marginBottom: 32 }} />

			{/* Give a break dialog */}
			<AlertDialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
				<AlertDialogContent size="sm" style={{ width: 600, minHeight: 254, borderRadius: 32 }}>
					<AlertDialogHeader>Give {name} a break?</AlertDialogHeader>
					<AlertDialogBody>
						<Text fontSize="md" color="fg.default" style={{ lineHeight: "1.6" }}>
							{name} will stop running all workflows. Nothing gets deleted. {name}&apos;s context, memory, and settings stay exactly as they are.
						</Text>
						<Text fontSize="md" color="fg.default" style={{ lineHeight: "1.6", marginTop: 12 }}>
							Pick it back up anytime — {name} will resume right where things left off.
						</Text>
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel appearance="subtle" size="md" onClick={() => setShowBreakDialog(false)}>
							Keep {name} running
						</AlertDialogCancel>
						<AlertDialogAction
							appearance="primary"
							size="md"
							addonBefore={
								<Box asChild display="inline-flex" alignItems="center" justifyContent="center" style={{ background: "#202320", borderRadius: 4, width: 18, height: 18 }}>
									<span><IconPause style={{ width: 10, height: 10, color: "#fff" }} /></span>
								</Box>
							}
							onClick={() => setShowBreakDialog(false)}
						>
							Send {name} OOO
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Impact */}
			<Box mb="32">
				<Text style={SECTION_HEADING} mb="4">
					{name}&apos;s Impact
				</Text>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					Here&apos;s how {name}&apos;s been making your week easier.
				</Text>
				<Box style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
					{KPIS.map((kpi) => (
						<KpiCard key={kpi.label} {...kpi} />
					))}
				</Box>
			</Box>

			{/* Needs approvals */}
			<Box mb="32">
				<Box display="flex" alignItems="center" gap="8" mb="4">
					<Text style={SECTION_HEADING}>Needs approvals</Text>
					<CountBadge count={APPROVALS.length} />
				</Box>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					A few things {name} can&apos;t finish without you.
				</Text>
				{APPROVALS.length === 0 ? (
					<Box
						style={{
							padding: "40px 20px",
							textAlign: "center",
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 8,
							background: "var(--ax-colors-bg-default)",
						}}
					>
						<Text color="fg.secondary" fontSize="md">
							{name}&apos;s all caught up. Nothing needs your approval right now.
						</Text>
					</Box>
				) : (
					<Box
						bg="bg.default"
						style={{
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 8,
							overflow: "hidden",
						}}
					>
						{APPROVALS.slice(0, visibleApprovals).map((item, i) => (
							<Box
								key={item.title}
								className={
									i >= prevVisibleRef.current && visibleApprovals > prevVisibleRef.current
										? "vat-approval-appear"
										: undefined
								}
								display="flex"
								alignItems="center"
								gap="16"
								style={{
									padding: "16px 20px",
									borderTop: i > 0 ? "1px solid var(--ax-colors-border-secondary)" : "none",
									cursor: "pointer",
								}}
							>
								<span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
								<Box style={{ flex: 1, minWidth: 0 }}>
									<Text fontSize="md" color="fg.default" style={{ fontWeight: 500 }} mb="2">
										{item.title}
									</Text>
									<Text fontSize="sm" color="fg.secondary">
										{item.sub}
									</Text>
								</Box>
								<Button appearance="subtle" size="sm" icon={<IconArrowRight />} aria-label="View" />
							</Box>
						))}
						{APPROVALS.length > 3 && (
							<Box
								display="flex"
								alignItems="center"
								justifyContent="center"
								className="vat-nav-item"
								style={{
									padding: "12px 20px",
									borderTop: "1px solid var(--ax-colors-border-secondary)",
									cursor: "pointer",
								}}
								onClick={() => {
									if (allApprovalsVisible) {
										setVisibleApprovals(3);
									} else {
										setVisibleApprovals((v) => Math.min(v + 3, APPROVALS.length));
									}
								}}
							>
								<Text fontSize="sm" color="fg.secondary" style={{ fontWeight: 500 }}>
									{allApprovalsVisible ? "Collapse ↑" : `Show ${nextBatch} more`}
								</Text>
							</Box>
						)}
					</Box>
				)}
			</Box>

			{/* Pinned */}
			<Box>
				<Box display="flex" alignItems="center" justifyContent="space-between" mb="4">
					<Text style={SECTION_HEADING}>Pinned</Text>
					<Box display="flex" alignItems="center" gap="8">
						<Button appearance="subtle" size="sm" icon={<IconChevronLeft />} disabled={!canGoBack} aria-label="Previous" onClick={() => setCarouselPage((p) => p - 1)} />
						<Button appearance="subtle" size="sm" icon={<IconChevronRight />} disabled={!canGoForward} aria-label="Next" onClick={() => setCarouselPage((p) => p + 1)} />
					</Box>
				</Box>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					Work your chief of staff has completed that you have saved
				</Text>
				<Box ref={carouselRef} style={{ overflow: "hidden" }}>
					<Box style={{ display: "flex", gap: 20, transform: `translateX(${translateX}px)`, transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)" }}>
						{PINNED_ITEMS.map((item) => (
							<Box key={item.title} className="vat-work-card" bg="bg.default" style={{ flex: `0 0 ${flexBasis}`, width: flexBasis, border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }}>
								{item.type === "artifact" ? (
									<>
										<Box style={{ width: "100%", height: 150, position: "relative", flexShrink: 0 }}>
											<Image src={item.image} alt={item.title} fill unoptimized style={{ objectFit: "cover" }} />
										</Box>
										<Box display="flex" alignItems="center" justifyContent="space-between" style={{ padding: "10px 14px 12px" }}>
											<Box>
												<Text fontSize="md" color="fg.default" style={{ fontWeight: 600 }}>{item.title}</Text>
												<Box display="flex" alignItems="center" gap="4" style={{ marginTop: 4, color: "var(--ax-colors-fg-tertiary)" }}>
													<IconLock style={{ width: 12, height: 12 }} />
													<Text fontSize="sm" color="fg.tertiary">{item.visibility}</Text>
												</Box>
											</Box>
											<Box style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, color: "var(--ax-colors-fg-tertiary)" }}>
												<IconImage style={{ width: 14, height: 14 }} />
												<Text fontSize="sm" color="fg.tertiary">Created {item.age}</Text>
											</Box>
										</Box>
									</>
								) : (
									<Box display="flex" flexDirection="column" gap="8" style={{ padding: 16, flex: 1 }}>
										<span style={{ ...CAPTION, fontSize: 9, background: item.priorityBg, color: item.priorityColor, padding: "2px 8px", borderRadius: 32, alignSelf: "flex-start" }}>
											{item.priority}
										</span>
										<Text fontSize="md" color="fg.default" style={{ fontWeight: 600, lineHeight: "1.3" }}>{item.title}</Text>
										<Text fontSize="sm" color="fg.secondary" style={{ flex: 1, lineHeight: "1.5" }}>{item.description}</Text>
										<Box style={{ marginTop: "auto" }}>
											<Text fontSize="sm" color="fg.default" style={{ fontWeight: 500 }}>{item.filename}</Text>
											<Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 4 }}>
												<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)" }}>{item.fileType}</span>
												<Text fontSize="sm" color="fg.tertiary">Created {item.age}</Text>
											</Box>
										</Box>
									</Box>
								)}
							</Box>
						))}
					</Box>
				</Box>
			</Box>
		</Box>

		{reviewItem && vau && (
			<ReviewCanvas
				item={reviewItem}
				vauName={name}
				vauAvatar={vau.avatar}
				vauAvatarBg={vau.avatarBg}
				onClose={() => setReviewItem(null)}
				onApprove={() => setDismissedTitles((prev) => new Set([...prev, reviewItem.title]))}
			/>
		)}
		</>
	);
}
