"use client";

import { useState } from "react";
import { Box, Button, Input, Select, Text } from "@optiaxiom/react";
import { IconCheck, IconPlus, IconXmark } from "@optimizely/axiom-icons";
import type { BrandColor, BrandPack } from "../../types";

type ColoursTabProps = {
	pack: BrandPack;
};

type ColorEntry = BrandColor & { _id: string };

const ROLE_OPTIONS = (["primary", "secondary", "accent", "neutral", "background", "text"] as BrandColor["role"][])
	.map((role) => ({ label: role.charAt(0).toUpperCase() + role.slice(1), value: role }));

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
			<Input
				value={entry.name}
				onChange={(e) => onChange({ ...entry, name: e.target.value })}
				placeholder="Colour name"
				style={{ flex: 1, minWidth: 0 }}
			/>

			{/* Hex */}
			<Input
				value={entry.hex}
				onChange={(e) => onChange({ ...entry, hex: e.target.value })}
				placeholder="#000000"
				style={{ fontFamily: "monospace", width: 108 }}
			/>

			{/* Role */}
			<Box style={{ width: 144 }}>
				<Select
					value={entry.role}
					onValueChange={(role) => onChange({ ...entry, role: role as BrandColor["role"] })}
					options={ROLE_OPTIONS}
				/>
			</Box>

			{/* Remove */}
			<Button
				appearance="subtle"
				aria-label="Remove colour"
				icon={<IconXmark />}
				onClick={onRemove}
				size="sm"
				style={{ flexShrink: 0 }}
			/>
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
			<Button
				appearance="default"
				icon={<IconPlus />}
				onClick={add}
				size="md"
				style={{
					border: "1.5px dashed var(--ax-colors-border-default)",
					width: "100%",
				}}
			>
				Add colour
			</Button>

			{/* Save */}
			<Box display="flex" justifyContent="end">
				<Button
					appearance="primary"
					size="md"
					icon={saved ? <IconCheck /> : undefined}
					onClick={save}
				>
					{saved ? "Saved" : "Save colours"}
				</Button>
			</Box>
		</Box>
	);
}
