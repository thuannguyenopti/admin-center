"use client";

import { Badge, Box, Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Tooltip } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
	IconBook,
	IconArrowRight,
	IconArrowLeft,
	IconCircleInfo,
	IconCircleCheck,
	IconPen,
	IconPlus,
	IconFileLines,
	IconFilePdf,
	IconFileWord,
	IconGear,
} from "@optimizely/axiom-icons";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useLayout } from "@/app/context/LayoutContext";
import { DEFAULT_VAU_EXAMPLES, VAUS, type VAU, type VAUExample } from "@/app/opal/data/vaus";
import { TOOL_ICONS } from "../tool-icons";

const TOOL_DESCRIPTIONS: Record<string, string> = {
	notion:     "For pulling context from docs and wikis",
	slack:      "For surfacing messages and updates",
	asana:      "For tracking tasks and projects",
	google:     "For calendar, Drive, and Gmail access",
	figma:      "For pulling design assets and specs",
	airtable:   "For reading structured data and records",
	github:     "For code context and pull requests",
	salesforce: "For CRM data and opportunity context",
	hubspot:    "For contacts, deals, and pipeline data",
	"opti-cms":                 "For reading and updating CMS content",
	"opti-cmp":                 "For campaign briefs and content plans",
	"opti-web-experimentation": "For experiment results and variants",
	"opti-odp":                 "For audience and behavioral data",
};

type MockFile = { name: string; size: string; icon: React.ReactNode };

const MOCK_FILES: MockFile[] = [
	{ name: "brand-guidelines.pdf", size: "2.1 MB", icon: <span style={{ color: "#d44b3e", display: "inline-flex" }}><IconFilePdf size={16} /></span> },
	{ name: "messaging-framework.docx", size: "184 KB", icon: <span style={{ color: "#1e57c2", display: "inline-flex" }}><IconFileWord size={16} /></span> },
	{ name: "personas-q3.md", size: "12 KB", icon: <span style={{ color: "var(--ax-colors-fg-tertiary)", display: "inline-flex" }}><IconFileLines size={16} /></span> },
];

export default function VAUDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { setActiveVAU, setPendingIMConvId } = useLayout();
	const vau = useMemo(() => VAUS.find((v) => v.id === params?.id), [params?.id]);
	const setupName = (searchParams.get("name") ?? "").replace(/\\/g, "").trim();
	const setupAvatar = decodeURIComponent(searchParams.get("avatar") ?? "");
	const [showSetupModal, setShowSetupModal] = useState(searchParams.get("setup") === "1");
	const [connectedTools, setConnectedTools] = useState<Set<string>>(new Set());
	const [showTransition, setShowTransition] = useState(false);
	const [countdown, setCountdown] = useState(3);

	useEffect(() => {
		if (setupName && vau) setActiveVAU({ name: setupName, avatar: setupAvatar || vau.avatar });
	}, [setupName, vau, setActiveVAU]);

	useEffect(() => {
		if (!showTransition || !vau) return;
		const templateSlug = vau.templateName.toLowerCase().replace(/\s+/g, "-");
		const convId = `conv-vau-${templateSlug}`;
		// Update the VAU's display name in the messaging store so the IM list reflects it
		if (setupName) {
			fetch(`/api/messaging/v1/users/vau-${vau.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ display_name: setupName }),
			}).catch(() => {});
		}
		const t = setTimeout(() => {
			try {
				sessionStorage.setItem("im-initial-chat", convId);
				sessionStorage.setItem("im-new-hire", convId);
				// Persist avatar + name overrides so they survive Vercel cold-starts
				// (server filesystem is ephemeral; PATCH may be lost on next cold-start)
				if (setupAvatar) sessionStorage.setItem(`im-avatar-override:vau-${vau.id}`, setupAvatar);
				if (setupName) sessionStorage.setItem(`im-name-override:vau-${vau.id}`, setupName);
			} catch {}
			flushSync(() => { setActiveVAU(null); });
			router.push(`/opal/im?conv=${convId}`);
		}, 1400);
		return () => clearTimeout(t);
	}, [showTransition, router, vau, setupName, setActiveVAU]);

	const toggleConnect = (key: string) =>
		setConnectedTools((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

	if (!vau) {
		return (
			<Box px="32" py="24" display="flex" flexDirection="column" gap="16">
				<Link href="/opal/virtual-teammates" style={{ textDecoration: "none" }}>
					<Button appearance="subtle" size="md" icon={<IconArrowLeft size={16} />}>Back to Virtual Teammates</Button>
				</Link>
				<Text color="fg.tertiary">No teammate found for &ldquo;{params?.id}&rdquo;.</Text>
			</Box>
		);
	}

	const examples: VAUExample[] = vau.examples ?? DEFAULT_VAU_EXAMPLES;
	const description = vau.longDescription ?? vau.description;
	const displayName = setupName || vau.name;

	return (
		<>
		{/* Day one essentials modal */}
		<Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
			<DialogContent size="md">
				<DialogHeader>
					Day one essentials
				</DialogHeader>
				<DialogBody>
					<Text color="fg.secondary" fontSize="md" maxW="full" style={{ lineHeight: 1.5, marginBottom: 8 }}>
						{"Give " + displayName + " access to the tools they'll use every day. You can always connect more later."}
					</Text>
					<Box display="flex" flexDirection="column" gap="12">
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Box display="flex" alignItems="center" gap="6">
								<Text style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--ax-colors-fg-secondary)" }}>
									Required connectors
								</Text>
								<Tooltip content="These tools are required for this teammate to function on day one.">
									<span style={{ display: "inline-flex", color: "var(--ax-colors-fg-tertiary)", cursor: "default" }}>
										<IconCircleInfo size={14} />
									</span>
								</Tooltip>
							</Box>
							<Text style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)" }}>
								{connectedTools.size} of {vau.tools.length} connected
							</Text>
						</Box>
						<Box display="flex" flexDirection="column" gap="8">
							{vau.tools.map((toolKey) => {
								const tool = TOOL_ICONS[toolKey];
								if (!tool) return null;
								const isConnected = connectedTools.has(toolKey);
								return (
									<Box
										key={toolKey}
										display="flex"
										alignItems="center"
										justifyContent="space-between"
										bg={isConnected ? "bg.secondary" : "bg.default"}
										style={{
											padding: 8,
											paddingLeft: 12,
											borderRadius: 8,
											border: "1px solid var(--ax-colors-border-secondary)",
											borderLeft: `3px solid ${tool.color}`,
											transition: "background 0.15s ease",
										}}
									>
										<Box display="flex" alignItems="center" gap="12" style={{ flex: 1, minWidth: 0 }}>
											<Box style={{ width: 32, height: 32, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: tool.color, fontSize: 10, fontWeight: 600 }}>
												{tool.textLabel
													? <span style={{ fontSize: 9, lineHeight: 1, color: tool.color }}>{tool.textLabel}</span>
													: <span style={{ color: tool.color, display: "flex" }}>{tool.icon}</span>}
											</Box>
											<Box display="flex" flexDirection="column" gap="2">
												<Text style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.43, letterSpacing: "0.28px", color: "var(--ax-colors-fg-default)" }}>
													{tool.name}
												</Text>
												<Text style={{ fontSize: 12, lineHeight: 1.33, letterSpacing: "0.24px", color: "var(--ax-colors-fg-tertiary)" }}>
													{TOOL_DESCRIPTIONS[toolKey] ?? "Connect to enable this integration"}
												</Text>
											</Box>
										</Box>
										<Button
											size="sm"
											appearance={isConnected ? "subtle" : "default"}
											icon={isConnected ? <IconCircleCheck size={14} /> : undefined}
											iconPosition="start"
											onClick={() => toggleConnect(toolKey)}
										>
											{isConnected ? "Connected" : "Connect"}
										</Button>
									</Box>
								);
							})}
						</Box>
					</Box>
				</DialogBody>
				<DialogFooter justifyContent="space-between">
					<Button size="lg" onClick={() => router.push(`/opal/directory/${vau.id}`)}>
						Back
					</Button>
					<Button appearance="primary" size="lg" icon={<IconArrowRight size={16} />} iconPosition="end" onClick={() => {
						setShowSetupModal(false);
						setShowTransition(true);
					}}>
						Start working together
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		{/* Transition screen */}
		{showTransition && (
			<>
				<style>{`
					@keyframes vt-slide-up {
						from { transform: translateY(20px); opacity: 0; }
						to   { transform: translateY(0);    opacity: 1; }
					}
					@keyframes vt-pop {
						0%   { transform: scale(0.7); opacity: 0; }
						60%  { transform: scale(1.12); }
						100% { transform: scale(1);   opacity: 1; }
					}
					@keyframes vt-flip-3x {
						from { transform: perspective(600px) rotateY(0deg); }
						to   { transform: perspective(600px) rotateY(540deg); }
					}
					.vt-transition-in  { animation: vt-slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
					.vt-countdown-pop  { animation: vt-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
					.vt-avatar-wrapper { animation: vt-flip-3x 1.4s ease 0.2s both; transform-style: preserve-3d; position: relative; }
					.vt-avatar-front   { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
					.vt-avatar-back    { backface-visibility: hidden; -webkit-backface-visibility: hidden; transform: rotateY(180deg); }
				`}</style>
				<Box
					className="vt-transition-in"
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 9999,
						backgroundColor: "#FAF9F0",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 32,
					}}
				>
					{/* Avatar flip: VAU → user, 3×, ends on user */}
					<Box style={{ width: 120, height: 120, perspective: 600 }}>
						<Box className="vt-avatar-wrapper" style={{ width: 120, height: 120 }}>
							{/* Front: VAU avatar */}
							<Box
								className="vt-avatar-front"
								style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
							>
								<Image src={setupAvatar || vau.avatar} alt={vau.name} width={120} height={120} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
							</Box>
							{/* Back: user avatar (pre-rotated 180° so it reads correctly when flipped) */}
							<Box
								className="vt-avatar-back"
								style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
							>
								<Image src="/avatars/avatar-3.png" alt="You" width={120} height={120} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
							</Box>
						</Box>
					</Box>
					<Box display="flex" flexDirection="column" alignItems="center" gap="12" style={{ textAlign: "center", maxWidth: 440 }}>
						<Text style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px", color: "var(--ax-colors-fg-default)" }}>
							Whoosh — taking you to your team
						</Text>
						<Text color="fg.secondary" fontSize="md" maxW="full" style={{ lineHeight: 1.5 }}>
							{"Want to tune up " + displayName + " later? Find them in your Virtual Teammates tab."}
						</Text>
					</Box>
				</Box>
			</>
		)}

		<Box px="32" py="24" display="flex" flexDirection="column" gap="24" overflow="auto" h="full">
			{/* Top row: back link (left) + actions (right) */}
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Button
					appearance="subtle"
					size="md"
					icon={<IconArrowLeft size={16} />}
					onClick={() => router.push("/opal/virtual-teammates")}
				>
					Back
				</Button>
				<Box display="flex" gap="8" alignItems="center">
					<Button appearance="primary" size="lg">Save</Button>
				</Box>
			</Box>

			{/* 2-col body — left main + right rail */}
			<Box display="flex" gap="32" style={{ alignItems: "flex-start" }}>
				{/* Left main */}
				<Box display="flex" flexDirection="column" gap="24" style={{ flex: 1, minWidth: 0 }}>
					{/* Avatar + role badge + name */}
					<Box display="flex" gap="16" alignItems="center">
						<Box style={{ width: "80px", height: "80px", minWidth: "80px", overflow: "hidden", borderRadius: "14px", backgroundColor: vau.avatarBg }}>
							<Image src={vau.avatar} alt={vau.name} width={80} height={80} unoptimized />
						</Box>
						<Box display="flex" flexDirection="column" gap="8" style={{ flex: 1, minWidth: 0 }}>
							<Text
								color="fg.default"
								style={{
									fontSize: "28px",
									fontWeight: 700,
									lineHeight: 1.1,
									letterSpacing: "-0.4px",
									textDecoration: "none",
								}}
							>
								{vau.name}
							</Text>
							<Box>
								<Badge intent="information">{vau.templateName}</Badge>
							</Box>
						</Box>
					</Box>

					{/* Description + advanced settings */}
					<Box display="flex" flexDirection="column" gap="12">
						<Text maxW="full" fontSize="md" color="fg.default" style={{ lineHeight: 1.5 }}>
							{description}
						</Text>
						<Box>
							<Button appearance="subtle" size="sm" icon={<IconGear size={14} />}>
								Advanced Settings
							</Button>
						</Box>
					</Box>

					{/* Examples grid — 2 cols */}
					<Box
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
							gap: "16px",
						}}
					>
						{examples.map((ex) => (
							<ExampleCard key={ex.title} example={ex} />
						))}
					</Box>
				</Box>

				{/* Right rail — right-aligned with Save button */}
				<Box display="flex" flexDirection="column" gap="16" style={{ width: "320px", flexShrink: 0, marginLeft: "auto" }}>
					<ConnectorsBox vau={vau} />
					<SkillsBox vau={vau} />
					<FilesBox />
				</Box>
			</Box>
		</Box>
		</>
	);
}

function SideBox({
	titleIcon,
	title,
	count,
	actionIcon,
	actionLabel,
	children,
}: {
	titleIcon: React.ReactNode;
	title: string;
	count: number;
	actionIcon: React.ReactNode;
	actionLabel: string;
	children: React.ReactNode;
}) {
	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" style={{ overflow: "hidden" }}>
			<Box display="flex" alignItems="center" justifyContent="space-between" px="16" py="12">
				<Box display="flex" alignItems="center" gap="8">
					<Box style={{ display: "flex", alignItems: "center", color: "var(--ax-colors-fg-default)" }}>
						{titleIcon}
					</Box>
					<Text fontWeight="600" color="fg.default" style={{ fontSize: "14px" }}>{title}</Text>
					<Badge>{count}</Badge>
				</Box>
				<Tooltip content={actionLabel}>
					<Button appearance="subtle" size="sm" icon={actionIcon} aria-label={actionLabel} />
				</Tooltip>
			</Box>
			<Box display="flex" flexDirection="column">
				{children}
			</Box>
		</Box>
	);
}

function ConnectorsBox({ vau }: { vau: VAU }) {
	return (
		<SideBox
			titleIcon={<img src="/nav_icons/grid-2-plus.svg" alt="" width={16} height={16} />}
			title="Connectors"
			count={vau.tools.length}
			actionIcon={<IconPlus size={14} />}
			actionLabel="Link connector"
		>
			{vau.tools.map((toolKey) => {
				const tool = TOOL_ICONS[toolKey];
				if (!tool) return null;
				return (
					<Box key={toolKey} display="flex" alignItems="center" gap="12" px="16" py="10">
						<Box
							rounded="sm"
							border="1"
							borderColor="border.tertiary"
							style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: tool.color, fontSize: 10, fontWeight: 600, flexShrink: 0 }}
						>
							{tool.textLabel ? tool.textLabel : tool.icon}
						</Box>
						<Text style={{ fontSize: "13px", color: "var(--ax-colors-fg-default)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{tool.name}
						</Text>
					</Box>
				);
			})}
		</SideBox>
	);
}

function SkillsBox({ vau }: { vau: VAU }) {
	return (
		<SideBox
			titleIcon={<IconBook size={16} />}
			title="Skills"
			count={vau.tags.length}
			actionIcon={<IconPen size={14} />}
			actionLabel="Edit skills"
		>
			<Box display="flex" gap="6" px="16" py="12" style={{ flexWrap: "wrap" }}>
				{vau.tags.map((tag) => (
					<Badge key={tag.label}>{tag.label}</Badge>
				))}
			</Box>
		</SideBox>
	);
}

function FilesBox() {
	return (
		<SideBox
			titleIcon={<IconFileLines size={16} />}
			title="Files"
			count={MOCK_FILES.length}
			actionIcon={<IconPlus size={14} />}
			actionLabel="Upload file"
		>
			{MOCK_FILES.map((file) => (
				<Box key={file.name} display="flex" alignItems="center" gap="12" px="16" py="10">
					<Box style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						{file.icon}
					</Box>
					<Box style={{ flex: 1, minWidth: 0 }}>
						<Text style={{ fontSize: "13px", color: "var(--ax-colors-fg-default)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{file.name}
						</Text>
						<Text color="fg.tertiary" style={{ fontSize: "11px" }}>{file.size}</Text>
					</Box>
				</Box>
			))}
		</SideBox>
	);
}

function ExampleCard({ example }: { example: VAUExample }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="md"
			p="16"
			display="flex"
			flexDirection="column"
			gap="8"
		>
			{/* Icon + title + frequency */}
			<Box display="flex" gap="12" alignItems="start">
				<Box
					rounded="md"
					bg="bg.secondary"
					style={{
						width: "42px",
						height: "42px",
						minWidth: "42px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "22px",
						lineHeight: 1,
					}}
				>
					<span>{example.emoji}</span>
				</Box>
				<Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
					<Text fontWeight="700" color="fg.default" style={{ fontSize: "16px", lineHeight: 1.3 }}>
						{example.title}
					</Text>
					<Text color="fg.secondary" style={{ fontSize: "12px", letterSpacing: "0.4px", textTransform: "uppercase", fontFamily: "var(--ax-typography-mono, monospace)" }}>
						{example.frequency}
					</Text>
				</Box>
			</Box>

			{/* Faux content bars */}
			<Box
				rounded="sm"
				p="10"
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "4px",
					backgroundColor: "var(--ax-colors-bg-secondary, #f6faf3)",
					paddingLeft: "12px",
					paddingRight: "12px",
				}}
			>
				{[100, 60, 70, 40, 100].map((w, i) => (
					<Box
						key={i}
						style={{
							height: "6px",
							width: `${w}%`,
							borderRadius: "8px",
							backgroundColor: "var(--ax-colors-border-tertiary)",
						}}
					/>
				))}
			</Box>

			{/* See example link */}
			<Box>
				<Button appearance="subtle" size="sm" icon={<IconArrowRight size={14} />} iconPosition="end">
					View details
				</Button>
			</Box>
		</Box>
	);
}
