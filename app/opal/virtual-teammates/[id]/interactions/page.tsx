"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
	Box,
	Button,
	Heading,
	Text,
} from "@optiaxiom/react";
import { IconTrashCan } from "@optiaxiom/icons";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const TABLE_HEADER: React.CSSProperties = {
	...CAPTION,
	color: "var(--ax-colors-fg-tertiary)",
};

type Interaction = {
	id: string;
	ability: string;
	targetAgent: string;
	status: "enabled" | "disabled";
};

const DEFAULT_INTERACTIONS: Interaction[] = [
	{ id: "i1", ability: "Instant Message", targetAgent: "IM_Ability_MC", status: "enabled" },
];

function AddAbilityIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect width="18" height="18" rx="4" fill="#202320" />
			<path d="M9 4.5V13.5M4.5 9H13.5" stroke="#ABFF44" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function EnabledBadge() {
	return (
		<span
			style={{
				...CAPTION,
				background: "#eeffd9",
				color: "#226b1e",
				padding: "2px 8px",
				borderRadius: 32,
				whiteSpace: "nowrap" as const,
				display: "inline-block",
			}}
		>
			Enabled
		</span>
	);
}

export default function InteractionsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [rows, setRows] = useState<Interaction[]>(DEFAULT_INTERACTIONS);

	const handleDelete = (rowId: string) =>
		setRows((prev) => prev.filter((r) => r.id !== rowId));

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">
				Interactions
			</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				The ways {name} can be reached — by teammates, tools, or external events.
				Each interaction tells {name} what to do when something comes in.
			</Text>

			{/* Card */}
			<Box
				bg="bg.default"
				style={{
					border: "1px solid var(--ax-colors-border-default)",
					borderRadius: 12,
					padding: 24,
				}}
			>
				{/* Card header */}
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					mb="16"
				>
					<Box>
						<Text fontSize="md" color="fg.default" fontWeight="600">
							Enabled interactions
						</Text>
						<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>
							How {name} is able to do what they do
						</Text>
					</Box>

					<Button
						appearance="primary"
						size="md"
						addonBefore={<AddAbilityIcon />}
					>
						Add ability
					</Button>
				</Box>

				{/* Table */}
				<Box
					bg="bg.default"
					style={{
						border: "1px solid var(--ax-colors-border-secondary)",
						borderRadius: 6,
						overflow: "hidden",
					}}
				>
					{/* Header row */}
					<Box
						display="flex"
						alignItems="center"
						style={{
							padding: "10px 16px",
							borderBottom: "1px solid var(--ax-colors-border-secondary)",
						}}
					>
						<span style={{ ...TABLE_HEADER, flex: 1 }}>Ability</span>
						<span style={{ ...TABLE_HEADER, flex: 1 }}>Target agent</span>
						<span style={{ ...TABLE_HEADER, width: 140, flexShrink: 0 }}>Status</span>
						<Box style={{ width: 36, flexShrink: 0 }} />
					</Box>

					{/* Data rows */}
					{rows.map((row) => (
						<Box
							key={row.id}
							display="flex"
							alignItems="center"
							style={{
								padding: "0 16px",
								height: 60,
								borderTop: "1px solid var(--ax-colors-border-secondary)",
							}}
						>
							{/* Ability */}
							<Box style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
								<Text fontSize="md" color="fg.default">
									{row.ability}
								</Text>
							</Box>

							{/* Target agent */}
							<Box style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
								<Text fontSize="md" color="fg.secondary">
									{row.targetAgent}
								</Text>
							</Box>

							{/* Status */}
							<Box style={{ width: 140, flexShrink: 0 }}>
								{row.status === "enabled" ? (
									<EnabledBadge />
								) : (
									<span
										style={{
											...CAPTION,
											background: "var(--ax-colors-bg-secondary)",
											color: "var(--ax-colors-fg-tertiary)",
											padding: "2px 8px",
											borderRadius: 32,
											display: "inline-block",
										}}
									>
										Disabled
									</span>
								)}
							</Box>

							{/* Delete */}
							<Box
								style={{
									width: 36,
									flexShrink: 0,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Button
									appearance="subtle"
									size="sm"
									icon={
										<IconTrashCan
											style={{ color: "var(--ax-colors-fg-tertiary)" }}
										/>
									}
									aria-label="Delete interaction"
									onClick={() => handleDelete(row.id)}
								/>
							</Box>
						</Box>
					))}

					{rows.length === 0 && (
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							style={{
								height: 80,
								borderTop: "1px solid var(--ax-colors-border-secondary)",
							}}
						>
							<Text fontSize="sm" color="fg.tertiary">
								No interactions configured
							</Text>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
