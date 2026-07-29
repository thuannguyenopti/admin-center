"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Box, Button, Text } from "@optiaxiom/react";
import { IconPlus, IconXmark } from "@optimizely/axiom-icons";
import type { BrandPack, BrandTemplate } from "../../types";

type TemplateEntry = BrandTemplate & { inactive?: boolean };

const CHANNELS = ["Email", "Paid", "Social", "Web"] as const;

type Props = { pack: BrandPack };

export function TemplatesSection({ pack }: Props) {
	const [templates, setTemplates] = useState<TemplateEntry[]>(pack.templates);
	const [filter, setFilter] = useState<string>("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const toggleInactive = (id: string) => {
		setTemplates((prev) =>
			prev.map((t) => (t.id === id ? { ...t, inactive: !t.inactive } : t))
		);
	};

	const remove = (id: string) => {
		setTemplates((prev) => prev.filter((t) => t.id !== id));
	};

	const channelCounts = CHANNELS.reduce<Record<string, number>>((acc, ch) => {
		acc[ch] = templates.filter(
			(t) => t.channel?.toLowerCase() === ch.toLowerCase()
		).length;
		return acc;
	}, {});

	const filtered =
		filter === "all"
			? templates
			: templates.filter((t) => t.channel?.toLowerCase() === filter.toLowerCase());

	const previewTemplates = templates.slice(0, 3);

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			id="section-templates"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
		>
			{/* Top bar: tag + Add template dropdown */}
			<Box alignItems="center" display="flex" justifyContent="space-between" p="24" pb="20">
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
					Template Library
				</Box>
				<AddTemplateDropdown />
			</Box>

			{/* Hero header */}
			<Box style={{ background: "rgba(0,0,0,0.08)", height: 1 }} />
			<Box display="flex" gap="32" p="32">
				{/* Left */}
				<Box display="flex" flexDirection="column" gap="16" style={{ flex: 1 }}>
					<Text
						style={{
							fontSize: 28,
							fontWeight: 800,
							letterSpacing: "-0.02em",
							lineHeight: 1.15,
						}}
					>
						Approved formats, ready to generate.
					</Text>
					<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.6, maxWidth: 300 }}>
						Browse the highest-signal layouts by channel and use the right format as the starting point for Opal.
					</Text>
					<Box display="flex" style={{ flexWrap: "wrap", gap: 6 }}>
						{CHANNELS.map((ch) => (
							<Box
								key={ch}
								style={{
									border: "1px solid var(--ax-colors-border-default)",
									borderRadius: 4,
									color: "var(--ax-colors-fg-secondary)",
									fontSize: 11,
									fontWeight: 700,
									letterSpacing: "0.06em",
									padding: "2px 8px",
									textTransform: "uppercase",
								}}
							>
								{ch}
							</Box>
						))}
					</Box>
				</Box>

				{/* Right: template thumbnail previews */}
				{previewTemplates.length > 0 && (
					<Box display="flex" gap="8" style={{ alignItems: "flex-start", flexShrink: 0 }}>
						{previewTemplates.map((t, i) => (
							<Box
								key={t.id}
								overflow="hidden"
								rounded="lg"
								style={{
									height: i === 0 ? 200 : 160,
									marginTop: i === 0 ? 0 : 20,
									opacity: i === 0 ? 1 : 0.65,
									width: i === 0 ? 160 : 110,
								}}
							>
								<img
									alt={t.name}
									src={t.thumb}
									style={{ height: "100%", objectFit: "cover", width: "100%" }}
								/>
							</Box>
						))}
					</Box>
				)}
			</Box>

			{/* Divider */}
			<Box style={{ background: "var(--ax-colors-border-tertiary)", height: 1 }} />

			{/* Filter + view bar */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				px="24"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
			>
				<Box display="flex">
					<FilterTab
						active={filter === "all"}
						label="All"
						count={templates.length}
						onClick={() => setFilter("all")}
					/>
					{CHANNELS.filter((ch) => channelCounts[ch] > 0).map((ch) => (
						<FilterTab
							key={ch}
							active={filter === ch.toLowerCase()}
							label={ch}
							count={channelCounts[ch]}
							onClick={() => setFilter(ch.toLowerCase())}
						/>
					))}
				</Box>
				<Box alignItems="center" display="flex" gap="12">
					<Text color="fg.tertiary" fontSize="sm">{templates.length} templates</Text>
					<Box display="flex" gap="4">
						<ViewToggle
							active={viewMode === "grid"}
							onClick={() => setViewMode("grid")}
							icon={
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
									<rect x="0" y="0" width="6" height="6" rx="1" fill="currentColor" />
									<rect x="8" y="0" width="6" height="6" rx="1" fill="currentColor" />
									<rect x="0" y="8" width="6" height="6" rx="1" fill="currentColor" />
									<rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor" />
								</svg>
							}
						/>
						<ViewToggle
							active={viewMode === "list"}
							onClick={() => setViewMode("list")}
							icon={
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
									<rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor" />
									<rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor" />
									<rect x="0" y="11" width="14" height="2" rx="1" fill="currentColor" />
								</svg>
							}
						/>
					</Box>
				</Box>
			</Box>

			{/* Template grid */}
			<Box p="24">
				{filtered.length > 0 ? (
					<Box
						display="grid"
						gap="12"
						style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
					>
						{filtered.map((template) => (
							<TemplateCard
								key={template.id}
								template={template}
								onToggleInactive={() => toggleInactive(template.id)}
								onRemove={() => remove(template.id)}
							/>
						))}
					</Box>
				) : (
					<Box
						alignItems="center"
						bg="bg.secondary"
						display="flex"
						justifyContent="center"
						py="40"
						rounded="xl"
					>
						<Text color="fg.secondary" fontSize="sm">No templates in this channel yet.</Text>
					</Box>
				)}

			</Box>
		</Box>
	);
}

function AddTemplateDropdown() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	return (
		<Box ref={ref} style={{ position: "relative" }}>
			<Button appearance="primary" icon={<IconPlus />} onClick={() => setOpen((v) => !v)} size="sm">
				Add template
			</Button>
			{open && (
				<Box
					bg="bg.default"
					rounded="lg"
					style={{
						border: "1px solid rgba(0,0,0,0.12)",
						boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
						minWidth: 200,
						overflow: "hidden",
						position: "absolute",
						right: 0,
						top: "calc(100% + 6px)",
						zIndex: 50,
					}}
				>
					<DropdownItem
						label="Upload from disk"
						description="PNG, JPG, PDF up to 20 MB"
						onClick={() => setOpen(false)}
					/>
					<Box style={{ background: "rgba(0,0,0,0.06)", height: 1 }} />
					<DropdownItem
						label="Import from Figma"
						description="Connect and pull frames directly"
						onClick={() => setOpen(false)}
					/>
				</Box>
			)}
		</Box>
	);
}

function DropdownItem({
	description,
	label,
	onClick,
}: {
	description: string;
	label: string;
	onClick: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="2"
			onClick={onClick}
			px="16"
			py="12"
			style={{
				background: hovered ? "var(--ax-colors-bg-secondary)" : "transparent",
				cursor: "pointer",
				transition: "background 0.1s",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Text fontWeight="500" style={{ fontSize: 13 }}>{label}</Text>
			<Text color="fg.tertiary" fontSize="xs">{description}</Text>
		</Box>
	);
}

function TemplateCard({
	onRemove,
	onToggleInactive,
	template,
}: {
	onRemove: () => void;
	onToggleInactive: () => void;
	template: TemplateEntry;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			style={{
				border: "1px solid rgba(0,0,0,0.1)",
				opacity: template.inactive ? 0.45 : 1,
				transition: "opacity 0.2s, box-shadow 0.15s",
				...(hovered && !template.inactive
					? { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }
					: {}),
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Thumbnail */}
			<Box style={{ aspectRatio: "4/3", overflow: "hidden", position: "relative" }}>
				<img
					alt={template.name}
					src={template.thumb}
					style={{
						filter: template.inactive ? "grayscale(60%)" : undefined,
						height: "100%",
						objectFit: "cover",
						width: "100%",
					}}
				/>
				{hovered && (
					<Box
						gap="4"
						p="8"
						style={{
							alignItems: "flex-end",
							bottom: 0,
							display: "flex",
							justifyContent: "flex-end",
							left: 0,
							position: "absolute",
							right: 0,
							top: 0,
						}}
					>
						<Box
							onClick={(e) => { e.stopPropagation(); onToggleInactive(); }}
							style={{
								background: "rgba(255,255,255,0.92)",
								borderRadius: 6,
								color: "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 11,
								fontWeight: 600,
								padding: "4px 8px",
							}}
						>
							{template.inactive ? "Activate" : "Deactivate"}
						</Box>
						<Box
							onClick={(e) => { e.stopPropagation(); onRemove(); }}
							style={{
								alignItems: "center",
								background: "rgba(255,255,255,0.92)",
								borderRadius: 6,
								cursor: "pointer",
								display: "flex",
								padding: "4px 6px",
							}}
						>
							<IconXmark size={12} style={{ color: "var(--ax-colors-fg-secondary)" }} />
						</Box>
					</Box>
				)}
			</Box>

			{/* Info */}
			<Box display="flex" flexDirection="column" gap="4" p="10">
				<Text
					fontWeight="500"
					style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
				>
					{template.name}
				</Text>
				<Box alignItems="center" display="flex" gap="6">
					<Badge intent="neutral" variant="subtle" style={{ fontSize: 10 }}>
						{template.channel}
					</Badge>
					{template.inactive && (
						<Text color="fg.tertiary" fontSize="xs">Inactive</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}

function FilterTab({
	active,
	count,
	label,
	onClick,
}: {
	active: boolean;
	count: number;
	label: string;
	onClick: () => void;
}) {
	return (
		<Box
			onClick={onClick}
			px="12"
			py="12"
			style={{
				borderBottom: `2px solid ${active ? "var(--ax-colors-fg-default)" : "transparent"}`,
				color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
				cursor: "pointer",
				fontSize: 14,
				fontWeight: active ? 600 : 400,
				transition: "color 0.1s",
				whiteSpace: "nowrap",
			}}
		>
			{label}{" "}
			{count > 0 && (
				<span style={{ fontWeight: 400, opacity: 0.6 }}>{count}</span>
			)}
		</Box>
	);
}

function ViewToggle({
	active,
	icon,
	onClick,
}: {
	active: boolean;
	icon: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<Box
			onClick={onClick}
			style={{
				background: active ? "var(--ax-colors-bg-secondary)" : "transparent",
				borderRadius: 4,
				color: active ? "var(--ax-colors-fg-secondary)" : "var(--ax-colors-fg-tertiary)",
				cursor: "pointer",
				padding: "4px 6px",
			}}
		>
			{icon}
		</Box>
	);
}
