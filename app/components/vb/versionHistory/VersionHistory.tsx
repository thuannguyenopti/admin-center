"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
	Box,
	Flex,
	Text,
	Heading,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Badge,
	Separator,
	Card,
	CardHeader,
} from "@optiaxiom/react";
import AbstractDialog from "@/app/components/AbstractDialog";
import { Input } from "@/app/components/Input";
import { deepEqual, compareVersions, formatComparisonSummary } from "./utils";
import { toaster } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import {
	IconXmark,
	IconArrowLeft,
	IconEllipsisSolid,
	IconLaptopMobile,
	IconList,
	IconClockRotateLeft,
	IconTrashCan,
	IconTag,
	IconSplit,
} from "@optimizely/axiom-icons";
import type { Outline } from "@/app/db/initialData";
import type { Version } from "./types";
import { generateMockVersions } from "./types";
import type { useVersionHistory } from "@/app/hooks/useVersionHistory";
import SitePageRenderer from "@/app/site/SitePageRenderer";
import StrideHeader from "@/app/site/StrideHeader";
import PreviewWrapper from "@/app/components/vb/PreviewWrapper";
import { BlockRegistry } from "@/app/components/vb/blocks";

// ── Types ──────────────────────────────────────────────

type ViewMode = "preview" | "compare-visual" | "compare-properties";

type VersionHistoryProps = {
	variations?: { id: string; name: string; status: string; outlines?: Outline[]; data?: any }[];
	pageOutlines?: Outline[];
	onClose: () => void;
	onRestore?: (version: Version) => void;
	/** Inherit the preview mode from the editor so version history opens in the same view */
	initialPreviewMode?: "responsive" | "fixed";
	versionHistory?: ReturnType<typeof useVersionHistory>;
	pageId?: string;
};

/** Background that contrasts with white website content */
const CANVAS_BG = "var(--ax-colors-bg-secondary, #D1D5DB)";

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

/**
 * Build a set of section IDs that differ between two outlines.
 * Used to show per-section change indicators in visual compare.
 */
function getChangedSectionIds(leftOutlines: Outline[], rightOutlines: Outline[]): Set<string> {
	const changed = new Set<string>();

	const leftSections = new Map<string, any>();
	const rightSections = new Map<string, any>();

	for (const outline of leftOutlines) {
		for (const section of outline.tree) {
			const id = section.id ?? section.name ?? "";
			leftSections.set(id, { section, elements: outline.elements });
		}
	}
	for (const outline of rightOutlines) {
		for (const section of outline.tree) {
			const id = section.id ?? section.name ?? "";
			rightSections.set(id, { section, elements: outline.elements });
		}
	}

	// Sections only in left or only in right
	for (const id of leftSections.keys()) {
		if (!rightSections.has(id)) changed.add(id);
	}
	for (const id of rightSections.keys()) {
		if (!leftSections.has(id)) changed.add(id);
	}

	// Sections in both — compare element properties
	for (const [id, left] of leftSections) {
		const right = rightSections.get(id);
		if (!right) continue;

		// Collect element ids from section tree
		const getEleIds = (section: any) => {
			const ids: string[] = [];
			for (const row of section.children || []) {
				for (const col of row.children || []) {
					for (const ele of col.elements || col.children || []) {
						ids.push(ele.id);
					}
				}
			}
			return ids;
		};

		const leftEleIds = getEleIds(left.section);
		const rightEleIds = getEleIds(right.section);

		if (leftEleIds.length !== rightEleIds.length) {
			changed.add(id);
			continue;
		}

		for (let i = 0; i < leftEleIds.length; i++) {
			if (leftEleIds[i] !== rightEleIds[i]) {
				changed.add(id);
				break;
			}
			const le = left.elements[leftEleIds[i]];
			const re = right.elements[rightEleIds[i]];
			if (!deepEqual(le, re)) {
				changed.add(id);
				break;
			}
		}
	}

	return changed;
}

/**
 * Build a set of element IDs that differ between two outlines.
 * Used to show per-element change indicators in visual compare.
 */
function getChangedElementIds(leftOutlines: Outline[], rightOutlines: Outline[]): Set<string> {
	const changed = new Set<string>();

	const leftSections = new Map<string, any>();
	const rightSections = new Map<string, any>();

	for (const outline of leftOutlines) {
		for (const section of outline.tree) {
			const id = section.id ?? section.name ?? "";
			leftSections.set(id, { section, elements: outline.elements });
		}
	}
	for (const outline of rightOutlines) {
		for (const section of outline.tree) {
			const id = section.id ?? section.name ?? "";
			rightSections.set(id, { section, elements: outline.elements });
		}
	}

	// For sections in both, compare individual elements
	for (const [id, left] of leftSections) {
		const right = rightSections.get(id);
		if (!right) continue;

		// Collect element ids from section tree
		const getEleIds = (section: any) => {
			const ids: string[] = [];
			for (const row of section.children || []) {
				for (const col of row.children || []) {
					for (const ele of col.elements || col.children || []) {
						ids.push(ele.id);
					}
				}
			}
			return ids;
		};

		const leftEleIds = getEleIds(left.section);
		const rightEleIds = getEleIds(right.section);

		const leftSet = new Set(leftEleIds);
		const rightSet = new Set(rightEleIds);

		// Elements only in left or only in right
		for (const eleId of leftEleIds) {
			if (!rightSet.has(eleId)) changed.add(eleId);
		}
		for (const eleId of rightEleIds) {
			if (!leftSet.has(eleId)) changed.add(eleId);
		}

		// Elements in both — compare data
		for (const eleId of leftEleIds) {
			if (rightSet.has(eleId)) {
				const le = left.elements[eleId];
				const re = right.elements[eleId];
				if (!deepEqual(le, re)) {
					changed.add(eleId);
				}
			}
		}
	}

	return changed;
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
		<Card
			cursor="pointer"
			onClick={onSelect}
			borderColor={isSelected ? "border.default" : "border.tertiary"}
			bg={isSelected ? "bg.default.pressed" : "bg.default"}
			className="hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors"
		>
			<CardHeader
				description={version.customName ? `${version.label} • ${version.author}` : version.author}
				addonAfter={
					<Box display="flex" alignItems="center" gap="8">
						{version.isCurrent && (
							<Badge variant="subtle" intent="neutral">
								Current
							</Badge>
						)}
						<Menu
							options={[
								{
									label: "Compare",
									addon: <IconSplit size={16} />,
									execute: onCompare,
								},
								{
									label: "Name this version",
									addon: <IconTag size={16} />,
									execute: onRename || (() => {}),
								},
								{
									label: "Restore",
									addon: <IconClockRotateLeft size={16} />,
									execute: onRestore || (() => {}),
								},
								{
									label: "Delete",
									addon: <IconTrashCan size={16} />,
									intent: "danger" as const,
									execute: onDelete || (() => {}),
								},
							]}
						>
							<MenuTrigger
								icon={<IconEllipsisSolid size={14} />}
								size="sm"
								appearance="subtle"
								aria-label="Version options"
								onClick={(e: React.MouseEvent) => e.stopPropagation()}
							/>
							<MenuContent />
						</Menu>
					</Box>
				}
			>
				{version.customName || version.label}
			</CardHeader>
		</Card>
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
	onRestore,
	onDelete,
	onRename,
}: {
	versions: Version[];
	selectedVersion: Version | null;
	onSelectVersion: (v: Version) => void;
	onCompare: (v: Version) => void;
	variationFilter: string;
	variationOptions: { label: string; value: string }[];
	onVariationFilterChange: (v: string) => void;
	onRestore: (v: Version) => void;
	onDelete: (v: Version) => void;
	onRename: (v: Version) => void;
}) {
	const filtered = versions.filter(
		(v) => variationFilter === "all" || v.variationId === variationFilter
	);

	const drafts = filtered.filter((v) => v.status === "draft");
	const published = filtered.filter((v) => v.status === "published");
	const previouslyPublished = filtered.filter((v) => v.status === "previously-published");

	const renderGroup = (label: string, items: Version[], onRestore: (v: Version) => void, onDelete: (v: Version) => void, onRename: (v: Version) => void) => {
		if (items.length === 0) return null;
		return (
			<Box display="flex" flexDirection="column" gap="8">
				<Text fontSize="sm" fontWeight="600" color="fg.tertiary">
					{label}
				</Text>
				{items.map((v) => (
					<VersionCard
						key={v.id}
						version={v}
						isSelected={selectedVersion?.id === v.id}
						onSelect={() => onSelectVersion(v)}
						onCompare={() => onCompare(v)}
						onRestore={() => onRestore(v)}
						onDelete={() => onDelete(v)}
						onRename={() => onRename(v)}
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
				<Box display="flex" gap="12" alignItems="center" flex="1">
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
				<Box display="flex" flexDirection="column" alignItems="end">
					<Text fontSize="xs" color="fg.tertiary">{filtered.length} version{filtered.length !== 1 ? 's' : ''}</Text>
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
				{filtered.length === 0 ? (
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						gap="8"
						py="48"
						px="24"
					>
						<Text fontSize="md" fontWeight="600" color="fg.secondary" textAlign="center">
							No version history yet
						</Text>
						<Text fontSize="sm" color="fg.tertiary" textAlign="center">
							Publish your page to create the first version snapshot
						</Text>
					</Box>
				) : (
					<>
						{renderGroup("Drafts", drafts, onRestore, onDelete, onRename)}
						{renderGroup("Published", published, onRestore, onDelete, onRename)}
						{renderGroup("Previously Published", previouslyPublished, onRestore, onDelete, onRename)}
					</>
				)}
			</Box>
		</Box>
	);
}

// ── Preview Pane (single version) ──────────────────────

const MOBILE_BREAKPOINT = 1024;

function VersionPreview({
	version,
	previewMode,
}: {
	version: Version;
	previewMode: "responsive" | "fixed";
}) {
	const contentRef = useRef<HTMLDivElement>(null);
	const [contentWidth, setContentWidth] = useState(0);

	useEffect(() => {
		if (!contentRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setContentWidth(entry.contentRect.width);
			}
		});

		observer.observe(contentRef.current);
		return () => observer.disconnect();
	}, []);

	const isMobileViewport = previewMode === "fixed" || (contentWidth > 0 && contentWidth <= MOBILE_BREAKPOINT);

	return (
		<Box flex="1" overflow="auto" display="flex" flexDirection="column" alignItems="center" style={{ background: CANVAS_BG }}>
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
				style={{ maxWidth: previewMode === "fixed" ? 390 : undefined }}
			>
				<PreviewWrapper
					mode={previewMode === "fixed" ? "scale" : "responsive"}
					width={previewMode === "fixed" ? 390 : 1100}
					maxWidth={1100}
					height="fill"
				>
					<div ref={contentRef} style={{ minHeight: "100%", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
						<StrideHeader isMobile={isMobileViewport} />
						<SitePageRenderer outlines={version.outlines} isMobile={isMobileViewport} />
					</div>
				</PreviewWrapper>
			</Box>
		</Box>
	);
}

// ── Inline section renderer (no SitePageRenderer wrapper overhead) ──

function renderSectionContent(outline: any, section: any, isMobile = false) {
	const hasBgImage = !!section.bgImage;
	return (
		<div
			className={`overflow-hidden rounded-[10px] ${
				hasBgImage ? "relative min-h-[500px] flex items-center" : "bg-white shadow-sm"
			}`}
			style={
				hasBgImage
					? {
							backgroundImage: `linear-gradient(rgba(25, 75, 255, 0.8), rgba(25, 75, 255, 0.8)), url(${section.bgImage})`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}
					: {}
			}
		>
			<div className={hasBgImage ? "relative z-10 w-full p-12" : "w-full p-8"}>
				{(section.children || []).map((row: any, rIndex: number) => (
					<div
						className={`grid ${isMobile ? "grid-cols-1" : "grid-flow-col auto-cols-fr"} gap-4 ${hasBgImage ? "text-white" : "text-[#05051F]"}`}
						key={row.id ?? rIndex}
					>
						{(row.children || []).map((col: any, cIndex: number) => {
							const colChildren = col.elements || col.children || [];
							return (
								<div key={col.id ?? cIndex}>
									{colChildren.map((element: any, eleIndex: number) => {
										const ele = outline.elements[element.id];
										if (!ele) return null;
										const BlockComponent = BlockRegistry[ele.type];
										if (!BlockComponent) return null;
										return (
											<div key={element.id ?? eleIndex} data-element-id={element.id}>
												<BlockComponent properties={ele.properties} hasBgImage={hasBgImage} />
											</div>
										);
									})}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
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
					<LabelMenuButton label="Variation">{version.variationName}</LabelMenuButton>
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

	const changedElements = useMemo(
		() => getChangedElementIds(leftVersion.outlines, rightVersion.outlines),
		[leftVersion, rightVersion]
	);

	const comparisonSummary = useMemo(
		() => compareVersions(leftVersion.outlines, rightVersion.outlines),
		[leftVersion, rightVersion]
	);

	/** Check if outline is an aside */
	const isAsideOutline = (o: any) => {
		if (!o || typeof o !== "object") return false;
		if (o.role === "aside") return true;
		if (o.isAside === true) return true;
		const t = (o.title ?? "").toString().trim().toLowerCase();
		return t === "aside" || t === "sidebar";
	};

	/** Collect all elements for a version with their IDs */
	const collectElements = (version: Version) => {
		const result: { eleId: string; element: any }[] = [];
		for (const outline of version.outlines) {
			for (const section of outline.tree) {
				for (const row of section.children || []) {
					for (const col of row.children || []) {
						for (const ele of col.elements || col.children || []) {
							if (ele.id) {
								result.push({ eleId: ele.id, element: outline.elements[ele.id] });
							}
						}
					}
				}
			}
		}
		return result;
	};

	/** Render one side's website content with indicator strip on the inner edge */
	const renderSide = (version: Version, side: "left" | "right", isMobile: boolean) => {
		const mainOutlines = version.outlines.filter((o) => !isAsideOutline(o));
		const asideOutlines = version.outlines.filter((o) => isAsideOutline(o));
		const hasAside = asideOutlines.length > 0 && mainOutlines.length > 0;
		const useTwoCol = hasAside && !isMobile;

		const renderOutlineSections = (outline: any) => {
			return outline.tree.map((section: any, i: number) => {
				const sId = section.id ?? section.name ?? "";
				return (
					<Box key={section.id || i} mb={i < outline.tree.length - 1 ? "24" : "0"} data-section-id={sId}>
						{renderSectionContent(outline, section, isMobile)}
					</Box>
				);
			});
		};

		const websiteContent = (
			<Box flex="1" style={{ minWidth: 0 }}>
				{/* Header */}
				<Box bg="bg.default" style={{ borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
					<StrideHeader isMobile={isMobile} />
				</Box>
				{/* Sections */}
				<Box p="24" style={{ background: "var(--ax-colors-bg-secondary, #F3F4F6)" }}>
					{useTwoCol ? (
						<Box display="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)", gap: "24px", alignItems: "start" }}>
							<Box>
								{mainOutlines.map((outline, i) => (
									<Box key={outline.id || i} mb={i < mainOutlines.length - 1 ? "24" : "0"}>
										{renderOutlineSections(outline)}
									</Box>
								))}
							</Box>
							<Box>
								{asideOutlines.map((outline, i) => (
									<Box key={outline.id || i} mb={i < asideOutlines.length - 1 ? "24" : "0"}>
										{renderOutlineSections(outline)}
									</Box>
								))}
							</Box>
						</Box>
					) : (
						<>
							{[...mainOutlines, ...asideOutlines].map((outline, i) => (
								<Box key={outline.id || i} mb={i < mainOutlines.length + asideOutlines.length - 1 ? "24" : "0"}>
									{renderOutlineSections(outline)}
								</Box>
							))}
						</>
					)}
				</Box>
				{/* Bottom radius cap */}
				<Box style={{ background: "var(--ax-colors-bg-secondary, #F3F4F6)", borderRadius: "0 0 12px 12px", height: 4 }} />
			</Box>
		);

	return websiteContent;
	};

	const leftContentRef = useRef<HTMLDivElement>(null);
	const rightContentRef = useRef<HTMLDivElement>(null);
	const [leftWidth, setLeftWidth] = useState(0);
	const [rightWidth, setRightWidth] = useState(0);
	const [elementMetrics, setElementMetrics] = useState<Map<string, { height: number; top: number }>>(new Map());

	useEffect(() => {
		const observers: ResizeObserver[] = [];

		if (leftContentRef.current) {
			const leftObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setLeftWidth(entry.contentRect.width);
				}
			});
			leftObserver.observe(leftContentRef.current);
			observers.push(leftObserver);
		}

		if (rightContentRef.current) {
			const rightObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setRightWidth(entry.contentRect.width);
				}
			});
			rightObserver.observe(rightContentRef.current);
			observers.push(rightObserver);
		}

		return () => observers.forEach(o => o.disconnect());
	}, []);

	// Measure element heights and positions from both sides
	useEffect(() => {
		const observers: ResizeObserver[] = [];
		const metricsMap = new Map<string, { height: number; top: number }>();

		const updateMetrics = () => {
			// Measure left side elements
			if (leftContentRef.current) {
				const containerRect = leftContentRef.current.getBoundingClientRect();
				const leftElements = leftContentRef.current.querySelectorAll('[data-element-id]');
				leftElements.forEach((elementEl) => {
					const elementId = elementEl.getAttribute('data-element-id');
					if (!elementId) return;

					const rect = elementEl.getBoundingClientRect();
					metricsMap.set(`left-${elementId}`, {
						height: rect.height,
						top: rect.top - containerRect.top
					});
				});
			}

			// Measure right side elements
			if (rightContentRef.current) {
				const containerRect = rightContentRef.current.getBoundingClientRect();
				const rightElements = rightContentRef.current.querySelectorAll('[data-element-id]');
				rightElements.forEach((elementEl) => {
					const elementId = elementEl.getAttribute('data-element-id');
					if (!elementId) return;

					const rect = elementEl.getBoundingClientRect();
					metricsMap.set(`right-${elementId}`, {
						height: rect.height,
						top: rect.top - containerRect.top
					});
				});
			}

			setElementMetrics(new Map(metricsMap));
		};

		// Small delay to ensure DOM is fully rendered
		const timer = setTimeout(() => {
			updateMetrics();

			// Set up observers for dynamic updates
			if (leftContentRef.current) {
				const leftElements = leftContentRef.current.querySelectorAll('[data-element-id]');
				leftElements.forEach((elementEl) => {
					const observer = new ResizeObserver(() => {
						updateMetrics();
					});
					observer.observe(elementEl);
					observers.push(observer);
				});
			}

			if (rightContentRef.current) {
				const rightElements = rightContentRef.current.querySelectorAll('[data-element-id]');
				rightElements.forEach((elementEl) => {
					const observer = new ResizeObserver(() => {
						updateMetrics();
					});
					observer.observe(elementEl);
					observers.push(observer);
				});
			}
		}, 500);

		return () => {
			clearTimeout(timer);
			observers.forEach(o => o.disconnect());
		};
	}, [leftVersion, rightVersion, leftWidth, rightWidth]);

	const isLeftMobile = previewMode === "fixed" || (leftWidth > 0 && leftWidth <= MOBILE_BREAKPOINT);
	const isRightMobile = previewMode === "fixed" || (rightWidth > 0 && rightWidth <= MOBILE_BREAKPOINT);

	return (
		<Box flex="1" display="flex" flexDirection="column" overflow="hidden">
			{/* Version selectors — centered with change summary */}
			<Box display="flex" justifyContent="center" py="12" style={{ borderBottom: "2px solid var(--ax-border-tertiary)" }}>
				<Box display="flex" alignItems="center" gap="16">
					<Box style={{ minWidth: "280px" }}>
						{renderSelector(leftVersion, onChangeLeft)}
					</Box>
					<Box px="12">
						<Text fontSize="sm" fontWeight="600" color="fg.tertiary">
							{formatComparisonSummary(comparisonSummary)}
						</Text>
					</Box>
					<Box style={{ minWidth: "280px" }}>
						{renderSelector(rightVersion, onChangeRight)}
					</Box>
				</Box>
			</Box>

			{/* Single scroll area for both sides */}
			<Box flex="1" overflow="auto" p="24" style={{ background: CANVAS_BG }}>
				<Box display="flex" alignItems="stretch" gap="0">
					{/* Left */}
					<Box flex="1" style={{ minWidth: 0 }}>
						<PreviewWrapper
							mode={previewMode === "fixed" ? "scale" : "responsive"}
							width={previewMode === "fixed" ? 390 : 1100}
							maxWidth={1100}
							height="auto"
						>
							<div ref={leftContentRef} style={{ width: "100%" }}>
								{renderSide(leftVersion, "left", isLeftMobile)}
							</div>
						</PreviewWrapper>
					</Box>

					{/* Center indicator bars */}
					<Box display="flex" gap="0" style={{ margin: "0 12px", flexShrink: 0, position: "relative" }}>
						{/* Left (red) indicator */}
						<Box style={{ width: 8, position: "relative" }}>
							{collectElements(leftVersion).map(({ eleId, element }, i) => {
								const isChanged = changedElements.has(eleId);
								const elementType = element?.type || "Element";
								const metrics = elementMetrics.get(`left-${eleId}`);
								if (!metrics) return null;
								return (
									<Box
										key={eleId || i}
										style={{
											position: "absolute",
											top: `${metrics.top}px`,
											height: `${metrics.height}px`,
											width: "100%",
											background: isChanged ? "#FCA5A5" : "#E5E7EB",
											transition: "all 0.2s ease",
											opacity: isChanged ? 1 : 0.4,
										}}
										title={isChanged ? `Changed: ${elementType}` : elementType}
									/>
								);
							})}
						</Box>
						{/* Right (green) indicator */}
						<Box style={{ width: 8, position: "relative" }}>
							{collectElements(rightVersion).map(({ eleId, element }, i) => {
								const isChanged = changedElements.has(eleId);
								const elementType = element?.type || "Element";
								const metrics = elementMetrics.get(`right-${eleId}`);
								if (!metrics) return null;
								return (
									<Box
										key={eleId || i}
										style={{
											position: "absolute",
											top: `${metrics.top}px`,
											height: `${metrics.height}px`,
											width: "100%",
											background: isChanged ? "#86EFAC" : "#E5E7EB",
											transition: "all 0.2s ease",
											opacity: isChanged ? 1 : 0.4,
										}}
										title={isChanged ? `Changed: ${elementType}` : elementType}
									/>
								);
							})}
						</Box>
					</Box>

					{/* Right */}
					<Box flex="1" style={{ minWidth: 0 }}>
						<PreviewWrapper
							mode={previewMode === "fixed" ? "scale" : "responsive"}
							width={previewMode === "fixed" ? 390 : 1100}
							maxWidth={1100}
							height="auto"
						>
							<div ref={rightContentRef} style={{ width: "100%" }}>
								{renderSide(rightVersion, "right", isRightMobile)}
							</div>
						</PreviewWrapper>
					</Box>
				</Box>
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
			<Box
				ref={leftScrollRef}
				onScroll={() => handleScroll("left")}
				flex="1"
				display="flex"
				flexDirection="column"
				overflow="auto"
				px="24"
				py="16"
				style={{ borderRight: "1px solid var(--ax-border-tertiary)" }}
			>
				{renderSelector(leftVersion, onChangeLeft)}

				{sectionGroups.map((group) => (
					<Box key={group.sectionName} mb="24">
						<Box display="flex" alignItems="center" gap="8" mb="12">
							<Text fontSize="xs" color="fg.tertiary" style={{ letterSpacing: "0.05em" }}>
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
			</Box>

			{/* Right */}
			<Box
				ref={rightScrollRef}
				onScroll={() => handleScroll("right")}
				flex="1"
				display="flex"
				flexDirection="column"
				overflow="auto"
				px="24"
				py="16"
			>
				{renderSelector(rightVersion, onChangeRight)}

				{sectionGroups.map((group) => (
					<Box key={group.sectionName} mb="24">
						<Box display="flex" alignItems="center" gap="8" mb="12">
							<Text fontSize="xs" color="fg.tertiary" style={{ letterSpacing: "0.05em" }}>
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
													<Button size="sm" appearance="default" icon={<IconClockRotateLeft size={14} />}>
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
		</Box>
		</Box>
	);
}

// ── Main VersionHistory Component ──────────────────────

export default function VersionHistory({
	variations,
	pageOutlines,
	onClose,
	onRestore,
	initialPreviewMode = "responsive",
	versionHistory,
	pageId,
}: VersionHistoryProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("preview");
	const [previewMode, setPreviewMode] = useState<"responsive" | "fixed">(initialPreviewMode);
	const [renameDialogVersion, setRenameDialogVersion] = useState<Version | null>(null);
	const [renameInput, setRenameInput] = useState("");
	const [deleteDialogVersion, setDeleteDialogVersion] = useState<Version | null>(null);

	// Use real version history if available, otherwise fall back to mock data
	const versions = useMemo(() => {
		if (versionHistory && versionHistory.versions.length > 0) {
			// Convert VersionSnapshot to Version format
			return versionHistory.versions.map((v) => ({
				id: v.id,
				label: v.label,
				author: v.author,
				timestamp: new Date(v.timestamp),
				status: v.status,
				variationId: v.variationId,
				variationName: v.variationName,
				outlines: v.outlines,
				customName: v.customName,
				isCurrent: v.isCurrent,
			}));
		}
		// Fallback to mock data for demo/testing
		return generateMockVersions(variations, pageOutlines);
	}, [versionHistory, variations, pageOutlines]);

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
		// Fix: If no published version or published is same as selected, find a different version to compare
		const compareTarget = published && published.id !== version.id
			? published
			: versions.find(v => v.id !== version.id && v.variationId === version.variationId)
				?? versions.find(v => v.id !== version.id)
				?? null;

		if (!compareTarget) {
			// Can't compare if there's only one version
			return;
		}

		setCompareLeft(version);
		setCompareRight(compareTarget);
		setViewMode("compare-visual");
	};

	const exitCompare = () => {
		setViewMode("preview");
		setCompareLeft(null);
		setCompareRight(null);
	};

	const handleRestoreVersion = (version: Version) => {
		if (!versionHistory || !pageId) {
			toaster.create("Version history not available", { intent: "danger" });
			return;
		}

		// Mark this version as current
		versionHistory.markAsCurrent(version.id);

		// Call the parent's onRestore if provided
		if (onRestore) {
			onRestore(version);
		}

		const versionName = version.customName || version.label;
		toaster.create(`Restored version: ${versionName}`, { intent: "success" });

		// Close version history after a brief delay
		setTimeout(() => onClose(), 500);
	};

	const handleDeleteVersion = (version: Version) => {
		// Open confirmation dialog
		setDeleteDialogVersion(version);
	};

	const confirmDeleteVersion = () => {
		if (!deleteDialogVersion || !versionHistory || !pageId) return;

		const versionName = deleteDialogVersion.customName || deleteDialogVersion.label;
		const success = versionHistory.deleteVersion(deleteDialogVersion.id);

		if (success) {
			toaster.create(`Deleted version: ${versionName}`, { intent: "success" });
			// If we deleted the selected version, select another
			if (selectedVersion?.id === deleteDialogVersion.id) {
				const remaining = versions.filter(v => v.id !== deleteDialogVersion.id);
				setSelectedVersion(remaining[0] || null);
			}
		} else {
			toaster.create("Cannot delete the current version", { intent: "danger" });
		}

		setDeleteDialogVersion(null);
	};

	const handleRenameVersion = (version: Version) => {
		// Open rename dialog
		setRenameDialogVersion(version);
		setRenameInput(version.customName || "");
	};

	const confirmRenameVersion = () => {
		if (!renameDialogVersion || !versionHistory || !pageId) return;

		versionHistory.renameVersion(renameDialogVersion.id, renameInput);

		if (renameInput.trim()) {
			toaster.create(`Version renamed to: ${renameInput}`, { intent: "success" });
		} else {
			toaster.create("Version name cleared", { intent: "success" });
		}

		setRenameDialogVersion(null);
		setRenameInput("");
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Escape to close version history
			if (e.key === 'Escape') {
				// Don't close if a dialog is open
				if (!renameDialogVersion && !deleteDialogVersion) {
					onClose();
				}
				return;
			}

			// Don't trigger shortcuts if user is typing in an input
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			// Arrow keys to navigate versions
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				const currentIndex = versions.findIndex(v => v.id === selectedVersion?.id);
				if (currentIndex === -1) return;

				let newIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
				if (newIndex < 0) newIndex = 0;
				if (newIndex >= versions.length) newIndex = versions.length - 1;

				setSelectedVersion(versions[newIndex]);
			}

			// C to enter compare mode
			if (e.key === 'c' && !isComparing && selectedVersion) {
				startCompare(selectedVersion);
			}

			// B to go back from compare mode
			if (e.key === 'b' && isComparing) {
				exitCompare();
			}

			// V to toggle visual/properties compare
			if (e.key === 'v' && isComparing) {
				setViewMode(viewMode === 'compare-visual' ? 'compare-properties' : 'compare-visual');
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [versions, selectedVersion, isComparing, viewMode, renameDialogVersion, deleteDialogVersion, onClose]);

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
					{/* Keyboard shortcuts hint */}
					<Text fontSize="xs" color="fg.tertiary" style={{ marginRight: 8 }}>
						Press <kbd style={{
							padding: '2px 6px',
							background: 'var(--ax-bg-subtle)',
							border: '1px solid var(--ax-border-tertiary)',
							borderRadius: '4px',
							fontFamily: 'monospace',
							fontSize: '11px'
						}}>Esc</kbd> to close, <kbd style={{
							padding: '2px 6px',
							background: 'var(--ax-bg-subtle)',
							border: '1px solid var(--ax-border-tertiary)',
							borderRadius: '4px',
							fontFamily: 'monospace',
							fontSize: '11px'
						}}>↑↓</kbd> to navigate
					</Text>

					{/* View mode dropdown */}
					<Menu
						options={[
							{
								label: "Preview",
								addon: <IconLaptopMobile size={16} />,
								execute: () => {
									setViewMode("preview");
									setPreviewMode("responsive");
								},
							},
							{
								label: "Preview (mobile)",
								addon: <IconLaptopMobile size={16} />,
								execute: () => {
									setViewMode("preview");
									setPreviewMode("fixed");
								},
							},
							{
								label: "Compare (visual)",
								addon: <IconSplit size={16} />,
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
								icon={isComparing ? <IconSplit size={16} /> : <IconLaptopMobile size={16} />}
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
						onRestore={handleRestoreVersion}
						onDelete={handleDeleteVersion}
						onRename={handleRenameVersion}
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

			{/* Rename Version Dialog */}
			<AbstractDialog
				title="Name this version"
				description="Give this version a custom name to make it easier to identify."
				open={renameDialogVersion !== null}
				setOpen={(open: boolean) => {
					if (!open) {
						setRenameDialogVersion(null);
						setRenameInput("");
					}
				}}
				footerPrimaryText="Save"
				footerPrimaryAction={confirmRenameVersion}
				footerSecondaryText="Cancel"
				size="sm"
			>
				<Box pt="4">
					<Input
						autoFocus
						placeholder="Version name (optional)"
						value={renameInput}
						onChange={(e: any) => setRenameInput(e.target.value)}
						onKeyDown={(e: any) => {
							if (e.key === "Enter") confirmRenameVersion();
						}}
					/>
				</Box>
			</AbstractDialog>

			{/* Delete Version Dialog */}
			<AbstractDialog
				isAlert
				title="Delete Version"
				description="Are you sure you want to delete this version? This action cannot be undone."
				open={deleteDialogVersion !== null}
				setOpen={(open: boolean) => {
					if (!open) setDeleteDialogVersion(null);
				}}
				footerPrimaryText="Delete"
				footerPrimaryAction={confirmDeleteVersion}
				footerSecondaryText="Cancel"
				size="sm"
			>
				<Text>
					{deleteDialogVersion?.customName
						? `You are about to delete "${deleteDialogVersion.customName}".`
						: `You are about to delete the version from ${deleteDialogVersion?.label}.`}
				</Text>
			</AbstractDialog>
		</Box>
	);
}
