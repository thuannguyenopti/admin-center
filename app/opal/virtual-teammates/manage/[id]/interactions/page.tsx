"use client";

import { useState } from "react";
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
} from "@optiaxiom/react";
import { IconAngleDown, IconEllipsisSolid } from "@optiaxiom/icons";
import { VAUS } from "@/app/opal/data/vaus";

type InteractionStatus = "active" | "disabled";

type Interaction = {
	id: string;
	ability: string;
	description: string;
	targetAgent: string;
	status: InteractionStatus;
};

const DEFAULT_INTERACTIONS: Interaction[] = [
	{
		id: "i1",
		ability: "Instant message",
		description: "How randy is able to communicate with you and get work done on a daily basis.",
		targetAgent: "IM_ability_MC",
		status: "active",
	},
];

function AddInteractionIcon() {
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

function StatusBadge({ status }: { status: InteractionStatus }) {
	return status === "active"
		? <Badge intent="success" variant="subtle">Active</Badge>
		: <Badge variant="subtle">Disabled</Badge>;
}

export default function InteractionsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [rows, setRows] = useState<Interaction[]>(DEFAULT_INTERACTIONS);

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">Interactions</Heading>
			<Text color="fg.secondary" fontSize="md" mb="40">
				The ways {name} can be reached — by teammates, tools, or external events. Each interaction tells {name} what to do.
			</Text>

			{/* Section header */}
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box>
					<Text fontSize="md" color="fg.default" fontWeight="600">Enabled interactions</Text>
					<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>Channels and modes by which {name} can reach you</Text>
				</Box>

				<Menu options={[{ label: "Create interaction" }, { label: "Install from catalog" }]}>
					<MenuTrigger asChild>
						<Button appearance="primary" size="md" addonBefore={<AddInteractionIcon />} addonAfter={<IconAngleDown />}>
							Add interaction
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
							{["Ability", "Target agent", "Status", ""].map((col, i) => (
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
										width: i === 3 ? 48 : undefined,
									}}
								>
									{col}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((row, rowIdx) => (
							<tr
								key={row.id}
								style={{
									borderBottom: rowIdx < rows.length - 1
										? "1px solid var(--ax-colors-border-tertiary)"
										: undefined,
								}}
							>
								<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
									<Text fontSize="md" color="fg.default" fontWeight="500">{row.ability}</Text>
									<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>{row.description}</Text>
								</td>
								<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
									<Text fontSize="md" color="fg.secondary">{row.targetAgent}</Text>
								</td>
								<td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
									<StatusBadge status={row.status} />
								</td>
								<td style={{ padding: "12px 16px", verticalAlign: "middle", width: 48, textAlign: "right" }}>
									<Menu options={[
										{ label: "Edit" },
										{ label: "Disable" },
										{ label: "Delete", intent: "danger" as const, execute: () => setRows((prev) => prev.filter((r) => r.id !== row.id)) },
									]}>
										<MenuTrigger asChild>
											<Button appearance="subtle" size="sm" icon={<IconEllipsisSolid />} aria-label="Row actions" />
										</MenuTrigger>
										<MenuContent />
									</Menu>
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={4} style={{ padding: "32px 16px", textAlign: "center" }}>
									<Text fontSize="sm" color="fg.tertiary">No interactions configured</Text>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</Box>
	);
}
