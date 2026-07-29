"use client";

import { useEffect, useState } from "react";
import { Box, Text } from "@optiaxiom/react";
import { IconXmark } from "@optimizely/axiom-icons";

type Entry = { id: string; text: string };
type Field = { key: string; label: string; entries: Entry[] };

const INITIAL_FIELDS: Field[] = [
	{
		key: "photography",
		label: "Photography Style",
		entries: [
			{ id: "p1", text: "Clean, editorial photography — subjects sharp against considered backgrounds" },
			{ id: "p2", text: "Natural or studio-controlled lighting; avoid harsh flash or warm tones" },
			{ id: "p3", text: "People shown in active, confident, forward-moving contexts" },
		],
	},
	{
		key: "colourMood",
		label: "Colour Mood",
		entries: [
			{ id: "cm1", text: "Electric green as the dominant accent — used boldly, not sparingly" },
			{ id: "cm2", text: "High contrast between black/white base and accent colours" },
			{ id: "cm3", text: "Avoid warm yellows, browns, or muted pastels outside brand palette" },
		],
	},
	{
		key: "composition",
		label: "Composition",
		entries: [
			{ id: "co1", text: "Strong geometric structure — grid-aligned, intentional negative space" },
			{ id: "co2", text: "Typography-forward layouts: headlines treated as visual elements" },
			{ id: "co3", text: "Generous white space; never cluttered or busy" },
		],
	},
	{
		key: "avoid",
		label: "What to Avoid",
		entries: [
			{ id: "a1", text: "Generic stock photography: handshakes, people pointing at screens" },
			{ id: "a2", text: "Soft or desaturated colour grading" },
			{ id: "a3", text: "Decorative gradients or lens flares" },
		],
	},
];

const INITIAL_CONSTRAINTS: Entry[] = [
	{ id: "c1", text: "Must never alter, mimic, or recreate illustration components — use as-is or exclude." },
];

function uid() {
	return `e-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type Props = { onSave: () => void; onFilledChange: (filled: boolean) => void };

export function DescriptorsSection({ onSave, onFilledChange }: Props) {
	const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
	const [constraints, setConstraints] = useState<Entry[]>(INITIAL_CONSTRAINTS);

	const updateEntry = (key: string, id: string, text: string) => {
		setFields((prev) =>
			prev.map((f) =>
				f.key === key
					? { ...f, entries: f.entries.map((e) => (e.id === id ? { ...e, text } : e)) }
					: f
			)
		);
		onSave();
	};

	const addEntry = (key: string) => {
		setFields((prev) =>
			prev.map((f) => (f.key === key ? { ...f, entries: [...f.entries, { id: uid(), text: "" }] } : f))
		);
	};

	const removeEntry = (key: string, id: string) => {
		setFields((prev) =>
			prev.map((f) =>
				f.key === key ? { ...f, entries: f.entries.filter((e) => e.id !== id) } : f
			)
		);
		onSave();
	};

	const moveEntry = (key: string, id: string, dir: "up" | "down") => {
		setFields((prev) =>
			prev.map((f) => {
				if (f.key !== key) return f;
				const idx = f.entries.findIndex((e) => e.id === id);
				if (dir === "up" && idx === 0) return f;
				if (dir === "down" && idx === f.entries.length - 1) return f;
				const next = [...f.entries];
				const swap = dir === "up" ? idx - 1 : idx + 1;
				[next[idx], next[swap]] = [next[swap], next[idx]];
				return { ...f, entries: next };
			})
		);
	};

	const updateConstraint = (id: string, text: string) => {
		setConstraints((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
		onSave();
	};

	const addConstraint = () => {
		setConstraints((prev) => [...prev, { id: uid(), text: "" }]);
	};

	const removeConstraint = (id: string) => {
		setConstraints((prev) => prev.filter((c) => c.id !== id));
		onSave();
	};

	const moveConstraint = (id: string, dir: "up" | "down") => {
		setConstraints((prev) => {
			const idx = prev.findIndex((c) => c.id === id);
			if (dir === "up" && idx === 0) return prev;
			if (dir === "down" && idx === prev.length - 1) return prev;
			const next = [...prev];
			const swap = dir === "up" ? idx - 1 : idx + 1;
			[next[idx], next[swap]] = [next[swap], next[idx]];
			return next;
		});
	};

	const hasFilled = fields.some((f) => f.entries.some((e) => e.text.trim().length > 0));

	useEffect(() => {
		onFilledChange(hasFilled);
	}, [hasFilled, onFilledChange]);

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			id="section-descriptors"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
		>
			<Box display="flex" flexDirection="column" gap="32" p="32">
				{/* Descriptor fields */}
				{fields.map((field) => (
					<Box display="flex" flexDirection="column" gap="8" key={field.key}>
						<Text
							style={{
								color: "var(--ax-colors-fg-tertiary)",
								fontSize: 11,
								fontWeight: 700,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
							}}
						>
							{field.label}
						</Text>

						<Box display="flex" flexDirection="column" gap="4">
							{field.entries.map((entry, i) => (
								<EntryRow
									key={entry.id}
									entry={entry}
									isFirst={i === 0}
									isLast={i === field.entries.length - 1}
									onChange={(text) => updateEntry(field.key, entry.id, text)}
									onDelete={() => removeEntry(field.key, entry.id)}
									onMoveUp={() => moveEntry(field.key, entry.id, "up")}
									onMoveDown={() => moveEntry(field.key, entry.id, "down")}
								/>
							))}
						</Box>

						<AddButton label="+ Add" onClick={() => addEntry(field.key)} />
					</Box>
				))}

				{/* Divider */}
				<Box style={{ background: "rgba(0,0,0,0.08)", height: 1 }} />

				{/* Hard Constraints */}
				<Box display="flex" flexDirection="column" gap="8">
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontWeight="700" style={{ fontSize: 15, letterSpacing: "-0.01em" }}>
							Hard Constraints
						</Text>
						<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.6, maxWidth: 520 }}>
							Non-negotiable rules Opal must always follow regardless of the prompt. These override everything else — use them for legal requirements, protected assets, and absolute brand rules.
						</Text>
					</Box>

					<Box display="flex" flexDirection="column" gap="4">
						{constraints.map((entry, i) => (
							<EntryRow
								key={entry.id}
								entry={entry}
								isFirst={i === 0}
								isLast={i === constraints.length - 1}
								isConstraint
								onChange={(text) => updateConstraint(entry.id, text)}
								onDelete={() => removeConstraint(entry.id)}
								onMoveUp={() => moveConstraint(entry.id, "up")}
								onMoveDown={() => moveConstraint(entry.id, "down")}
							/>
						))}
					</Box>

					<AddButton label="+ Add constraint" onClick={addConstraint} />
				</Box>
			</Box>
		</Box>
	);
}

function EntryRow({
	entry,
	isConstraint = false,
	isFirst,
	isLast,
	onChange,
	onDelete,
	onMoveDown,
	onMoveUp,
}: {
	entry: Entry;
	isConstraint?: boolean;
	isFirst: boolean;
	isLast: boolean;
	onChange: (text: string) => void;
	onDelete: () => void;
	onMoveDown: () => void;
	onMoveUp: () => void;
}) {
	const bg = isConstraint ? "rgba(34, 110, 60, 0.07)" : "rgba(60, 90, 60, 0.05)";
	const border = isConstraint ? "1px solid rgba(34, 110, 60, 0.2)" : "1px solid rgba(60, 90, 60, 0.14)";

	return (
		<Box
			alignItems="center"
			display="flex"
			style={{
				background: bg,
				border,
				borderRadius: 8,
				overflow: "hidden",
			}}
		>
			<input
				value={entry.text}
				onChange={(e) => onChange(e.target.value)}
				style={{
					background: "transparent",
					border: "none",
					color: "var(--ax-colors-fg-default)",
					flex: 1,
					fontSize: 14,
					lineHeight: 1.5,
					outline: "none",
					padding: "12px 12px 12px 16px",
				}}
			/>

			{/* Up/down sort */}
			<Box
				display="flex"
				flexDirection="column"
				style={{ flexShrink: 0, padding: "6px 4px" }}
			>
				<SortButton onClick={onMoveUp} disabled={isFirst} direction="up" />
				<SortButton onClick={onMoveDown} disabled={isLast} direction="down" />
			</Box>

			{/* Delete */}
			<Box
				onClick={onDelete}
				style={{
					alignItems: "center",
					borderLeft: border,
					color: "var(--ax-colors-fg-tertiary)",
					cursor: "pointer",
					display: "flex",
					flexShrink: 0,
					height: "100%",
					justifyContent: "center",
					padding: "0 10px",
					transition: "color 0.1s",
				}}
			>
				<IconXmark size={14} />
			</Box>
		</Box>
	);
}

function SortButton({
	direction,
	disabled,
	onClick,
}: {
	direction: "up" | "down";
	disabled: boolean;
	onClick: () => void;
}) {
	return (
		<Box
			onClick={disabled ? undefined : onClick}
			style={{
				alignItems: "center",
				cursor: disabled ? "default" : "pointer",
				display: "flex",
				justifyContent: "center",
				opacity: disabled ? 0.25 : 0.5,
				padding: "2px 6px",
				transition: "opacity 0.1s",
			}}
		>
			<svg width="10" height="6" viewBox="0 0 10 6" fill="none">
				{direction === "up" ? (
					<path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				) : (
					<path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				)}
			</svg>
		</Box>
	);
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<Box
			onClick={onClick}
			style={{
				border: "1.5px dashed rgba(0,0,0,0.22)",
				borderRadius: 6,
				color: "var(--ax-colors-fg-secondary)",
				cursor: "pointer",
				display: "inline-block",
				fontSize: 13,
				fontWeight: 500,
				padding: "5px 14px",
				transition: "border-color 0.1s, color 0.1s",
				width: "fit-content",
			}}
		>
			{label}
		</Box>
	);
}
