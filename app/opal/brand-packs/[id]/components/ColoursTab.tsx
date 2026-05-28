"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconCheck } from "@optimizely/axiom-icons";
import type { BrandColor, BrandPack } from "../../types";

type ColoursTabProps = {
	pack: BrandPack;
};

type ColorEntry = BrandColor & { _id: string };

const ROLES: BrandColor["role"][] = ["primary", "secondary", "accent", "neutral", "background", "text"];

const inputStyle: React.CSSProperties = {
	background: "var(--ax-colors-bg-secondary)",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: 6,
	color: "var(--ax-colors-fg-default)",
	fontFamily: "inherit",
	fontSize: 13,
	outline: "none",
	padding: "6px 10px",
	transition: "border-color 0.15s",
};

function ColorRow({
	entry,
	onChange,
	onRemove,
}: {
	entry: ColorEntry;
	onChange: (e: ColorEntry) => void;
	onRemove: () => void;
}) {
	return (
		<Box
			alignItems="center"
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			gap="12"
			p="12"
			rounded="lg"
		>
			{/* Color swatch — clicking opens native color picker */}
			<Box
				rounded="md"
				style={{
					background: entry.hex,
					border: "1.5px solid rgba(0,0,0,0.1)",
					cursor: "pointer",
					flexShrink: 0,
					height: 36,
					position: "relative",
					width: 36,
				}}
			>
				<input
					type="color"
					value={entry.hex}
					onChange={(e) => onChange({ ...entry, hex: e.target.value })}
					style={{
						border: 0,
						cursor: "pointer",
						height: "100%",
						inset: 0,
						opacity: 0,
						position: "absolute",
						width: "100%",
					}}
				/>
			</Box>

			{/* Name */}
			<input
				value={entry.name}
				onChange={(e) => onChange({ ...entry, name: e.target.value })}
				placeholder="Colour name"
				style={{ ...inputStyle, flex: 1, minWidth: 0 }}
				onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
				onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
			/>

			{/* Hex */}
			<input
				value={entry.hex}
				onChange={(e) => onChange({ ...entry, hex: e.target.value })}
				placeholder="#000000"
				style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12, width: 96 }}
				onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
				onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
			/>

			{/* Role */}
			<select
				value={entry.role}
				onChange={(e) => onChange({ ...entry, role: e.target.value as BrandColor["role"] })}
				style={{ ...inputStyle, cursor: "pointer", width: 116 }}
			>
				{ROLES.map((r) => (
					<option key={r} value={r}>
						{r.charAt(0).toUpperCase() + r.slice(1)}
					</option>
				))}
			</select>

			{/* Remove */}
			<button
				type="button"
				onClick={onRemove}
				aria-label="Remove colour"
				style={{
					alignItems: "center",
					background: "transparent",
					border: 0,
					borderRadius: 4,
					color: "var(--ax-colors-fg-tertiary)",
					cursor: "pointer",
					display: "flex",
					flexShrink: 0,
					fontSize: 18,
					fontWeight: 300,
					lineHeight: 1,
					padding: "2px 4px",
					transition: "color 0.15s",
				}}
				onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ax-colors-fg-default)"; }}
				onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ax-colors-fg-tertiary)"; }}
			>
				×
			</button>
		</Box>
	);
}

export function ColoursTab({ pack }: ColoursTabProps) {
	const [entries, setEntries] = useState<ColorEntry[]>(() =>
		pack.colors.map((c, i) => ({ ...c, _id: `c${i}` }))
	);
	const [saved, setSaved] = useState(false);

	const update = (id: string, updated: ColorEntry) =>
		setEntries((p) => p.map((e) => (e._id === id ? updated : e)));
	const remove = (id: string) =>
		setEntries((p) => p.filter((e) => e._id !== id));
	const add = () =>
		setEntries((p) => [
			...p,
			{ _id: `c${Date.now()}`, hex: "#AAAAAA", name: "", role: "accent" },
		]);
	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 680 }}>
			{/* Column headers */}
			<Box
				alignItems="center"
				display="flex"
				gap="12"
				style={{ paddingLeft: 48, paddingRight: 28 }}
			>
				<Text
					color="fg.tertiary"
					fontSize="xs"
					style={{ flex: 1, letterSpacing: "0.06em", textTransform: "uppercase" }}
				>
					Name
				</Text>
				<Text
					color="fg.tertiary"
					fontSize="xs"
					style={{ letterSpacing: "0.06em", textTransform: "uppercase", width: 96 }}
				>
					Hex
				</Text>
				<Text
					color="fg.tertiary"
					fontSize="xs"
					style={{ letterSpacing: "0.06em", textTransform: "uppercase", width: 116 }}
				>
					Role
				</Text>
			</Box>

			{/* Color rows */}
			<Box display="flex" flexDirection="column" gap="6">
				{entries.map((e) => (
					<ColorRow
						key={e._id}
						entry={e}
						onChange={(u) => update(e._id, u)}
						onRemove={() => remove(e._id)}
					/>
				))}
			</Box>

			{/* Add colour */}
			<button
				type="button"
				onClick={add}
				style={{
					alignItems: "center",
					background: "transparent",
					border: "1.5px dashed var(--ax-colors-border-default)",
					borderRadius: 8,
					color: "var(--ax-colors-fg-secondary)",
					cursor: "pointer",
					display: "flex",
					fontSize: 13,
					fontWeight: 500,
					gap: 6,
					justifyContent: "center",
					padding: "10px",
					transition: "border-color 0.15s, color 0.15s",
					width: "100%",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)";
					e.currentTarget.style.color = "var(--ax-colors-fg-accent)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.borderColor = "var(--ax-colors-border-default)";
					e.currentTarget.style.color = "var(--ax-colors-fg-secondary)";
				}}
			>
				+ Add colour
			</button>

			{/* Save */}
			<Box display="flex" justifyContent="end">
				<Button
					appearance="primary"
					size="sm"
					icon={saved ? <IconCheck /> : undefined}
					onClick={save}
				>
					{saved ? "Saved" : "Save colours"}
				</Button>
			</Box>
		</Box>
	);
}
