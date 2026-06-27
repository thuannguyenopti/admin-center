"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
	Box,
	Button,
	Heading,
	Menu,
	MenuContent,
	MenuTrigger,
	Text,
} from "@optiaxiom/react";
import { IconAngleDown, IconTrashCan } from "@optiaxiom/icons";
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

type Responsibility = {
	id: string;
	name: string;
	active: boolean;
	targetAgent: string;
};

const DEFAULT_RESPONSIBILITIES: Responsibility[] = [
	{ id: "r1", name: "Daily_Brief", active: true, targetAgent: "IM_Ability_MC" },
	{ id: "r2", name: "Meeting_Prep", active: true, targetAgent: "Lorem ipsum dolor" },
	{ id: "r3", name: "Weekly_Wrap", active: true, targetAgent: "Lorem ipsum dolor" },
];

const ADD_OPTIONS = [
	{ label: "Create responsibility", onClick: () => {} },
	{ label: "Install from catalog", onClick: () => {} },
];

function AddResponsibilityIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect width="18" height="18" rx="4" fill="#202320" />
			<path d="M9 4.5V13.5M4.5 9H13.5" stroke="#ABFF44" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function DragHandle() {
	return (
		<svg
			width="12"
			height="20"
			viewBox="0 0 12 20"
			fill="none"
			style={{ cursor: "grab", flexShrink: 0, display: "block" }}
		>
			<circle cx="3" cy="4" r="1.5" fill="var(--ax-colors-fg-tertiary)" />
			<circle cx="9" cy="4" r="1.5" fill="var(--ax-colors-fg-tertiary)" />
			<circle cx="3" cy="10" r="1.5" fill="var(--ax-colors-fg-tertiary)" />
			<circle cx="9" cy="10" r="1.5" fill="var(--ax-colors-fg-tertiary)" />
			<circle cx="3" cy="16" r="1.5" fill="var(--ax-colors-fg-tertiary)" />
			<circle cx="9" cy="16" r="1.5" fill="var(--ax-colors-fg-tertiary)" />
		</svg>
	);
}

function ScheduledBadge() {
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
			Scheduled
		</span>
	);
}

export default function ResponsibilitiesPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [rows, setRows] = useState<Responsibility[]>(DEFAULT_RESPONSIBILITIES);
	const [dragIndex, setDragIndex] = useState<number | null>(null);

	const handleDragStart = (index: number) => setDragIndex(index);

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (dragIndex === null || dragIndex === index) return;
		const next = [...rows];
		const [moved] = next.splice(dragIndex, 1);
		next.splice(index, 0, moved);
		setRows(next);
		setDragIndex(index);
	};

	const handleDrop = () => setDragIndex(null);

	const handleDelete = (rowId: string) =>
		setRows((prev) => prev.filter((r) => r.id !== rowId));

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">
				Responsibilities
			</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				{name}&apos;s job description in action. These are the workflows {name} runs
				automatically — edit, pause, or add new ones anytime.
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
							Installed responsibilities
						</Text>
						<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 2 }}>
							Built in workflows that {name} can currently run
						</Text>
					</Box>

					<Menu options={ADD_OPTIONS}>
						<MenuTrigger asChild>
							<Button
								appearance="primary"
								size="md"
								addonBefore={<AddResponsibilityIcon />}
								addonAfter={<IconAngleDown />}
							>
								Add responsibility
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
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
						<Box style={{ width: 32, flexShrink: 0 }} />
						<span style={{ ...TABLE_HEADER, width: 56, flexShrink: 0 }}>Order</span>
						<span style={{ ...TABLE_HEADER, flex: 1 }}>Responsibility</span>
						<span style={{ ...TABLE_HEADER, width: 140, flexShrink: 0 }}>Trigger</span>
						<span style={{ ...TABLE_HEADER, width: 80, flexShrink: 0 }}>Active</span>
						<span style={{ ...TABLE_HEADER, flex: 1 }}>Target agent</span>
						<Box style={{ width: 36, flexShrink: 0 }} />
					</Box>

					{/* Data rows */}
					{rows.map((row, i) => (
						<Box
							key={row.id}
							display="flex"
							alignItems="center"
							draggable
							onDragStart={() => handleDragStart(i)}
							onDragOver={(e: React.DragEvent) => handleDragOver(e, i)}
							onDrop={handleDrop}
							style={{
								padding: "0 16px",
								height: 52,
								borderTop: "1px solid var(--ax-colors-border-secondary)",
								background:
									dragIndex === i
										? "var(--ax-colors-bg-secondary)"
										: undefined,
								userSelect: "none",
							}}
						>
							{/* Drag handle */}
							<Box
								style={{
									width: 32,
									flexShrink: 0,
									display: "flex",
									alignItems: "center",
								}}
							>
								<DragHandle />
							</Box>

							{/* Order number */}
							<Box style={{ width: 56, flexShrink: 0 }}>
								<Text fontSize="md" color="fg.default">
									{i + 1}
								</Text>
							</Box>

							{/* Responsibility name */}
							<Box style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
								<Text
									fontSize="md"
									color="fg.default"
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{row.name}
								</Text>
							</Box>

							{/* Trigger */}
							<Box style={{ width: 140, flexShrink: 0 }}>
								<ScheduledBadge />
							</Box>

							{/* Active */}
							<Box style={{ width: 80, flexShrink: 0 }}>
								<Text fontSize="md" color="fg.default">Yes</Text>
							</Box>

							{/* Target agent */}
							<Box style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
								<Text
									fontSize="md"
									color="fg.secondary"
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{row.targetAgent}
								</Text>
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
									aria-label="Delete responsibility"
									onClick={() => handleDelete(row.id)}
								/>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}
