"use client";

import {useState} from "react";
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
import {IconCheck, IconGripVertical, IconPlus, IconTrashCan, IconXmark} from "@optiaxiom/icons";
import type {BrandColor, BrandPack} from "../../types";
import {getBrandColors} from "../../adapters";
import {PrimaryCtaIcon} from "./PrimaryCtaIcon";
import styles from "./ColoursTab.module.css";

type ColoursTabProps = {
	pack: BrandPack;
};

type ColorEntry = BrandColor & {_id: string};
type ColorDraft = ColorEntry & {
	description: string;
};

type UsageContext = {
	name: string;
	description: string;
	custom: boolean;
};

const ROLE_OPTIONS = [
	{label: "Primary", value: "primary"},
	{label: "Secondary", value: "secondary"},
	{label: "Accent", value: "accent"},
	{label: "Neutral", value: "neutral"},
	{label: "Extended", value: "extended"},
	{label: "Do not use", value: "do_not_use"},
];

const DEFAULT_USAGE_CONTEXTS: UsageContext[] = [
	{name: "CTAs", description: "Buttons and conversion moments", custom: false},
	{name: "Highlights", description: "Metric callouts and announcements", custom: false},
	{name: "Surfaces", description: "Cards, panels, and backgrounds", custom: false},
	{name: "Accents", description: "Small emphasis and highlights", custom: false},
	{name: "Data viz", description: "Charts, legends, and statistical displays", custom: false},
];

const ROLE_TONE: Record<BrandColor["role"], {label: string; usage: string; mood: string}> = {
	accent: {
		label: "Accent",
		mood: "Energy, motion, emphasis",
		usage: "Highlights, data, expressive moments",
	},
	neutral: {
		label: "Neutral",
		mood: "Balance, structure, support",
		usage: "Text, surfaces, tints, and quiet space",
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
	extended: {
		label: "Extended",
		mood: "Range, flexibility, nuance",
		usage: "Supplementary palette for specialised contexts",
	},
	do_not_use: {
		label: "Do not use",
		mood: "Retired, restricted, or off-brand",
		usage: "Reference only; block from generation output",
	},
};

function readableText(hex: string) {
	if (!isValidHex(hex)) {
		return "#202320";
	}

	const raw = hex.replace("#", "");
	const full =
		raw.length === 3
			? raw
					.split("")
					.map((c) => c + c)
					.join("")
			: raw;
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

function colorToDraft(entry: ColorEntry): ColorDraft {
	const tone = ROLE_TONE[entry.role];

	return {
		...entry,
		cmyk: entry.cmyk ?? "",
		confidence: entry.confidence ?? "medium",
		description: entry.usage_notes || `${tone.mood}. ${tone.usage}.`,
		pms: entry.pms ?? "",
		usage_notes: entry.usage_notes ?? "",
		used_for: entry.used_for ?? [],
		web_accessible_hex: entry.web_accessible_hex ?? "",
	};
}

function newColorDraft(): ColorDraft {
	return {
		_id: `c${Date.now()}`,
		cmyk: "",
		confidence: "medium",
		description: "",
		hex: "#ABFF44",
		name: "New color",
		pms: "",
		role: "accent",
		usage_notes: "",
		used_for: [],
		web_accessible_hex: "",
	};
}

function HeroPalette({colors, onAdd}: {colors: ColorEntry[]; onAdd: () => void}) {
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
					<Badge intent="success" variant="subtle" style={{width: "fit-content"}}>
						Primary palette
					</Badge>
					<Text style={{fontSize: 36, fontWeight: 700, letterSpacing: 0, lineHeight: 1.08}}>
						Energetic. Bold. Unmistakable.
					</Text>
					<Text color="fg.secondary" fontSize="md" style={{lineHeight: 1.55, maxWidth: 380}}>
						These core colors define the personality of{" "}
						{primary?.name ? primary.name.split(" ")[0] : "this brand"} and keep generated
						content consistent across channels.
					</Text>
				</Box>
				<Box display="flex" flexDirection="column" gap="8">
					<Text color="fg.tertiary" fontSize="xs" fontWeight="600">
						Used for
					</Text>
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{["CTAs", "Accents", "Highlights", "Data viz", "Energy"].map((item) => (
							<Badge key={item} intent="neutral" variant="subtle">
								{item}
							</Badge>
						))}
					</Box>
				</Box>
			</Box>

			<Box display="flex" flexDirection="column" gap="16">
				<Box
					alignItems="center"
					display="flex"
					gap="8"
					justifyContent="end"
					style={{flexWrap: "wrap"}}
				>
					<Button
						appearance="primary"
						icon={
							<PrimaryCtaIcon>
								<IconPlus />
							</PrimaryCtaIcon>
						}
						onClick={onAdd}
						size="md"
					>
						Add color
					</Button>
				</Box>
				<Box className={styles.swatchStory}>
					{[primary, ...secondary].filter(Boolean).map((color, index) => (
						<Box
							key={color._id}
							className={index === 0 ? styles.primarySwatch : styles.storySwatch}
						>
							<Box
								className={styles.swatchBlock}
								style={{
									background: color.hex,
									color: readableText(color.hex),
								}}
							>
								<Text fontWeight="700" style={{fontSize: index === 0 ? 22 : 14}}>
									{index === 0 ? color.name : ROLE_TONE[color.role].label}
								</Text>
							</Box>
							<Box display="flex" flexDirection="column" gap="2" mt="8">
								<Text
									color={index === 0 ? "fg.success" : "fg.default"}
									fontSize="sm"
									fontWeight="600"
								>
									{color.name}
								</Text>
								<Text color="fg.tertiary" fontSize="xs">
									{color.hex}
								</Text>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}

function UsedForGrid({
	contexts,
	selected,
	onToggle,
	onAdd,
	onRemove,
}: {
	contexts: UsageContext[];
	selected: string[];
	onToggle: (name: string) => void;
	onAdd: (name: string, description: string) => void;
	onRemove: (name: string) => void;
}) {
	const [adding, setAdding] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const resetForm = () => {
		setName("");
		setDescription("");
		setAdding(false);
	};

	const submit = () => {
		const trimmed = name.trim();
		if (!trimmed) {
			return;
		}

		onAdd(trimmed, description.trim());
		resetForm();
	};

	return (
		<Box className={styles.usedForGrid}>
			{contexts.map((ctx) => {
				const isSelected = selected.includes(ctx.name);
				return (
					<Box
						key={ctx.name}
						className={
							isSelected
								? `${styles.usedForCard} ${styles.usedForCardSelected}`
								: styles.usedForCard
						}
						role="button"
						tabIndex={0}
						onClick={() => onToggle(ctx.name)}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								onToggle(ctx.name);
							}
						}}
					>
						{isSelected && (
							<span className={styles.usedForTick}>
								<IconCheck size={11} />
							</span>
						)}
						{ctx.custom && (
							<button
								aria-label={`Remove ${ctx.name}`}
								className={styles.usedForDelete}
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									onRemove(ctx.name);
								}}
							>
								<IconXmark size={11} />
							</button>
						)}
						<span className={styles.usedForCardName}>{ctx.name}</span>
						<span className={styles.usedForCardDescription}>{ctx.description}</span>
					</Box>
				);
			})}

			{adding ? (
				<Box className={styles.usedForAddForm}>
					<Input
						autoFocus
						placeholder="Name"
						size="md"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
					<Input
						placeholder="Description"
						size="md"
						value={description}
						onChange={(event) => setDescription(event.target.value)}
					/>
					<Box alignItems="center" display="flex" gap="8">
						<Button appearance="primary" size="sm" onClick={submit}>
							Add
						</Button>
						<Button appearance="subtle" size="sm" onClick={resetForm}>
							Cancel
						</Button>
					</Box>
				</Box>
			) : (
				<button
					className={styles.usedForAddCard}
					type="button"
					onClick={() => setAdding(true)}
				>
					<IconPlus size={14} />
					<span>Add usage context</span>
				</button>
			)}
		</Box>
	);
}

function ColorEditorDialog({
	draft,
	open,
	usageContexts,
	onAddUsageContext,
	onRemoveUsageContext,
	onDelete,
	onOpenChange,
	onSave,
	onUpdate,
}: {
	draft: ColorDraft | null;
	open: boolean;
	usageContexts: UsageContext[];
	onAddUsageContext: (name: string, description: string) => void;
	onRemoveUsageContext: (name: string) => void;
	onDelete: (id: string) => void;
	onOpenChange: (open: boolean) => void;
	onSave: () => void;
	onUpdate: (draft: ColorDraft) => void;
}) {
	if (!draft) {
		return null;
	}

	const safeHex = isValidHex(draft.hex) ? draft.hex : "#ABFF44";
	const setDraft = (next: Partial<ColorDraft>) => onUpdate({...draft, ...next});

	const toggleUsage = (name: string) => {
		setDraft({
			used_for: draft.used_for?.includes(name)
				? draft.used_for.filter((item) => item !== name)
				: [...(draft.used_for ?? []), name],
		});
	};

	const addUsageContext = (name: string, description: string) => {
		onAddUsageContext(name, description);
		if (!draft.used_for?.includes(name)) {
			setDraft({used_for: [...(draft.used_for ?? []), name]});
		}
	};

	const removeUsageContext = (name: string) => {
		onRemoveUsageContext(name);
		if (draft.used_for?.includes(name)) {
			setDraft({used_for: draft.used_for.filter((item) => item !== name)});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md" style={{maxWidth: 560, width: "min(92vw, 560px)"}}>
				<DialogHeader>Edit color</DialogHeader>
				<DialogBody className={styles.colorDialogBody}>
					<Box display="flex" flexDirection="column" gap="16">
						<Text color="fg.success" fontSize="xs" fontWeight="700">
							Color details
						</Text>
						<Box className={styles.fieldGrid}>
							<Box display="flex" flexDirection="column" gap="6">
								<Text fontSize="xs" fontWeight="600">
									Name
								</Text>
								<Input
									size="md"
									value={draft.name}
									onChange={(event) => setDraft({name: event.target.value})}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text fontSize="xs" fontWeight="600">
									Role
								</Text>
								<Select
									options={ROLE_OPTIONS}
									value={draft.role}
									onValueChange={(value) =>
										setDraft({role: value as BrandColor["role"]})
									}
								/>
							</Box>
						</Box>
						<Box className={styles.fieldGrid}>
							<Box display="flex" flexDirection="column" gap="6">
								<Text fontSize="xs" fontWeight="600">
									HEX
								</Text>
								<Box className={styles.colorInputCluster}>
									<Input
										size="md"
										value={draft.hex}
										onChange={(event) =>
											setDraft({hex: normalizeHex(event.target.value)})
										}
									/>
									<input
										aria-label="Pick color"
										className={styles.colorWellInput}
										type="color"
										value={safeHex}
										onChange={(event) =>
											setDraft({hex: event.target.value.toUpperCase()})
										}
									/>
								</Box>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text fontSize="xs" fontWeight="600">
									RGB
								</Text>
								<Input readOnly size="md" value={hexToRgb(draft.hex)} />
							</Box>
						</Box>
						<Box className={styles.fieldGrid}>
							<Box display="flex" flexDirection="column" gap="6">
								<Text fontSize="xs" fontWeight="600">
									Accessible HEX
								</Text>
								<Input
									placeholder="#347300"
									size="md"
									value={draft.web_accessible_hex ?? ""}
									onChange={(event) =>
										setDraft({
											web_accessible_hex: event.target.value
												? normalizeHex(event.target.value)
												: "",
										})
									}
								/>
							</Box>
							<Box />
						</Box>
						<Box className={styles.fieldGrid}>
							<Box display="flex" flexDirection="column" gap="6">
								<Text fontSize="xs" fontWeight="600">
									CMYK
								</Text>
								<Input
									placeholder="C:33 M:0 Y:73 K:0"
									size="md"
									value={draft.cmyk ?? ""}
									onChange={(event) => setDraft({cmyk: event.target.value})}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text fontSize="xs" fontWeight="600">
									PMS
								</Text>
								<Input
									placeholder="Pantone 375 C"
									size="md"
									value={draft.pms ?? ""}
									onChange={(event) => setDraft({pms: event.target.value})}
								/>
							</Box>
						</Box>
						<Box display="flex" flexDirection="column" gap="10">
							<Text fontSize="xs" fontWeight="600">
								Used for
							</Text>
							<UsedForGrid
								contexts={usageContexts}
								selected={draft.used_for ?? []}
								onAdd={addUsageContext}
								onRemove={removeUsageContext}
								onToggle={toggleUsage}
							/>
						</Box>
						<Box display="flex" flexDirection="column" gap="6">
							<Text fontSize="xs" fontWeight="600">
								Usage notes
							</Text>
							<Textarea
								maxRows={4}
								placeholder="Describe where this color should appear and what it should communicate."
								resize="none"
								value={draft.description}
								onChange={(event) =>
									setDraft({
										description: event.target.value,
										usage_notes: event.target.value,
									})
								}
							/>
							<Text color="fg.tertiary" fontSize="xs" style={{textAlign: "right"}}>
								{draft.description.length}/140
							</Text>
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
					<Box display="flex" gap="8" style={{marginLeft: "auto"}}>
						<DialogClose appearance="default" size="md">
							Cancel
						</DialogClose>
						<Button appearance="primary" onClick={onSave} size="md">
							Save changes
						</Button>
					</Box>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ColorRoleRow({entry, onEdit}: {entry: ColorEntry; onEdit: (entry: ColorEntry) => void}) {
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
				<IconGripVertical size={15} style={{color: "var(--ax-colors-fg-tertiary)"}} />
				<Box
					rounded="md"
					shadow="sm"
					style={{
						background: entry.hex,
						border: "1px solid var(--ax-colors-border-tertiary)",
						height: 32,
						width: 32,
					}}
				/>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="600">{entry.name}</Text>
					<Text color="fg.secondary" fontSize="xs">
						{tone.mood}
					</Text>
				</Box>
			</Box>
			<Box>
				<Badge
					intent={entry.role === "do_not_use" ? "danger" : "neutral"}
					variant="subtle"
				>
					{tone.label}
				</Badge>
			</Box>
			<Box display="flex" flexDirection="column" gap="2">
				<Text color="fg.secondary" fontSize="sm">
					{entry.hex}
				</Text>
				{entry.web_accessible_hex && (
					<Text color="fg.tertiary" fontSize="xs">
						Accessible: {entry.web_accessible_hex}
					</Text>
				)}
			</Box>
			<Box display="flex" flexDirection="column" gap="4">
				<Text color="fg.secondary" fontSize="sm">
					{entry.usage_notes || tone.usage}
				</Text>
				<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
					{entry.cmyk && (
						<Badge intent="neutral" variant="subtle">
							{entry.cmyk}
						</Badge>
					)}
					{entry.pms && (
						<Badge intent="neutral" variant="subtle">
							{entry.pms}
						</Badge>
					)}
				</Box>
			</Box>
			<Text className={styles.rowEditCue} color="fg.secondary" fontSize="sm" fontWeight="600">
				Edit
			</Text>
		</Box>
	);
}

export function ColoursTab({pack}: ColoursTabProps) {
	const [entries, setEntries] = useState<ColorEntry[]>(() =>
		getBrandColors(pack).map((color, index) => ({...color, _id: `c${index}`}))
	);
	const [editingDraft, setEditingDraft] = useState<ColorDraft | null>(null);
	const [usageContexts, setUsageContexts] = useState<UsageContext[]>(DEFAULT_USAGE_CONTEXTS);

	const add = () => setEditingDraft(newColorDraft());
	const edit = (entry: ColorEntry) => setEditingDraft(colorToDraft(entry));
	const closeEditor = () => setEditingDraft(null);

	const addUsageContext = (name: string, description: string) => {
		setUsageContexts((current) =>
			current.some((ctx) => ctx.name.toLowerCase() === name.toLowerCase())
				? current
				: [...current, {custom: true, description, name}]
		);
	};

	const removeUsageContext = (name: string) => {
		setUsageContexts((current) => current.filter((ctx) => !(ctx.custom && ctx.name === name)));
	};

	const saveDraft = () => {
		if (!editingDraft) {
			return;
		}

		const nextEntry: ColorEntry = {
			_id: editingDraft._id,
			cmyk: editingDraft.cmyk || null,
			confidence: editingDraft.confidence ?? "medium",
			hex: isValidHex(editingDraft.hex) ? editingDraft.hex : "#ABFF44",
			name: editingDraft.name || "Untitled color",
			pms: editingDraft.pms || null,
			role: editingDraft.role,
			usage_notes: editingDraft.usage_notes || editingDraft.description,
			used_for: editingDraft.used_for ?? [],
			web_accessible_hex: editingDraft.web_accessible_hex || null,
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

			<Box display="flex" flexDirection="column" gap="8">
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box display="flex" flexDirection="column" gap="2">
						<Text color="fg.success" fontSize="xs" fontWeight="700">
							Color roles
						</Text>
						<Text color="fg.secondary" fontSize="sm">
							{entries.length} managed brand colors
						</Text>
					</Box>
				</Box>
				<Box
					border="1"
					borderColor="border.tertiary"
					display="flex"
					flexDirection="column"
					overflow="hidden"
					rounded="xl"
				>
					{entries.map((entry) => (
						<ColorRoleRow key={entry._id} entry={entry} onEdit={edit} />
					))}
				</Box>
			</Box>
			<ColorEditorDialog
				draft={editingDraft}
				open={!!editingDraft}
				usageContexts={usageContexts}
				onAddUsageContext={addUsageContext}
				onDelete={deleteDraft}
				onOpenChange={(open) => {
					if (!open) {
						closeEditor();
					}
				}}
				onRemoveUsageContext={removeUsageContext}
				onSave={saveDraft}
				onUpdate={setEditingDraft}
			/>
		</Box>
	);
}
