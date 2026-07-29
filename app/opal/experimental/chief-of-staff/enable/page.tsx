"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text, Tooltip } from "@optiaxiom/react";
import { Switch } from "@optiaxiom/react";
import { IconChevronDown, IconChevronUp, IconCircleInfo, IconArrowUpRightFromSquare, IconCheckCircleSolid } from "@optiaxiom/icons";
import { TOOL_ICONS } from "@/app/opal/virtual-teammates/tool-icons";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 11,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase",
	color: "var(--ax-colors-fg-tertiary)",
};

const HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings)",
	fontSize: 36,
	fontWeight: 900,
	lineHeight: "1.1",
	letterSpacing: "0.72px",
	color: "#202320",
	WebkitTextStroke: "1px #202320",
	textAlign: "center",
};

const JOBS = [
	{
		id: "daily-briefing",
		icon: "/vau-icons/newspaper.png",
		title: "Daily briefing",
		description: "Sends a morning summary of open items and priorities",
		tools: ["notion", "google", "slack", "figma", "asana"],
	},
	{
		id: "status-nudges",
		icon: "/vau-icons/bell.png",
		title: "Status nudges",
		description: "Reminds teammates to update stale tasks",
		tools: ["notion", "google", "slack", "figma", "asana"],
	},
	{
		id: "action-item-tracker",
		icon: "/vau-icons/action.png",
		title: "Action item tracker",
		description: "Captures and assigns action items from meetings",
		tools: ["notion", "google", "slack", "figma", "asana"],
	},
	{
		id: "weekly-recap",
		icon: "/vau-icons/calendar.png",
		title: "Weekly recap",
		description: "A digest of progress, blockers, and upcoming work",
		tools: ["notion", "google", "slack", "figma", "asana"],
	},
];

function ToolCircle({ toolKey, index, total }: { toolKey: string; index: number; total: number }) {
	const tool = TOOL_ICONS[toolKey];
	if (!tool) return null;
	return (
		<Tooltip content={tool.name} delayDuration={200}>
			<Box style={{
				width: 20, height: 20, borderRadius: "50%",
				border: "1.5px solid white",
				background: "#f3f7ee",
				display: "flex", alignItems: "center", justifyContent: "center",
				marginLeft: index > 0 ? -5 : 0,
				position: "relative", zIndex: total - index,
				flexShrink: 0, color: tool.color, overflow: "hidden",
			}}>
				{tool.icon ?? <span style={{ fontSize: 5, fontWeight: 700, fontFamily: "Roboto Mono, monospace" }}>{tool.name.slice(0, 2).toUpperCase()}</span>}
			</Box>
		</Tooltip>
	);
}

function JobRow({ job }: { job: typeof JOBS[0] }) {
	const [enabled, setEnabled] = useState(true);
	const [expanded, setExpanded] = useState(false);

	return (
		<Box style={{
			background: "white",
			border: "1px solid var(--ax-colors-border-default)",
			borderRadius: 12,
			overflow: "hidden",
		}}>
			<Box
				display="flex"
				alignItems="center"
				gap="16"
				style={{ padding: "16px 20px", cursor: "pointer" }}
				onClick={() => setExpanded((e) => !e)}
			>
				<Box style={{ width: 64, height: 64, minWidth: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={job.icon} alt={job.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
				</Box>

				<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
					<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 18, fontWeight: 600, lineHeight: "1.1", letterSpacing: "0.36px", color: "#202320" }}>{job.title}</Text>
					<Text fontSize="sm" color="fg.tertiary" style={{ lineHeight: "1.4" }}>{job.description}</Text>
				</Box>

				<Box display="flex" alignItems="center" gap="8" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
					<Switch
						checked={enabled}
						onCheckedChange={setEnabled}
					/>
					<Text fontSize="sm" color={enabled ? "fg.default" : "fg.tertiary"} style={{ fontWeight: 500, minWidth: 20 }}>
						{enabled ? "On" : "Off"}
					</Text>
				</Box>

				<Box style={{ color: "var(--ax-colors-fg-tertiary)", display: "flex", alignItems: "center" }}>
					{expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
				</Box>
			</Box>

			{expanded && (
				<Box style={{ borderTop: "1px solid var(--ax-colors-border-secondary)", padding: "12px 20px 16px", background: "#fafcf8" }}>
					<Box display="flex" alignItems="center" gap="12">
						<span style={CAPTION}>Runs with</span>
						<Box display="flex" alignItems="center">
							{job.tools.map((key, i) => (
								<ToolCircle key={key} toolKey={key} index={i} total={job.tools.length} />
							))}
							<Text fontSize="sm" color="fg.tertiary" style={{ marginLeft: 6 }}>+3</Text>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
}

// Step 1: Email domain
function EmailDomainStep({ onNext }: { onNext: () => void }) {
	const router = useRouter();
	const [domain, setDomain] = useState("");

	return (
		<Box display="flex" flexDirection="column" alignItems="center" style={{ width: "100%", maxWidth: 480, gap: 24 }}>
			{/* Avatar */}
			<Box style={{ width: 120, height: 120, borderRadius: 20, background: "#91dbda", overflow: "hidden", flexShrink: 0 }}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src="/chair.png" alt="Chief of Staff" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
			</Box>

			{/* Heading */}
			<Box style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
				<h1 style={HEADING}>Set your team&apos;s email domain</h1>
				<Text color="fg.secondary" style={{ fontSize: 15, lineHeight: "1.6", textAlign: "center" }}>
					Your Virtual Teammate will send and receive emails from this domain.{" "}
					Pick what feels right for your team.
				</Text>
			</Box>

			{/* Field */}
			<Box style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Box display="flex" alignItems="center" gap="6">
						<Text fontSize="sm" color="fg.default" style={{ fontWeight: 500 }}>Email domain</Text>
						<Tooltip content="Your teammate's official org email — they'll send and receive from this address, and your team can use it to trigger them directly." delayDuration={200}>
							<span style={{ display: "inline-flex" }}>
								<IconCircleInfo size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
							</span>
						</Tooltip>
					</Box>
					<Text fontSize="sm" color="fg.tertiary">
						Vau.<strong style={{ color: domain.trim() ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)" }}>{domain.trim() || "stride"}</strong>@vau.opal.optimizely.com
					</Text>
				</Box>
				<input
					value={domain}
					onChange={(e) => setDomain(e.target.value)}
					placeholder="e.g. Stride"
					style={{
						width: "100%",
						boxSizing: "border-box",
						height: 44,
						borderRadius: 8,
						border: "1px solid var(--ax-colors-border-default)",
						background: "white",
						padding: "0 14px",
						fontSize: 15,
						color: "var(--ax-colors-fg-default)",
						fontFamily: "var(--ax-font-family)",
						outline: "none",
					}}
				/>
			</Box>

			{/* Actions */}
			<Box display="flex" alignItems="center" justifyContent="center" gap="16" style={{ width: "100%" }}>
				<button
					onClick={() => router.push("/opal/experimental")}
					style={{
						background: "none", border: "none", cursor: "pointer",
						fontFamily: "var(--ax-font-family)", fontSize: 14,
						fontWeight: 600, color: "var(--ax-colors-fg-default)",
					}}
				>
					Enable a different teammate
				</button>
				<Button
					appearance="primary"
					size="lg"
					disabled={!domain.trim()}
					onClick={onNext}
				>
					Next →
				</Button>
			</Box>
		</Box>
	);
}

// Connector icon component — renders a branded icon or initial fallback
function ConnectorIcon({ toolKey, size = 36 }: { toolKey: string; size?: number }) {
	const tool = TOOL_ICONS[toolKey];
	const label = tool?.name ?? toolKey;
	const color = tool?.color ?? "#888";
	return (
		<Box style={{
			width: size, height: size, minWidth: size, borderRadius: 8,
			border: "1px solid var(--ax-colors-border-default)",
			background: "#f8fbf6",
			display: "flex", alignItems: "center", justifyContent: "center",
			flexShrink: 0, color, overflow: "hidden",
			fontSize: size * 0.4, fontWeight: 700, fontFamily: "Roboto Mono, monospace",
		}}>
			{tool?.icon
				? <span style={{ transform: `scale(${size / 16})` }}>{tool.icon}</span>
				: label.slice(0, 2).toUpperCase()}
		</Box>
	);
}

const CONNECTORS_RECOMMENDED = [
	{ icon: "/vau-icons/slack.jpg",   name: "Slack",  description: "Sends daily briefings, nudges, and recaps to your team's Slack workspace." },
	{ icon: "/vau-icons/notion.png",  name: "Notion", description: "Reads and writes to your Notion docs for summaries, trackers, and recaps." },
];

const CONNECTORS_INSTALLED = [
	{ icon: "/vau-icons/msteams.png",  name: "Microsoft Teams",  description: "Sends updates and recaps to Teams channels and threads." },
	{ icon: "/vau-icons/gcal.webp",    name: "Google Calendar",  description: "Reads your calendar to prep meeting notes and schedule nudges." },
	{ icon: "/vau-icons/slack.jpg",    name: "Slack",             description: "Already connected — used across all active jobs." },
	{ icon: "/vau-icons/netsuite.svg", name: "Netsuite",          description: "Pulls project and task data for status reports and recap summaries." },
];

function ConnectorCard({ icon, name, description, installed }: { icon: string; name: string; description: string; installed?: boolean }) {
	return (
		<Box style={{
			background: "white",
			border: "1px solid var(--ax-colors-border-default)",
			borderRadius: 12,
			padding: "20px 20px 16px",
			display: "flex", flexDirection: "column", gap: 12,
			position: "relative",
		}}>
			{installed && (
				<Box style={{ position: "absolute", top: 16, right: 16 }}>
					<IconCheckCircleSolid style={{ color: "#22c55e", width: 20, height: 20 }} />
				</Box>
			)}
			<Box display="flex" alignItems="center" gap="12">
				<Box style={{ width: 36, height: 36, minWidth: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid var(--ax-colors-border-default)", background: "#f8fbf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={icon} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
				</Box>
				<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 18, fontWeight: 700, color: "#202320", lineHeight: "1.1" }}>
					{name}
				</Text>
			</Box>
			<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "1.5" }}>
				{description}
			</Text>
		</Box>
	);
}

// Step 3: Connectors
function ConnectorsStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
	return (
		<Box display="flex" flexDirection="column" alignItems="center" style={{ width: "100%", maxWidth: 640, gap: 24 }}>
			<Box style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
				<h1 style={HEADING}>Connect the tools your teammate runs on</h1>
				<Text color="fg.secondary" style={{ fontSize: 15, lineHeight: "1.6", textAlign: "center" }}>
					Each job you enabled depends on a tool. Set them up in your connector settings so your
					teammate can perform their best work.
				</Text>
			</Box>

			{/* Recommended */}
			<Box style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
				<Box display="flex" alignItems="center" gap="6">
					<span style={CAPTION}>Recommended</span>
					<Tooltip content="These connectors are required for your enabled jobs to run." delayDuration={200}>
						<span style={{ display: "inline-flex" }}>
							<IconCircleInfo size={13} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
						</span>
					</Tooltip>
				</Box>
				<Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
					{CONNECTORS_RECOMMENDED.map((c) => (
						<ConnectorCard key={c.name} icon={c.icon} name={c.name} description={c.description} />
					))}
				</Box>
			</Box>

			{/* Already installed */}
			<Box style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
				<Box display="flex" alignItems="center" gap="6">
					<span style={CAPTION}>Already installed</span>
					<Tooltip content="These connectors are already connected to your workspace." delayDuration={200}>
						<span style={{ display: "inline-flex" }}>
							<IconCircleInfo size={13} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
						</span>
					</Tooltip>
				</Box>
				<Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
					{CONNECTORS_INSTALLED.map((c, i) => (
						<ConnectorCard key={c.name + i} icon={c.icon} name={c.name} description={c.description} installed />
					))}
				</Box>
			</Box>

			<Box display="flex" alignItems="center" justifyContent="space-between" style={{ width: "100%" }}>
				<Button
					appearance="default"
					size="md"
					icon={<IconArrowUpRightFromSquare size={14} />}
					iconPosition="start"
					onClick={() => {}}
				>
					Go to connector settings
				</Button>
				<Box display="flex" alignItems="center" gap="16">
					<button
						onClick={onBack}
						style={{
							background: "none", border: "none", cursor: "pointer",
							fontFamily: "var(--ax-font-family)", fontSize: 14,
							fontWeight: 600, color: "var(--ax-colors-fg-default)",
						}}
					>
						Back
					</button>
					<Button appearance="primary" size="lg" onClick={onNext}>
						Continue →
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

// Step 4: Permissions
function PermissionsStep({ onBack, onFinish }: { onBack: () => void; onFinish: () => void; }) {
	return (
		<Box display="flex" flexDirection="column" alignItems="center" style={{ width: "100%", maxWidth: 600, gap: 40, textAlign: "center" }}>
			<Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				<h1 style={HEADING}>Who can set up a teammate?</h1>
				<Text color="fg.secondary" style={{ fontSize: 15, lineHeight: "1.6" }}>
					Authentication and access permissions are controlled in your user settings — that&apos;s where you
					can specify who gets their own virtual teammate.
				</Text>
			</Box>

			{/* Three circular illustrations */}
			<Box display="flex" alignItems="center" justifyContent="center" gap="24">
				{["/vau-icons/T.png", "/vau-icons/HM.png", "/vau-icons/P.png"].map((src, i) => (
					<Box key={i} style={{
						width: 120, height: 120, borderRadius: "50%",
						background: "#91dbda",
						border: "1px solid var(--ax-colors-border-default)",
						overflow: "hidden",
						display: "flex", alignItems: "center", justifyContent: "center",
						flexShrink: 0,
					}}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={src} alt="" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
					</Box>
				))}
			</Box>

			<Box display="flex" alignItems="center" justifyContent="space-between" style={{ width: "100%" }}>
				<Button
					appearance="default"
					size="md"
					icon={<IconArrowUpRightFromSquare size={14} />}
					iconPosition="start"
					onClick={() => {}}
				>
					Manage in user settings
				</Button>
				<Box display="flex" alignItems="center" gap="16">
					<button
						onClick={onBack}
						style={{
							background: "none", border: "none", cursor: "pointer",
							fontFamily: "var(--ax-font-family)", fontSize: 14,
							fontWeight: 600, color: "var(--ax-colors-fg-default)",
						}}
					>
						Back
					</button>
					<Button appearance="primary" size="lg" onClick={onFinish}>
						Enable teammate
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

// Step 2: Jobs
function JobsStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
	return (
		<Box display="flex" flexDirection="column" alignItems="center" style={{ width: "100%", maxWidth: 540, gap: 24 }}>
			<Box style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
				<h1 style={HEADING}>What should the teammate handle?</h1>
				<Text color="fg.secondary" style={{ fontSize: 15, lineHeight: "1.6", textAlign: "center" }}>
					Enable the jobs that fit your team&apos;s workflow right now. You&apos;re not locked in
					— you can always come back and adjust these later.
				</Text>
			</Box>

			<Box style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
				<Box display="flex" alignItems="center" gap="6" mb="8">
					<span style={CAPTION}>Included jobs</span>
					<Tooltip content="These are the default jobs included with your Chief of Staff." delayDuration={200}>
						<span style={{ display: "inline-flex" }}>
							<IconCircleInfo size={13} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
						</span>
					</Tooltip>
				</Box>
				<Box display="flex" flexDirection="column" gap="8">
					{JOBS.map((job) => (
						<JobRow key={job.id} job={job} />
					))}
				</Box>
			</Box>

			<Box display="flex" alignItems="center" justifyContent="space-between" style={{ width: "100%" }}>
				<button
					onClick={onBack}
					style={{
						background: "none", border: "none", cursor: "pointer",
						fontFamily: "var(--ax-font-family)", fontSize: 14,
						fontWeight: 600, color: "var(--ax-colors-fg-default)",
					}}
				>
					Back
				</button>
				<Button appearance="primary" size="lg" onClick={onNext}>
					Set up connectors →
				</Button>
			</Box>
		</Box>
	);
}

export default function EnableFlow() {
	const router = useRouter();
	const [step, setStep] = useState(1);

	return (
		<Box
			style={{
				width: "100vw",
				height: "100vh",
				background: "#F5F5EF",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "40px 24px",
				boxSizing: "border-box",
				overflowY: "auto",
			}}
		>
			{step === 1 && (
				<EmailDomainStep onNext={() => setStep(2)} />
			)}
			{step === 2 && (
				<JobsStep onBack={() => setStep(1)} onNext={() => setStep(3)} />
			)}
			{step === 3 && (
				<ConnectorsStep onBack={() => setStep(2)} onNext={() => setStep(4)} />
			)}
			{step === 4 && (
				<PermissionsStep onBack={() => setStep(3)} onFinish={() => router.push("/opal/experimental?enabled=chief-of-staff")} />
			)}
		</Box>
	);
}
