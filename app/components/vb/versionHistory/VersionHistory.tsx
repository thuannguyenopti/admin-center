"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
	Box,
	Text,
	Heading,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Badge,
	Separator,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import {
	IconX,
	IconArrowLeft,
	IconDots,
	IconDevices,
	IconList,
	IconRestore,
	IconTrash,
	IconTag,
	IconArrowsSplit2,
} from "@tabler/icons-react";
import type { Outline } from "@/app/db/initialData";
import type { Version } from "./types";
import { generateMockVersions } from "./types";
import SitePageRenderer from "@/app/site/SitePageRenderer";
import StrideHeader from "@/app/site/StrideHeader";
import PreviewWrapper from "@/app/components/vb/PreviewWrapper";

// ── Types ──────────────────────────────────────────────

type ViewMode = "preview" | "compare-visual" | "compare-properties";

type VersionHistoryProps = {
	variations?: { id: string; name: string; status: string; outlines?: Outline[]; data?: any }[];
	pageOutlines?: Outline[];
	onClose: () => void;
	onRestore?: (version: Version) => void;
};

// ── Helpers ────────────────────────────────────────────

function getStatusBadge(status: Version["status"]) {
	switch (status) {
		case "published":
			return <Badge intent="success" variant="subtle">Published</Badge>;
		case "draft":
			return <Badge intent="warning" variant="subtle">Draft</Badge>;
		case "previously-published":
			return <Badge intent="neutral" variant="subtle">Published</Badge>;
	}
}

function flattenElements(outlines: Outline[]) {
	const result: { sectionName: string; elementId: string; type: string; properties: any }[] = [];
	for (const outline of outlines) {
		for (const section of outline.tree) {
			const sectionName = section.name || section.label || outline.title || "Section";
			for (const row of section.children || []) {
				for (const col of row.children || []) {
					for (const ele of col.elements || col.children || []) {
						const eleData = outline.elements[ele.id];
						if (eleData) {
							result.push({
								sectionName,
								elementId: ele.id,
								type: eleData.type,
								properties: eleData.properties,
							});
						}
					}
				}
			}
		}
	}
	return result;
}

function getPropertyValue(properties: any, key: string): string {
	if (!properties) return "";
	if (Array.isArray(properties)) {
		const p = properties.find((p: any) => p.label === key || p.key === key);
		return p?.value ?? "";
	}
	return properties?.[key]?.value ?? "";
}

function getPropertyKeys(properties: any): string[] {
	if (!properties) return [];
	if (Array.isArray(properties)) return properties.map((p: any) => p.label || p.key);
	return Object.keys(properties);
}

// ── Version Card ───────────────────────────────────────

function VersionCard({
	version,
	isSelected,
	onSelect,
	onCompare,
	onRestore,
	onDelete,
	onRename,
}: {
	version: Version;
	isSelected: boolean;
	onSelect: () => void;
	onCompare: () => void;
	onRestore?: () => void;
	onDelete?: () => void;
	onRename?: () => void;
}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			px="16"
			py="12"
			rounded="md"
			cursor="pointer"
			onClick={onSelect}
			border="1"
			borderColor={isSelected ? "border.accent" : "border.tertiary"}
			bg={isSelected ? "bg.information.subtle" : "bg.default"}
			className="hover:bg-[var(--ax-bg-default-hover)] transition-colors"
		>
			<Box display="flex" flexDirection="column" gap="2" flex="1" mr="8">
				<Box display="flex" alignItems="center" gap="4">
					<Text fontSize="sm" fontWeight="600" color="fg.default">
						{version.customName || version.label}
					</Text>
					{version.isCurrent && (
						<Badge intent="primary" variant="subtle" size="sm">Current</Badge>
					)}
				</Box>
				<Text fontSize="xs" color="fg.tertiary">
					{version.author}{version.customName ? ` · ${version.label}` : ""}
				</Text>
			</Box>
			<Menu
				options={[
					{
						label: "Compare",
						addon: <IconArrowsSplit2 size={16} />,
						execute: onCompare,
					},
					{
						label: "Name this version",
						addon: <IconTag size={16} />,
						execute: onRename || (() => {}),
					},
					{
						label: "Restore",
						addon: <IconRestore size={16} />,
						execute: onRestore || (() => {}),
					},
					{
						label: "Delete",
						addon: <IconTrash size={16} />,
						intent: "danger" as const,
						execute: onDelete || (() => {}),
					},
				]}
			>
				<MenuTrigger
					icon={<IconDots size={14} />}
					size="sm"
					appearance="subtle"
					aria-label="Version options"
					onClick={(e: React.MouseEvent) => e.stopPropagation()}
				/>
				<MenuContent />
			</Menu>
		</Box>
	);
}

// ── Version Sidebar ────────────────────────────────────

function VersionSidebar({
	versions,
	selectedVersion,
	onSelectVersion,
	onCompare,
	variationFilter,
	variationOptions,
	onVariationFilterChange,
}: {
	versions: Version[];
	selectedVersion: Version | null;
	onSelectVersion: (v: Version) => void;
	onCompare: (v: Version) => void;
	variationFilter: string;
	variationOptions: { label: string; value: string }[];
	onVariationFilterChange: (v: string) => void;
}) {
	const filtered = versions.filter(
		(v) => variationFilter === "all" || v.variationId === variationFilter
	);

	const drafts = filtered.filter((v) => v.status === "draft");
	const published = filtered.filter((v) => v.status === "published");
	const previouslyPublished = filtered.filter((v) => v.status === "previously-published");

	const renderGroup = (label: string, items: Version[]) => {
		if (items.length === 0) return null;
		return (
			<Box display="flex" flexDirection="column" gap="8">
				<Text fontSize="xs" fontWeight="600" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
					{label}
				</Text>
				{items.map((v) => (
					<VersionCard
						key={v.id}
						version={v}
						isSelected={selectedVersion?.id === v.id}
						onSelect={() => onSelectVersion(v)}
						onCompare={() => onCompare(v)}
					/>
				))}
			</Box>
		);
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="4"
			h="full"
			style={{ width: 360, minWidth: 360, borderRight: "1px solid var(--ax-border-tertiary)" }}
			bg="bg.default"
		>
			{/* Filters */}
			<Box display="flex" alignItems="center" gap="8" px="16" pt="16" pb="8">
				<Box display="flex" gap="12" alignItems="center">
					<Box display="flex" flexDirection="column">
						<Text fontSize="xs" color="fg.tertiary">Language</Text>
						<Text fontSize="sm" fontWeight="500">English</Text>
					</Box>
					<Box display="flex" flexDirection="column">
						<Text fontSize="xs" color="fg.tertiary">Variation</Text>
						<Text fontSize="sm" fontWeight="500">
							{variationOptions.find((o) => o.value === variationFilter)?.label || "All"}
						</Text>
					</Box>
				</Box>
			</Box>

			<Separator />

			{/* Version List */}
			<Box
				display="flex"
				flexDirection="column"
				gap="16"
				px="16"
				py="12"
				overflow="auto"
				flex="1"
			>
				{renderGroup("Drafts", drafts)}
				{renderGroup("Published", published)}
				{renderGroup("Previously Published", previouslyPublished)}
			</Box>
		</Box>
	);
}

// ── Preview Pane (single version) ──────────────────────

function VersionPreview({
	version,
	previewMode,
}: {
	version: Version;
	previewMode: "responsive" | "fixed";
}) {
	return (
		<Box flex="1" overflow="auto" bg="bg.page" display="flex" flexDirection="column" alignItems="center">
			<Box py="8">
				<Text fontSize="sm" color="fg.tertiary">
					{version.status === "published" ? "Published" : version.status === "draft" ? "Draft" : "Previously Published"},{" "}
					{version.label}
				</Text>
			</Box>
			<Box
				flex="1"
				w="full"
				overflow="auto"
				rounded="lg"
				mx="24"
				style={{ maxWidth: previewMode === "fixed" ? 768 : undefined }}
			>
				<PreviewWrapper
					mode={previewMode === "fixed" ? "scale" : "responsive"}
					width={previewMode === "fixed" ? 768 : 1100}
					maxWidth={1100}
					height="fill"
				>
					<div style={{ minHeight: "100%", background: "#fff" }}>
						<StrideHeader />
						<SitePageRenderer outlines={version.outlines} />
					</div>
				</PreviewWrapper>
			</Box>
		</Box>
	);
}

// ── Visual Compare Mode ────────────────────────────────

function VisualCompare({
	leftVersion,
	rightVersion,
	allVersions,
	variationOptions,
	onChangeLeft,
	onChangeRight,
	previewMode,
}: {
	leftVersion: Version;
	rightVersion: Version;
	allVersions: Version[];
	variationOptions: { label: string; value: string }[];
	onChangeLeft: (v: Version) => void;
	onChangeRight: (v: Version) => void;
	previewMode: "responsive" | "fixed";
}) {
	const versionMenuOptions = (onChange: (v: Version) => void) =>
		allVersions.map((v) => ({
			label: `${v.status === "published" ? "Published" : v.status === "draft" ? "Draft" : "Prev."}, ${v.label}`,
			execute: () => onChange(v),
		}));

	const renderSelector = (version: Version, onChange: (v: Version) => void) => (
		<Box display="flex" alignItems="center" gap="8" py="8" px="16">
			<Menu
				options={variationOptions.map((o) => ({
					label: o.label,
					execute: () => {
						const match = allVersions.find((v) => v.variationId === o.value);
						if (match) onChange(match);
					},
				}))}
			>
				<MenuTrigger asChild>
<LabelMenuButton label="Variation">
						{version.variationName}
					</LabelMenuButton>
				</MenuTrigger>
				<MenuContent />
			</Menu>
			<Menu options={versionMenuOptions(onChange)}>
				<MenuTrigger asChild>
				<LabelMenuButton label="Version">
						{version.status === "published" ? "Published" : version.status === "draft" ? "Draft" : "Prev."},{" "}
						{version.label}
					</LabelMenuButton>
				</MenuTrigger>
				<MenuContent />
			</Menu>
		</Box>
	);

	const leftScrollRef = useRef<HTMLDivElement>(null);
	const rightScrollRef = useRef<HTMLDivElement>(null);
	const isSyncing = useRef(false);

	const handleScroll = useCallback((source: "left" | "right") => {
		if (isSyncing.current) return;
		isSyncing.current = true;
		const from = source === "left" ? leftScrollRef.current : rightScrollRef.current;
		const to = source === "left" ? rightScrollRef.current : leftScrollRef.current;
		if (from && to) {
			to.scrollTop = from.scrollTop;
			to.scrollLeft = from.scrollLeft;
		}
		requestAnimationFrame(() => { isSyncing.current = false; });
	}, []);

	return (
		<Box flex="1" display="flex" overflow="hidden">
			{/* Left */}
			<Box flex="1" display="flex" flexDirection="column" overflow="hidden">
				{renderSelector(leftVersion, onChangeLeft)}
				<div
					ref={leftScrollRef}
					onScroll={() => handleScroll("left")}
					style={{ flex: 1, overflow: "auto", background: "#F3F4F6", padding: "24px" }}
				>
					<div style={{ borderRight: "4px solid var(--ax-border-error, #DC2626)", borderRadius: 12, overflow: "hidden" }}>
						<PreviewWrapper
							mode={previewMode === "fixed" ? "scale" : "responsive"}
							width={previewMode === "fixed" ? 768 : 1100}
							maxWidth={1100}
							height="fill"
						>
							<div style={{ minHeight: "100%", background: "#fff" }}>
								<StrideHeader />
								<SitePageRenderer outlines={leftVersion.outlines} />
							</div>
						</PreviewWrapper>
					</div>
				</div>
			</Box>

			{/* Right */}
			<Box flex="1" display="flex" flexDirection="column" overflow="hidden">
				{renderSelector(rightVersion, onChangeRight)}
				<div
					ref={rightScrollRef}
					onScroll={() => handleScroll("right")}
					style={{ flex: 1, overflow: "auto", background: "#F3F4F6", padding: "24px" }}
				>
					<div style={{ borderLeft: "4px solid var(--ax-border-success, #16A34A)", borderRadius: 12, overflow: "hidden" }}>
						<PreviewWrapper
							mode={previewMode === "fixed" ? "scale" : "responsive"}
							width={previewMode === "fixed" ? 768 : 1100}
							maxWidth={1100}
							height="fill"
						>
							<div style={{ minHeight: "100%", background: "#fff" }}>
								<StrideHeader />
								<SitePageRenderer outlines={rightVersion.outlines} />
							</div>
						</PreviewWrapper>
					</div>
				</div>
			</Box>
		</Box>
	);
}

// ── Property Compare Mode ──────────────────────────────

function PropertyCompare({
	leftVersion,
	rightVersion,
	allVersions,
	variationOptions,
	onChangeLeft,
	onChangeRight,
}: {
	leftVersion: Version;
	rightVersion: Version;
	allVersions: Version[];
	variationOptions: { label: string; value: string }[];
	onChangeLeft: (v: Version) => void;
	onChangeRight: (v: Version) => void;
}) {
	const leftElements = flattenElements(leftVersion.outlines);
	const rightElements = flattenElements(rightVersion.outlines);

	// Build unified element list keyed by elementId
	const allElementIds = new Set([
		...leftElements.map((e) => e.elementId),
		...rightElements.map((e) => e.elementId),
	]);

	const leftMap = Object.fromEntries(leftElements.map((e) => [e.elementId, e]));
	const rightMap = Object.fromEntries(rightElements.map((e) => [e.elementId, e]));

	// Group by section
	const sectionGroups: {
		sectionName: string;
		elements: {
			id: string;
			left: typeof leftElements[0] | null;
			right: typeof rightElements[0] | null;
		}[];
	}[] = [];

	const sectionMap = new Map<string, typeof sectionGroups[0]>();

	for (const id of allElementIds) {
		const left = leftMap[id] || null;
		const right = rightMap[id] || null;
		const sectionName = left?.sectionName || right?.sectionName || "Unknown";

		if (!sectionMap.has(sectionName)) {
			const group = { sectionName, elements: [] };
			sectionMap.set(sectionName, group);
			sectionGroups.push(group);
		}
		sectionMap.get(sectionName)!.elements.push({ id, left, right });
	}

	const versionMenuOptions = (onChange: (v: Version) => void) =>
		allVersions.map((v) => ({
			label: `${v.status === "published" ? "Published" : v.status === "draft" ? "Draft" : "Prev."}, ${v.label}`,
			execute: () => onChange(v),
		}));

	const renderSelector = (version: Version, onChange: (v: Version) => void) => (
		<Box display="flex" alignItems="center" gap="8" py="8">
			<Menu
				options={variationOptions.map((o) => ({
					label: o.label,
					execute: () => {
						const match = allVersions.find((v) => v.variationId === o.value);
						if (match) onChange(match);
					},
				}))}
			>
				<MenuTrigger asChild>
<LabelMenuButton label="Variation">
						{version.variationName}
					</LabelMenuButton>
				</MenuTrigger>
				<MenuContent />
			</Menu>
			<Menu options={versionMenuOptions(onChange)}>
				<MenuTrigger asChild>
					<LabelMenuButton label="Version">
						{version.status === "published" ? "Published" : version.status === "draft" ? "Draft" : "Prev."},{" "}
						{version.label}
					</LabelMenuButton>
				</MenuTrigger>
				<MenuContent />
			</Menu>
		</Box>
	);

	const leftScrollRef = useRef<HTMLDivElement>(null);
	const rightScrollRef = useRef<HTMLDivElement>(null);
	const isSyncing = useRef(false);

	const handleScroll = useCallback((source: "left" | "right") => {
		if (isSyncing.current) return;
		isSyncing.current = true;
		const from = source === "left" ? leftScrollRef.current : rightScrollRef.current;
		const to = source === "left" ? rightScrollRef.current : leftScrollRef.current;
		if (from && to) {
			to.scrollTop = from.scrollTop;
		}
		requestAnimationFrame(() => { isSyncing.current = false; });
	}, []);

	return (
		<Box flex="1" display="flex" overflow="hidden">
			{/* Left */}
			<div
				ref={leftScrollRef}
				onScroll={() => handleScroll("left")}
				style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: "16px 24px", borderRight: "1px solid var(--ax-border-tertiary)" }}
			>
				{renderSelector(leftVersion, onChangeLeft)}

				{sectionGroups.map((group) => (
					<Box key={group.sectionName} mb="24">
						<Box display="flex" alignItems="center" gap="8" mb="12">
							<Text fontSize="xs" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
								{group.sectionName}
							</Text>
							<Separator style={{ flex: 1 }} />
						</Box>

						{group.elements.map(({ id, left }) => {
							if (!left) return null;
							const right = rightMap[id] || null;
							const keys = getPropertyKeys(left.properties);

							return (
								<Box key={id} mb="16">
									{keys.map((key) => {
										const leftVal = getPropertyValue(left.properties, key);
										const rightVal = right ? getPropertyValue(right.properties, key) : "";
										const changed = leftVal !== rightVal;

										return (
											<Box
												key={key}
												py="8"
												px="12"
												rounded="sm"
												mb="4"
												bg={changed ? "bg.warning.subtle" : undefined}
												style={changed ? { borderLeft: "3px solid var(--ax-border-error, #DC2626)" } : undefined}
											>
												<Text fontSize="xs" color="fg.tertiary">{key}</Text>
												<Text fontSize="sm" fontWeight="500" color="fg.default">
													{String(leftVal) || "—"}
												</Text>
											</Box>
										);
									})}
								</Box>
							);
						})}
					</Box>
				))}
			</div>

			{/* Right */}
			<div
				ref={rightScrollRef}
				onScroll={() => handleScroll("right")}
				style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: "16px 24px" }}
			>
				{renderSelector(rightVersion, onChangeRight)}

				{sectionGroups.map((group) => (
					<Box key={group.sectionName} mb="24">
						<Box display="flex" alignItems="center" gap="8" mb="12">
							<Text fontSize="xs" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
								{group.sectionName}
							</Text>
							<Separator style={{ flex: 1 }} />
						</Box>

						{group.elements.map(({ id, right }) => {
							if (!right) return null;
							const left = leftMap[id] || null;
							const keys = getPropertyKeys(right.properties);

							return (
								<Box key={id} mb="16">
									{keys.map((key) => {
										const rightVal = getPropertyValue(right.properties, key);
										const leftVal = left ? getPropertyValue(left.properties, key) : "";
										const changed = leftVal !== rightVal;

										return (
											<Box
												key={key}
												py="8"
												px="12"
												rounded="sm"
												mb="4"
												display="flex"
												justifyContent="space-between"
												alignItems="center"
												bg={changed ? "bg.success.subtle" : undefined}
												style={changed ? { borderLeft: "3px solid var(--ax-border-success, #16A34A)" } : undefined}
											>
												<Box>
													<Text fontSize="xs" color="fg.tertiary">{key}</Text>
													<Text fontSize="sm" fontWeight="500" color="fg.default">
														{String(rightVal) || "—"}
													</Text>
												</Box>
												{changed && (
													<Button size="sm" appearance="default" icon={<IconRestore size={14} />}>
														Restore
													</Button>
												)}
											</Box>
										);
									})}
								</Box>
							);
						})}
					</Box>
				))}
		</div>
		</Box>
	);
}

// ── Main VersionHistory Component ──────────────────────

export default function VersionHistory({
	variations,
	pageOutlines,
	onClose,
	onRestore,
}: VersionHistoryProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("preview");
	const [previewMode, setPreviewMode] = useState<"responsive" | "fixed">("fixed");

	const versions = useMemo(
		() => generateMockVersions(variations, pageOutlines),
		[variations, pageOutlines]
	);

	const variationOptions = useMemo(() => {
		const opts = (variations ?? [{ id: "original", name: "Original", status: "Published" }]).map(
			(v) => ({ label: v.name, value: v.id })
		);
		return opts;
	}, [variations]);

	const [variationFilter, setVariationFilter] = useState(variationOptions[0]?.value ?? "original");
	const [selectedVersion, setSelectedVersion] = useState<Version | null>(
		versions.find((v) => v.isCurrent) ?? versions.find((v) => v.status === "draft") ?? versions[0] ?? null
	);
	const [compareLeft, setCompareLeft] = useState<Version | null>(null);
	const [compareRight, setCompareRight] = useState<Version | null>(null);

	const isComparing = viewMode === "compare-visual" || viewMode === "compare-properties";

	const startCompare = (version: Version) => {
		const published = versions.find((v) => v.status === "published" && v.variationId === version.variationId);
		setCompareLeft(version);
		setCompareRight(published ?? versions[0]);
		setViewMode("compare-visual");
	};

	const exitCompare = () => {
		setViewMode("preview");
		setCompareLeft(null);
		setCompareRight(null);
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			h="full"
			w="full"
			bg="bg.page"
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 100,
			}}
		>
			{/* ── Toolbar ── */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px="16"
				py="12"
				bg="bg.default"
				borderB="1"
				borderColor="border.tertiary"
				style={{ minHeight: 56 }}
			>
				<Box display="flex" alignItems="center" gap="12">
					{isComparing && (
						<Button
							appearance="subtle"
							icon={<IconArrowLeft size={16} />}
							onClick={exitCompare}
							aria-label="Back to list"
						/>
					)}
					<Heading level="4">Version History</Heading>
				</Box>

				<Box display="flex" alignItems="center" gap="8">
					{/* View mode dropdown */}
					<Menu
						options={[
							{
								label: "Preview",
								addon: <IconDevices size={16} />,
								execute: () => {
									setViewMode("preview");
									setPreviewMode("responsive");
								},
							},
							{
								label: "Preview (mobile)",
								addon: <IconDevices size={16} />,
								execute: () => {
									setViewMode("preview");
									setPreviewMode("fixed");
								},
							},
							{
								label: "Compare (visual)",
								addon: <IconArrowsSplit2 size={16} />,
								execute: () => {
									if (!isComparing) {
										const pub = versions.find((v) => v.status === "published");
										const draft = versions.find((v) => v.status === "draft");
										setCompareLeft(draft ?? versions[0]);
										setCompareRight(pub ?? versions[1] ?? versions[0]);
									}
									setViewMode("compare-visual");
								},
							},
							{
								label: "Compare (properties)",
								addon: <IconList size={16} />,
								execute: () => {
									if (!isComparing) {
										const pub = versions.find((v) => v.status === "published");
										const draft = versions.find((v) => v.status === "draft");
										setCompareLeft(draft ?? versions[0]);
										setCompareRight(pub ?? versions[1] ?? versions[0]);
									}
									setViewMode("compare-properties");
								},
							},
						]}
					>
						<MenuTrigger asChild>
							<Button
								appearance="default"
								icon={isComparing ? <IconArrowsSplit2 size={16} /> : <IconDevices size={16} />}
								iconPosition="end"
							>
								{viewMode === "preview"
									? previewMode === "fixed" ? "Preview (mobile)" : "Preview"
									: viewMode === "compare-visual" ? "Compare (visual)" : "Compare (properties)"}
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>

					<Button appearance="default" onClick={onClose}>
						Close
					</Button>
				</Box>
			</Box>

			{/* ── Body ── */}
			<Box display="flex" flex="1" overflow="hidden">
				{/* Sidebar (hidden in compare mode) */}
				{!isComparing && (
					<VersionSidebar
						versions={versions}
						selectedVersion={selectedVersion}
						onSelectVersion={setSelectedVersion}
						onCompare={startCompare}
						variationFilter={variationFilter}
						variationOptions={variationOptions}
						onVariationFilterChange={setVariationFilter}
					/>
				)}

				{/* Main area */}
				{viewMode === "preview" && selectedVersion && (
					<VersionPreview version={selectedVersion} previewMode={previewMode} />
				)}

				{viewMode === "compare-visual" && compareLeft && compareRight && (
					<VisualCompare
						leftVersion={compareLeft}
						rightVersion={compareRight}
						allVersions={versions}
						variationOptions={variationOptions}
						onChangeLeft={setCompareLeft}
						onChangeRight={setCompareRight}
						previewMode={previewMode}
					/>
				)}

				{viewMode === "compare-properties" && compareLeft && compareRight && (
					<PropertyCompare
						leftVersion={compareLeft}
						rightVersion={compareRight}
						allVersions={versions}
						variationOptions={variationOptions}
						onChangeLeft={setCompareLeft}
						onChangeRight={setCompareRight}
					/>
				)}
			</Box>
		</Box>
	);
}
