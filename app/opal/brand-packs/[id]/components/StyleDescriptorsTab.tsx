"use client";

import { useState, useRef } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconCheck } from "@optimizely/axiom-icons";

type DescriptorGroup = {
	id: string;
	label: string;
	hint: string;
	items: string[];
};

const INITIAL_GROUPS: DescriptorGroup[] = [
	{
		id: "photography",
		label: "Photography Style",
		hint: "How images should feel — lighting, motion, mood",
		items: ["Authentic", "High-contrast", "Dynamic", "Outdoors"],
	},
	{
		id: "colour-mood",
		label: "Colour Mood",
		hint: "Emotional qualities the colour palette conveys",
		items: ["Vibrant", "Natural", "High energy"],
	},
	{
		id: "composition",
		label: "Composition",
		hint: "Framing and layout preferences for visual assets",
		items: ["Rule of thirds", "Wide angle", "Action shots"],
	},
	{
		id: "avoid",
		label: "Do Not Use",
		hint: "Styles or elements to avoid in all brand content",
		items: [],
	},
];

function Chip({
	label,
	onRemove,
}: {
	label: string;
	onRemove: () => void;
}) {
	return (
		<Box
			alignItems="center"
			bg="bg.accent.subtle"
			display="inline-flex"
			gap="6"
			rounded="full"
			style={{ padding: "5px 10px 5px 12px" }}
		>
			<Text color="fg.accent" fontWeight="500" style={{ fontSize: 13 }}>
				{label}
			</Text>
			<button
				type="button"
				onClick={onRemove}
				aria-label={`Remove ${label}`}
				style={{
					alignItems: "center",
					background: "transparent",
					border: 0,
					borderRadius: "50%",
					color: "var(--ax-colors-fg-accent)",
					cursor: "pointer",
					display: "flex",
					fontSize: 14,
					fontWeight: 300,
					lineHeight: 1,
					opacity: 0.6,
					padding: 0,
					transition: "opacity 0.12s",
				}}
				onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
				onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; }}
			>
				×
			</button>
		</Box>
	);
}

function DescriptorSection({
	group,
	onChange,
}: {
	group: DescriptorGroup;
	onChange: (g: DescriptorGroup) => void;
}) {
	const [draft, setDraft] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const add = () => {
		const val = draft.trim();
		if (!val || group.items.includes(val)) return;
		onChange({ ...group, items: [...group.items, val] });
		setDraft("");
		inputRef.current?.focus();
	};

	const remove = (item: string) =>
		onChange({ ...group, items: group.items.filter((i) => i !== item) });

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="12"
			p="20"
			rounded="xl"
			shadow="sm"
		>
			{/* Section header */}
			<Box display="flex" flexDirection="column" gap="2">
				<Text fontWeight="600" style={{ fontSize: 14 }}>
					{group.label}
				</Text>
				<Text color="fg.tertiary" fontSize="xs">
					{group.hint}
				</Text>
			</Box>

			{/* Chips */}
			{group.items.length > 0 && (
				<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
					{group.items.map((item) => (
						<Chip key={item} label={item} onRemove={() => remove(item)} />
					))}
				</Box>
			)}

			{/* Add input */}
			<Box alignItems="center" display="flex" gap="8">
				<input
					ref={inputRef}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder={`Add to ${group.label.toLowerCase()}…`}
					onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
					style={{
						background: "var(--ax-colors-bg-secondary)",
						border: "1px solid var(--ax-colors-border-default)",
						borderRadius: 6,
						color: "var(--ax-colors-fg-default)",
						flex: 1,
						fontFamily: "inherit",
						fontSize: 13,
						outline: "none",
						padding: "6px 10px",
						transition: "border-color 0.15s",
					}}
					onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
					onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
				/>
				<Button
					appearance="subtle"
					size="sm"
					onClick={add}
					style={{ flexShrink: 0 }}
				>
					Add
				</Button>
			</Box>
		</Box>
	);
}

export function StyleDescriptorsTab() {
	const [groups, setGroups] = useState<DescriptorGroup[]>(INITIAL_GROUPS);
	const [saved, setSaved] = useState(false);

	const updateGroup = (updated: DescriptorGroup) =>
		setGroups((p) => p.map((g) => (g.id === updated.id ? updated : g)));

	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 680 }}>
			<Box display="flex" flexDirection="column" gap="4">
				<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.5 }}>
					Style descriptors guide Opal's visual decisions — photography selection, mood, and
					composition choices when generating or sourcing content.
				</Text>
			</Box>

			{groups.map((group) => (
				<DescriptorSection key={group.id} group={group} onChange={updateGroup} />
			))}

			{/* Save */}
			<Box display="flex" justifyContent="end">
				<Button
					appearance="primary"
					size="sm"
					icon={saved ? <IconCheck /> : undefined}
					onClick={save}
				>
					{saved ? "Saved" : "Save descriptors"}
				</Button>
			</Box>
		</Box>
	);
}
