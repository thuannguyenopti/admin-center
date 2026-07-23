"use client";

import { useState } from "react";
import { Badge, Box, Button, Text } from "@optiaxiom/react";
import { IconPlus, IconXmark } from "@optimizely/axiom-icons";
import type { BrandColor, BrandPack } from "../../types";
import { EditableText } from "./NewTabShared";

type ColorEntry = {
	id: string;
	hex: string;
	name: string;
	role: BrandColor["role"];
	description: string;
};

const ROLES: Array<BrandColor["role"]> = [
	"primary", "secondary", "accent", "neutral", "background", "text",
];

function hexToRgb(hex: string): string {
	if (!hex || hex.length < 7) return "";
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	if (isNaN(r) || isNaN(g) || isNaN(b)) return "";
	return `${r}, ${g}, ${b}`;
}

function swatchTextColor(hex: string): string {
	if (!hex || hex.length < 7) return "#ffffff";
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.55 ? "#000000" : "#ffffff";
}

type Props = { pack: BrandPack; onSave: () => void };

export function ColoursSection({ pack, onSave }: Props) {
	const [colors, setColors] = useState<ColorEntry[]>(
		pack.colors.map((c, i) => ({
			id: `${c.hex}-${i}`,
			hex: c.hex,
			name: c.name,
			role: c.role,
			description: "",
		}))
	);

	const update = (id: string, updates: Partial<ColorEntry>) => {
		setColors((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
		onSave();
	};

	const cycleRole = (id: string, current: BrandColor["role"]) => {
		const idx = ROLES.indexOf(current);
		update(id, { role: ROLES[(idx + 1) % ROLES.length] });
	};

	const addColor = () => {
		setColors((prev) => [
			...prev,
			{ id: `new-${Date.now()}`, hex: "#888888", name: "New colour", role: "accent", description: "" },
		]);
		onSave();
	};

	const removeColor = (id: string) => {
		setColors((prev) => prev.filter((c) => c.id !== id));
		onSave();
	};

	const primary = colors[0];
	const rest = colors.slice(1);

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			id="section-colours"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
		>
			{/* Header */}
			<Box p="32" pb="24">
				{/* Top row: PRIMARY PALETTE tag + Add colour button */}
				<Box alignItems="center" display="flex" justifyContent="space-between" mb="20">
					<Box
						style={{
							background: "var(--ax-colors-bg-accent-subtle)",
							borderRadius: 4,
							color: "var(--ax-colors-fg-accent-strong)",
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.08em",
							padding: "3px 8px",
							textTransform: "uppercase",
						}}
					>
						Primary Palette
					</Box>
					<Button appearance="primary" icon={<IconPlus />} onClick={addColor} size="sm">
						Add colour
					</Button>
				</Box>

				{/* Two-column content */}
				<Box display="flex" gap="24">
					{/* Left: text — fixed width */}
					<Box display="flex" flexDirection="column" gap="12" style={{ flexShrink: 0, width: 200 }}>
						<Text
							style={{
								fontSize: 26,
								fontWeight: 800,
								letterSpacing: "-0.02em",
								lineHeight: 1.15,
							}}
						>
							Bold. Precise. Unmistakable.
						</Text>
						<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.6 }}>
							These colours define the brand&apos;s personality and keep generated content consistent across channels.
						</Text>
					</Box>

					{/* Right: palette swatches — flex fills remaining space, each swatch proportional */}
					<Box display="flex" gap="6" style={{ alignItems: "flex-end", flex: 1, minWidth: 0 }}>
						{/* Primary — 2× flex weight, same height as rest */}
						{primary && (
							<Box display="flex" flexDirection="column" gap="6" style={{ flex: 2, minWidth: 0 }}>
								<Box
									style={{
										background: primary.hex,
										border: "1px solid rgba(0,0,0,0.08)",
										borderRadius: 12,
										height: 160,
										overflow: "hidden",
										position: "relative",
										width: "100%",
									}}
								>
									{/* Name overlaid at bottom-left, large */}
									<Box style={{ bottom: 12, left: 12, position: "absolute" }}>
										<Text
											style={{
												color: swatchTextColor(primary.hex),
												fontSize: 20,
												fontWeight: 700,
												lineHeight: 1.1,
											}}
										>
											{primary.name}
										</Text>
									</Box>
								</Box>
								<Text color="fg.accent" fontSize="sm" fontWeight="600">{primary.name}</Text>
								<Text color="fg.tertiary" style={{ fontFamily: "monospace", fontSize: 11 }}>
									{primary.hex}
								</Text>
							</Box>
						)}

						{/* Secondary colours — same height as primary, role label centred */}
						{rest.map((color) => (
							<Box display="flex" flexDirection="column" gap="6" key={color.id} style={{ flex: 1, minWidth: 0 }}>
								<Box
									style={{
										background: color.hex,
										border: "1px solid rgba(0,0,0,0.08)",
										borderRadius: 10,
										height: 160,
										overflow: "hidden",
										position: "relative",
										width: "100%",
									}}
								>
									{/* Role label centred in the middle */}
									<Box
										style={{
											alignItems: "center",
											bottom: 0,
											display: "flex",
											justifyContent: "center",
											left: 0,
											position: "absolute",
											right: 0,
											top: 0,
										}}
									>
										<Text
											style={{
												color: swatchTextColor(color.hex),
												fontSize: 10,
												fontWeight: 700,
												letterSpacing: "0.04em",
												textAlign: "center",
												textTransform: "capitalize",
											}}
										>
											{color.role}
										</Text>
									</Box>
								</Box>
								<Text fontWeight="500" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
									{color.name}
								</Text>
								<Text color="fg.tertiary" style={{ fontFamily: "monospace", fontSize: 10 }}>
									{color.hex}
								</Text>
							</Box>
						))}
					</Box>
				</Box>
			</Box>

			{/* Divider */}
			<Box style={{ background: "rgba(0,0,0,0.08)", height: 1 }} />

			{/* Colour rows */}
			<Box display="flex" flexDirection="column" p="24">
				{/* Column headers */}
				<Box display="flex" gap="12" mb="8" style={{ paddingLeft: 4, paddingRight: 40 }}>
					<Box style={{ flexShrink: 0, width: 52 }} />
					<ColHeader style={{ flexShrink: 0, width: 180 }}>Colour</ColHeader>
					<ColHeader style={{ flex: 1 }}>Description</ColHeader>
					<ColHeader style={{ flexShrink: 0, width: 96 }}>Role</ColHeader>
				</Box>

				{colors.map((color, i) => (
					<Box
						alignItems="center"
						display="flex"
						gap="12"
						key={color.id}
						py="10"
						style={{
							borderTop: i === 0 ? "1px solid rgba(0,0,0,0.08)" : undefined,
							borderBottom: "1px solid rgba(0,0,0,0.08)",
						}}
					>
						<Box
							rounded="md"
							style={{
								background: color.hex,
								border: "1px solid rgba(0,0,0,0.1)",
								flexShrink: 0,
								height: 52,
								width: 52,
							}}
						/>
						<Box style={{ flexShrink: 0, width: 184 }}>
							<EditableText
								value={color.name}
								onChange={(v) => update(color.id, { name: v })}
								placeholder="Colour name"
								style={{ fontWeight: 600, fontSize: 14 }}
							/>
							<Text
								color="fg.tertiary"
								style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.03em", lineHeight: 1.4, paddingLeft: 8 }}
							>
								{color.hex}{hexToRgb(color.hex) ? ` · rgb(${hexToRgb(color.hex)})` : ""}
							</Text>
						</Box>
						<Box style={{ flex: 1, minWidth: 0 }}>
							<EditableText
								value={color.description}
								onChange={(v) => update(color.id, { description: v })}
								placeholder="Describe this colour's role…"
								style={{ fontSize: 14, lineHeight: 1.5 }}
							/>
						</Box>
						<Box
							onClick={() => cycleRole(color.id, color.role)}
							style={{ cursor: "pointer", flexShrink: 0, width: 96 }}
							title="Click to change role"
						>
							<Badge intent="neutral" variant="subtle">{color.role}</Badge>
						</Box>
						<Button
							appearance="subtle"
							aria-label={`Remove ${color.name}`}
							icon={<IconXmark />}
							onClick={() => removeColor(color.id)}
							size="sm"
							style={{ flexShrink: 0 }}
						/>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function ColHeader({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
	return (
		<Text
			color="fg.tertiary"
			fontSize="xs"
			fontWeight="600"
			style={{ letterSpacing: "0.06em", textTransform: "uppercase", ...style }}
		>
			{children}
		</Text>
	);
}
