"use client";

import { useState } from "react";
import {
	Badge,
	Box,
	Button,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Input,
	Select,
	Text,
	Textarea,
} from "@optiaxiom/react";
import { IconCheck, IconGripVertical, IconPlus, IconTrashCan } from "@optiaxiom/icons";
import type { BrandColor, BrandPack } from "../../types";
import styles from "./ColoursTab.module.css";

type ColoursTabProps = {
	pack: BrandPack;
};

type ColorEntry = BrandColor & { _id: string };
type ColorDraft = ColorEntry & {
	description: string;
	tags: string[];
};

const ROLE_OPTIONS = [
	{ label: "Primary", value: "primary" },
	{ label: "Secondary", value: "secondary" },
	{ label: "Accent", value: "accent" },
	{ label: "Background", value: "background" },
	{ label: "Text", value: "text" },
	{ label: "Neutral", value: "neutral" },
];

const ROLE_TONE: Record<BrandColor["role"], { label: string; usage: string; mood: string }> = {
	accent: {
		label: "Accent",
		mood: "Energy, motion, emphasis",
		usage: "Highlights, data, expressive moments",
	},
	background: {
		label: "Background",
		mood: "Breathable, open, calm",
		usage: "Surfaces, page foundations, quiet space",
	},
	neutral: {
		label: "Neutral",
		mood: "Softness, balance, support",
		usage: "Tints, overlays, secondary surfaces",
	},
	primary: {
		label: "Primary",
		mood: "Recognition, action, momentum",
		usage: "CTAs, active states, signature moments",
	},
	secondary: {
		label: "Secondary",
		mood: "Depth, pacing, contrast",
		usage: "Campaign accents, charts, supporting UI",
	},
	text: {
		label: "Text",
		mood: "Focus, clarity, authority",
		usage: "Typography, dark surfaces, contrast",
	},
};

function readableText(hex: string) {
	if (!isValidHex(hex)) {
		return "#202320";
	}

	const raw = hex.replace("#", "");
	const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
	const value = Number.parseInt(full, 16);
	const r = (value >> 16) & 255;
	const g = (value >> 8) & 255;
	const b = value & 255;
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.58 ? "#202320" : "#F9FCF8";
}

function isValidHex(hex: string) {
	return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function normalizeHex(value: string) {
	const next = value.trim();
	return next.startsWith("#") ? next.toUpperCase() : `#${next.toUpperCase()}`;
}

function hexToRgb(hex: string) {
	if (!isValidHex(hex)) {
		return "Invalid";
	}

	const raw = hex.replace("#", "");
	const r = Number.parseInt(raw.slice(0, 2), 16);
	const g = Number.parseInt(raw.slice(2, 4), 16);
	const b = Number.parseInt(raw.slice(4, 6), 16);
	return `${r}, ${g}, ${b}`;
}

function relativeLuminance(hex: string) {
	if (!isValidHex(hex)) {
		return 1;
	}

	const raw = hex.replace("#", "");
	const channels = [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map((channel) => {
		const value = Number.parseInt(channel, 16) / 255;
		return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string) {
	const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
	const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
	return (lighter + 0.05) / (darker + 0.05);
}

function colorToDraft(entry: ColorEntry): ColorDraft {
	const tone = ROLE_TONE[entry.role];

	return {
		...entry,
		description: `${tone.mood}. ${tone.usage}.`,
		tags: entry.role === "primary"
			? ["CTAs", "Active states", "Highlights"]
			: [tone.label, tone.usage.split(",")[0]],
	};
}

function newColorDraft(): ColorDraft {
	return {
		_id: `c${Date.now()}`,
		description: "Describe where this color should appear and what it should communicate.",
		hex: "#ABFF44",
		name: "New color",
		role: "accent",
		tags: ["Accent"],
	};
}

function HeroPalette({ colors, onAdd }: { colors: ColorEntry[]; onAdd: () => void }) {
	const primary = colors.find((color) => color.role === "primary") ?? colors[0];
	const secondary = colors.filter((color) => color._id !== primary?._id).slice(0, 5);

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			className={styles.paletteHero}
			display="grid"
			gap="32"
			p="32"
			rounded="xl"
			shadow="sm"
		>
			<Box display="flex" flexDirection="column" gap="24">
				<Box display="flex" flexDirection="column" gap="12">
					<Badge intent="success" variant="subtle" style={{ width: "fit-content" }}>
						Primary palette
					</Badge>
					<Text style={{ fontSize: 36, fontWeight: 700, letterSpacing: 0, lineHeight: 1.08 }}>
						Energetic. Bold. Unmistakable.
					</Text>
					<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.55, maxWidth: 380 }}>
						These core colors define the personality of {primary?.name ? primary.name.split(" ")[0] : "this brand"} and keep generated content consistent across channels.
					</Text>
				</Box>
				<Box display="flex" flexDirection="column" gap="8">
					<Text color="fg.tertiary" fontSize="xs" fontWeight="600">Used for</Text>
					<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
						{["CTAs", "Accents", "Highlights", "Data viz", "Energy"].map((item) => (
							<Badge key={item} intent="neutral" variant="subtle">{item}</Badge>
						))}
					</Box>
				</Box>
			</Box>

			<Box display="flex" flexDirection="column" gap="16">
				<Box alignItems="center" display="flex" gap="8" justifyContent="end" style={{ flexWrap: "wrap" }}>
					<Button appearance="primary" icon={<IconPlus />} onClick={onAdd} size="md">Add color</Button>
				</Box>
				<Box className={styles.swatchStory}>
					{[primary, ...secondary].filter(Boolean).map((color, index) => (
						<Box key={color._id} className={index === 0 ? styles.primarySwatch : styles.storySwatch}>
							<Box
								className={styles.swatchBlock}
								style={{
									background: color.hex,
									color: readableText(color.hex),
								}}
							>
								<Text fontWeight="700" style={{ fontSize: index === 0 ? 22 : 14 }}>
									{index === 0 ? color.name : ROLE_TONE[color.role].label}
								</Text>
							</Box>
							<Box display="flex" flexDirection="column" gap="2" mt="8">
								<Text color={index === 0 ? "fg.success" : "fg.default"} fontSize="sm" fontWeight="600">
									{color.name}
								</Text>
								<Text color="fg.tertiary" fontSize="xs">{color.hex}</Text>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}

function UsagePreview({ colors }: { colors: ColorEntry[] }) {
	const primary = colors.find((color) => color.role === "primary") ?? colors[0];
	const text = colors.find((color) => color.role === "text") ?? colors[1] ?? primary;
	const background = colors.find((color) => color.role === "background") ?? colors[2] ?? primary;
	const accent = colors.find((color) => color.role === "accent") ?? colors[3] ?? primary;
	const secondary = colors.find((color) => color.role === "secondary") ?? colors[4] ?? primary;

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			className={styles.usagePreview}
			display="grid"
			gap="20"
			p="24"
			rounded="xl"
		>
			<Box display="flex" flexDirection="column" gap="8">
				<Text color="fg.success" fontSize="xs" fontWeight="700">Color in action</Text>
				<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.5 }}>
					See how the palette behaves across product UI, content, and generated campaign assets.
				</Text>
			</Box>
			<Box className={styles.previewGrid}>
				<Box className={styles.previewCard}>
					<Text fontSize="xs" fontWeight="600">Buttons & CTAs</Text>
					<Box display="flex" flexDirection="column" gap="10" mt="12">
						<Box rounded="md" style={{ background: primary.hex, color: readableText(primary.hex), padding: "10px 18px", textAlign: "center" }}>
							<Text fontSize="sm" fontWeight="700">Primary action</Text>
						</Box>
						<Box rounded="md" style={{ border: `1px solid ${primary.hex}`, color: text.hex, padding: "10px 18px", textAlign: "center" }}>
							<Text fontSize="sm" fontWeight="600">Secondary action</Text>
						</Box>
					</Box>
				</Box>
				<Box className={styles.previewCard}>
					<Text fontSize="xs" fontWeight="600">Data visualization</Text>
					<Box alignItems="center" display="flex" gap="16" mt="12">
						<Box
							rounded="full"
							style={{
								background: `conic-gradient(${primary.hex} 0 35%, ${accent.hex} 35% 58%, ${secondary.hex} 58% 78%, ${background.hex} 78% 100%)`,
								height: 72,
								width: 72,
							}}
						/>
						<Box display="flex" flexDirection="column" gap="8">
							{[primary, accent, secondary, background].map((color) => (
								<Box key={color._id} alignItems="center" display="flex" gap="8">
									<Box rounded="full" style={{ background: color.hex, height: 8, width: 8 }} />
									<Box bg="bg.secondary" rounded="full" style={{ height: 6, width: 44 }} />
								</Box>
							))}
						</Box>
					</Box>
				</Box>
				<Box className={styles.previewCard} style={{ background: background.hex }}>
					<Text fontSize="xs" fontWeight="600">UI surfaces</Text>
					<Box bg="bg.default" mt="12" p="16" rounded="lg" shadow="sm">
						<Box rounded="md" style={{ background: primary.hex, height: 28, width: 28 }} />
						<Text fontSize="sm" fontWeight="700" mt="10">Performance overview</Text>
						<Text color="fg.secondary" fontSize="xs" mt="8">View report {"->"}</Text>
					</Box>
				</Box>
				<Box className={styles.previewCard} style={{ background: text.hex, color: readableText(text.hex) }}>
					<Text style={{ fontSize: 24, fontWeight: 800, letterSpacing: 0, lineHeight: 1.08 }}>
						Move fast.<br />Stay ahead.
					</Text>
					<Text mt="12" style={{ color: primary.hex, fontSize: 18, fontWeight: 700 }}>
						This is {primary.name.split(" ")[0]}.
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

function ColorEditorDialog({
	draft,
	open,
	onDelete,
	onOpenChange,
	onSave,
	onUpdate,
}: {
	draft: ColorDraft | null;
	open: boolean;
	onDelete: (id: string) => void;
	onOpenChange: (open: boolean) => void;
	onSave: () => void;
	onUpdate: (draft: ColorDraft) => void;
}) {
	if (!draft) {
		return null;
	}

	const safeHex = isValidHex(draft.hex) ? draft.hex : "#ABFF44";
	const textOnColor = readableText(safeHex);
	const normalContrast = contrastRatio("#202320", safeHex);
	const largeContrast = contrastRatio("#F9FCF8", safeHex);
	const tonalRamp = [92, 82, 70, 58, 46, 36, 28, 20, 12];
	const setDraft = (next: Partial<ColorDraft>) => onUpdate({ ...draft, ...next });

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg" style={{ maxWidth: 1080, width: "min(92vw, 1080px)" }}>
				<DialogHeader>Edit color</DialogHeader>
				<DialogBody className={styles.colorDialogBody}>
					<Box className={styles.colorEditorGrid}>
						<Box display="flex" flexDirection="column" gap="24">
							<Box display="flex" flexDirection="column" gap="12">
								<Text color="fg.success" fontSize="xs" fontWeight="700">Color details</Text>
								<Box className={styles.fieldGrid}>
									<Box display="flex" flexDirection="column" gap="6">
										<Text fontSize="xs" fontWeight="600">Name</Text>
										<Input
											size="md"
											value={draft.name}
											onChange={(event) => setDraft({ name: event.target.value })}
										/>
									</Box>
									<Box display="flex" flexDirection="column" gap="6">
										<Text fontSize="xs" fontWeight="600">Role</Text>
										<Select
											options={ROLE_OPTIONS}
											value={draft.role}
											onValueChange={(value) => setDraft({ role: value as BrandColor["role"] })}
										/>
									</Box>
								</Box>
								<Box className={styles.fieldGrid}>
									<Box display="flex" flexDirection="column" gap="6">
										<Text fontSize="xs" fontWeight="600">HEX</Text>
										<Box className={styles.colorInputCluster}>
											<Input
												size="md"
												value={draft.hex}
												onChange={(event) => setDraft({ hex: normalizeHex(event.target.value) })}
											/>
											<input
												aria-label="Pick color"
												className={styles.colorWellInput}
												type="color"
												value={safeHex}
												onChange={(event) => setDraft({ hex: event.target.value.toUpperCase() })}
											/>
										</Box>
									</Box>
									<Box display="flex" flexDirection="column" gap="6">
										<Text fontSize="xs" fontWeight="600">RGB</Text>
										<Input readOnly size="md" value={hexToRgb(draft.hex)} />
									</Box>
								</Box>
								<Box display="flex" flexDirection="column" gap="6">
									<Text fontSize="xs" fontWeight="600">Description</Text>
									<Textarea
										maxRows={4}
										resize="none"
										value={draft.description}
										onChange={(event) => setDraft({ description: event.target.value })}
									/>
									<Text color="fg.tertiary" fontSize="xs" style={{ textAlign: "right" }}>
										{draft.description.length}/140
									</Text>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="10">
								<Text fontSize="xs" fontWeight="600">Used for</Text>
								<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
									{draft.tags.map((tag) => (
										<Badge key={tag} intent="neutral" variant="subtle">{tag}</Badge>
									))}
								</Box>
								<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
									{["CTAs", "Accents", "Highlights", "Data viz", "Surfaces"].map((tag) => (
										<Button
											key={tag}
											appearance="subtle"
											size="sm"
											onClick={() => {
												if (!draft.tags.includes(tag)) {
													setDraft({ tags: [...draft.tags, tag] });
												}
											}}
										>
											Add {tag}
										</Button>
									))}
								</Box>
							</Box>

							<Box className={styles.accessibilityPanel}>
								<Text fontSize="xs" fontWeight="700">Accessibility</Text>
								<Box className={styles.contrastGrid}>
									<Box>
										<Text fontWeight="700" style={{ fontSize: 22 }}>AA</Text>
										<Text color="fg.secondary" fontSize="sm">{normalContrast.toFixed(2)} : 1</Text>
										<Text color={normalContrast >= 4.5 ? "fg.success" : "fg.warning"} fontSize="xs" fontWeight="600">
											{normalContrast >= 4.5 ? "Pass normal text" : "Check normal text"}
										</Text>
									</Box>
									<Box>
										<Text fontWeight="700" style={{ fontSize: 22 }}>AAA</Text>
										<Text color="fg.secondary" fontSize="sm">{largeContrast.toFixed(2)} : 1</Text>
										<Text color={largeContrast >= 7 ? "fg.success" : "fg.warning"} fontSize="xs" fontWeight="600">
											{largeContrast >= 7 ? "Pass large text" : "Use for display only"}
										</Text>
									</Box>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="8">
								<Text fontSize="xs" fontWeight="700">Theme values</Text>
								{["Light mode", "Dark mode", "Hover", "Active"].map((label, index) => (
									<Box key={label} alignItems="center" className={styles.themeValueRow} display="grid" gap="12">
										<Text color="fg.secondary" fontSize="sm">{label}</Text>
										<Box rounded="sm" style={{ background: `color-mix(in srgb, ${safeHex} ${index === 0 ? 100 : 90 - index * 12}%, white)`, height: 20, width: 20 }} />
										<Text color="fg.secondary" fontSize="sm">{safeHex}</Text>
									</Box>
								))}
							</Box>
						</Box>

						<Box display="flex" flexDirection="column" gap="24">
							<Box display="flex" flexDirection="column" gap="12">
								<Text color="fg.success" fontSize="xs" fontWeight="700">Preview</Text>
								<Box className={styles.tonalRamp}>
									{tonalRamp.map((mix) => (
										<Box key={mix} display="flex" flexDirection="column" gap="8">
											<Box
												rounded="md"
												style={{
													background: `color-mix(in srgb, ${safeHex} ${mix}%, white)`,
													height: 52,
												}}
											/>
											<Text color="fg.tertiary" fontSize="xs" style={{ textAlign: "center" }}>{mix}</Text>
										</Box>
									))}
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="12">
								<Text color="fg.success" fontSize="xs" fontWeight="700">UI preview</Text>
								<Box className={styles.modalPreviewCard}>
									<Box className={styles.previewModeTabs}>
										<Text fontSize="sm" fontWeight="700">Light mode</Text>
										<Text color="fg.secondary" fontSize="sm">Dark mode</Text>
									</Box>
									<Box className={styles.modalPreviewGrid}>
										<Box display="flex" flexDirection="column" gap="10">
											<Box rounded="md" style={{ background: safeHex, color: textOnColor, padding: "11px 18px", textAlign: "center" }}>
												<Text fontSize="sm" fontWeight="700">Primary button</Text>
											</Box>
											<Box rounded="md" style={{ border: `1px solid ${safeHex}`, color: "var(--ax-colors-fg-default)", padding: "11px 18px", textAlign: "center" }}>
												<Text fontSize="sm" fontWeight="600">Secondary button</Text>
											</Box>
										</Box>
										<Box display="flex" flexDirection="column" gap="10">
											<Badge intent="neutral" variant="subtle" style={{ width: "fit-content" }}>Badge</Badge>
											<Text style={{ color: safeHex, fontWeight: 700 }}>Link {"->"}</Text>
											<Box rounded="full" style={{ background: safeHex, height: 24, width: 44 }} />
										</Box>
									</Box>
								</Box>
								<Box className={styles.previewTileGrid}>
									<Box className={styles.previewCard}>
										<Text fontSize="xs" fontWeight="600">Data visualization</Text>
										<Box
											rounded="full"
											style={{
												background: `conic-gradient(${safeHex} 0 38%, color-mix(in srgb, ${safeHex} 68%, white) 38% 62%, var(--ax-colors-bg-secondary) 62% 100%)`,
												height: 88,
												marginTop: 12,
												width: 88,
											}}
										/>
									</Box>
									<Box className={styles.previewCard}>
										<Text fontSize="xs" fontWeight="600">Card</Text>
										<Box bg="bg.default" mt="12" p="16" rounded="lg" shadow="sm">
											<Box rounded="md" style={{ background: safeHex, height: 28, width: 28 }} />
											<Text fontSize="sm" fontWeight="700" mt="10">Performance overview</Text>
											<Box bg="bg.secondary" mt="10" rounded="full" style={{ height: 6, width: "100%" }} />
											<Box mt="8" rounded="full" style={{ background: safeHex, height: 3, width: "70%" }} />
										</Box>
									</Box>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="10">
								<Text color="fg.success" fontSize="xs" fontWeight="700">Usage guidelines</Text>
								{[
									`Use for ${ROLE_TONE[draft.role].usage.toLowerCase()}`,
									"Pair with high-contrast text before publishing",
									"Avoid using more than 20% of a layout unless it is the signature brand color",
								].map((item) => (
									<Box key={item} alignItems="center" display="flex" gap="8">
										<IconCheck size={14} style={{ color: "var(--ax-colors-fg-success)" }} />
										<Text color="fg.secondary" fontSize="sm">{item}</Text>
									</Box>
								))}
							</Box>
						</Box>
					</Box>
				</DialogBody>
				<DialogFooter>
					<Button
						appearance="danger-outline"
						icon={<IconTrashCan />}
						onClick={() => onDelete(draft._id)}
						size="md"
					>
						Delete color
					</Button>
					<Box display="flex" gap="8" style={{ marginLeft: "auto" }}>
						<DialogClose appearance="default" size="md">Cancel</DialogClose>
						<Button appearance="primary" onClick={onSave} size="md">Save changes</Button>
					</Box>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ColorRoleRow({ entry, onEdit }: { entry: ColorEntry; onEdit: (entry: ColorEntry) => void }) {
	const tone = ROLE_TONE[entry.role];

	return (
		<Box
			alignItems="center"
			bg="bg.default"
			borderB="1"
			borderColor="border.tertiary"
			className={styles.roleRow}
			display="grid"
			gap="16"
			onClick={() => onEdit(entry)}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onEdit(entry);
				}
			}}
			p="16"
			role="button"
			tabIndex={0}
		>
			<Box alignItems="center" display="flex" gap="12">
				<IconGripVertical size={15} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
				<Box rounded="md" shadow="sm" style={{ background: entry.hex, border: "1px solid var(--ax-colors-border-tertiary)", height: 32, width: 32 }} />
				<Box display="flex" flexDirection="column" gap="2">
					<Box alignItems="center" display="flex" gap="8">
						<Text fontWeight="600">{entry.name}</Text>
						{entry.role === "primary" && <Badge intent="success" variant="subtle">Primary</Badge>}
					</Box>
					<Text color="fg.secondary" fontSize="xs">{tone.mood}</Text>
				</Box>
			</Box>
			<Text color="fg.secondary" fontSize="sm">{entry.hex}</Text>
			<Text color="fg.secondary" fontSize="sm">{tone.usage}</Text>
			<Text className={styles.rowEditCue} color="fg.secondary" fontSize="sm" fontWeight="600">Edit</Text>
		</Box>
	);
}

export function ColoursTab({ pack }: ColoursTabProps) {
	const [entries, setEntries] = useState<ColorEntry[]>(() =>
		pack.colors.map((color, index) => ({ ...color, _id: `c${index}` }))
	);
	const [editingDraft, setEditingDraft] = useState<ColorDraft | null>(null);

	const add = () => setEditingDraft(newColorDraft());
	const edit = (entry: ColorEntry) => setEditingDraft(colorToDraft(entry));
	const closeEditor = () => setEditingDraft(null);
	const saveDraft = () => {
		if (!editingDraft) {
			return;
		}

		const nextEntry: ColorEntry = {
			_id: editingDraft._id,
			hex: isValidHex(editingDraft.hex) ? editingDraft.hex : "#ABFF44",
			name: editingDraft.name || "Untitled color",
			role: editingDraft.role,
		};

		setEntries((current) => {
			const exists = current.some((entry) => entry._id === editingDraft._id);
			return exists
				? current.map((entry) => (entry._id === editingDraft._id ? nextEntry : entry))
				: [...current, nextEntry];
		});
		setEditingDraft(null);
	};
	const deleteDraft = (id: string) => {
		setEntries((current) => current.filter((entry) => entry._id !== id));
		setEditingDraft(null);
	};
	return (
		<Box className={styles.coloursTab} display="flex" flexDirection="column" gap="16">
			<HeroPalette colors={entries} onAdd={add} />
			<UsagePreview colors={entries} />

			<Box display="flex" flexDirection="column" gap="8">
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box display="flex" flexDirection="column" gap="2">
						<Text color="fg.success" fontSize="xs" fontWeight="700">Color roles</Text>
						<Text color="fg.secondary" fontSize="sm">{entries.length} managed brand colors</Text>
					</Box>
				</Box>
				<Box border="1" borderColor="border.tertiary" display="flex" flexDirection="column" overflow="hidden" rounded="xl">
					{entries.map((entry) => (
						<ColorRoleRow key={entry._id} entry={entry} onEdit={edit} />
					))}
				</Box>
			</Box>
			<ColorEditorDialog
				draft={editingDraft}
				open={!!editingDraft}
				onDelete={deleteDraft}
				onOpenChange={(open) => {
					if (!open) {
						closeEditor();
					}
				}}
				onSave={saveDraft}
				onUpdate={setEditingDraft}
			/>
		</Box>
	);
}
