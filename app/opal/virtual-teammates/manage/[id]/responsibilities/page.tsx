"use client";

import { useParams } from "next/navigation";
import {
	Badge,
	Box,
	Button,
	Heading,
	Menu,
	MenuContent,
	MenuTrigger,
	Text,
	Tooltip,
} from "@optiaxiom/react";
import { IconAngleDown, IconEllipsisSolid } from "@optiaxiom/icons";
import { VAUS } from "@/app/opal/data/vaus";

type ApprovalMode = "auto" | "ask-first" | "never";

type Responsibility = {
	id: string;
	name: string;
	description: string;
	targetAgent: string;
	scheduledTime: string;
	scheduledDays: string;
	approvalMode: ApprovalMode;
};

const DEFAULT_RESPONSIBILITIES: Responsibility[] = [
	{
		id: "r1",
		name: "Daily brief",
		description: "Delivers your morning brief with everything you need to know for the day ahead.",
		targetAgent: "IM_ability_MC",
		scheduledTime: "8:00 AM EST",
		scheduledDays: "Monday – Friday",
		approvalMode: "auto",
	},
	{
		id: "r2",
		name: "Meeting prep",
		description: "Makes sure you have all you need to nail your meetings each day.",
		targetAgent: "Meeting_agent",
		scheduledTime: "8:00 AM EST",
		scheduledDays: "Monday – Friday",
		approvalMode: "auto",
	},
	{
		id: "r3",
		name: "Weekly wrap",
		description: "Provides you with an end of week summary highlighting goals, wins, and next steps.",
		targetAgent: "Owner",
		scheduledTime: "5:00 PM EST",
		scheduledDays: "Friday",
		approvalMode: "ask-first",
	},
];

function AddResponsibilityIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect width="16" height="16" rx="3.5" fill="#202320" />
			<rect x="3.5" y="3.5" width="3.5" height="3.5" rx="0.75" fill="#ABFF44" />
			<rect x="9" y="3.5" width="3.5" height="3.5" rx="0.75" fill="#ABFF44" />
			<rect x="3.5" y="9" width="3.5" height="3.5" rx="0.75" fill="#ABFF44" />
			<rect x="9" y="9" width="3.5" height="3.5" rx="0.75" fill="#ABFF44" />
		</svg>
	);
}

const APPROVAL_CONFIG: Record<ApprovalMode, { label: string; intent: "success" | "warning" | "danger"; tooltip: string }> = {
	auto:       { label: "Auto",      intent: "success", tooltip: "Runs automatically without any approval." },
	"ask-first": { label: "Ask first", intent: "warning", tooltip: "Requires human approval before running." },
	never:      { label: "Never",     intent: "danger",  tooltip: "This responsibility will never run automatically." },
};

function ApprovalBadge({ mode }: { mode: ApprovalMode }) {
	const { label, intent, tooltip } = APPROVAL_CONFIG[mode];
	return (
		<Tooltip content={tooltip} delayDuration={300}>
			<span style={{ display: "inline-flex" }}>
				<Badge intent={intent} variant="subtle">{label}</Badge>
			</span>
		</Tooltip>
	);
}

export default function ResponsibilitiesPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">Responsibilities</Heading>
			<Text color="fg.secondary" fontSize="md" mb="40">
				{name}&apos;s job description in action. These are the workflows {name} runs automatically — edit, pause, or add new ones anytime.
			</Text>

			{/* Section header */}
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box>
					<Text fontSize="md" color="fg.default" fontWeight="600">Installed responsibilities</Text>
					<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>Built in workflows that {name} can run</Text>
				</Box>

				<Menu options={[{ label: "Create responsibility" }, { label: "Install from catalog" }]}>
					<MenuTrigger asChild>
						<Button appearance="primary" size="md" addonBefore={<AddResponsibilityIcon />} addonAfter={<IconAngleDown />}>
							Add responsibility
						</Button>
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>

			{/* Table — plain HTML to avoid Axiom TableRow/button nesting issues */}
			<div style={{
				borderRadius: 6,
				border: "1px solid var(--ax-colors-border-tertiary)",
				background: "var(--ax-colors-bg-default)",
				overflow: "hidden",
			}}>
				<table style={{ borderCollapse: "collapse", width: "100%" }}>
					<thead>
						<tr style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
							{["Responsibility", "Trigger", "Target agent", "Scheduled", "Approval mode", ""].map((col, i) => (
								<th
									key={i}
									style={{
										padding: "8px 16px",
										textAlign: "left",
										fontFamily: "var(--ax-font-family-mono, monospace)",
										fontSize: "0.75rem",
										textTransform: "uppercase",
										letterSpacing: "0.04em",
										color: "var(--ax-colors-fg-tertiary)",
										fontWeight: 400,
										whiteSpace: "nowrap",
										width: i === 5 ? 48 : undefined,
									}}
								>
									{col}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{DEFAULT_RESPONSIBILITIES.map((row, rowIdx) => (
							<tr
								key={row.id}
								style={{
									borderBottom: rowIdx < DEFAULT_RESPONSIBILITIES.length - 1
										? "1px solid var(--ax-colors-border-tertiary)"
										: undefined,
								}}
							>
								<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
									<Text fontSize="md" color="fg.default" fontWeight="500">{row.name}</Text>
									<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>{row.description}</Text>
								</td>
								<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
									<Badge intent="information" variant="subtle">Scheduled</Badge>
								</td>
								<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
									<Text fontSize="md" color="fg.secondary">{row.targetAgent}</Text>
								</td>
								<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
									<Text fontSize="md" color="fg.default">{row.scheduledTime}</Text>
									<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>{row.scheduledDays}</Text>
								</td>
								<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
									<ApprovalBadge mode={row.approvalMode} />
								</td>
								<td style={{ padding: "12px 16px", verticalAlign: "middle", width: 48, textAlign: "right" }}>
									<Menu options={[
										{ label: "Edit" },
										{ label: "Pause" },
										{ label: "Delete", intent: "danger" as const },
									]}>
										<MenuTrigger asChild>
											<Button appearance="subtle" size="sm" icon={<IconEllipsisSolid />} aria-label="Row actions" />
										</MenuTrigger>
										<MenuContent />
									</Menu>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Box>
	);
}
