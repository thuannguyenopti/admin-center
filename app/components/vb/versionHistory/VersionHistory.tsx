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
import { useToast } from "@/app/hooks/useToast";
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
import { siteConfig } from "@/app/db/initialData";
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
			borderColor={isSelected ? "border.accent" : "border.tertiary"}
			bg={isSelected ? "bg.information.subtle" : "bg.default"}
			className="hover:bg-[var(--ax-bg-default-hover)] transition-colors"
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

function VersionPreview({
	version,
	previewMode,
}: {
	version: Version;
	previewMode: "responsive" | "fixed";
}) {
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
				style={{ maxWidth: previewMode === "fixed" ? 768 : undefined }}
			>
				<PreviewWrapper
					mode={previewMode === "fixed" ? "scale" : "responsive"}
					width={previewMode === "fixed" ? 768 : 1100}
					maxWidth={1100}
					height="fill"
				>
					<div style={{ minHeight: "100%", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
						<CompareHeader />
						<SitePageRenderer outlines={version.outlines} />
					</div>
				</PreviewWrapper>
			</Box>
		</Box>
	);
}

// ── Inline section renderer (no SitePageRenderer wrapper overhead) ──

function renderSectionContent(outline: any, section: any) {
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
						className={`grid grid-flow-col auto-cols-fr gap-4 ${hasBgImage ? "text-white" : "text-[#05051F]"}`}
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
										return <BlockComponent key={element.id ?? eleIndex} properties={ele.properties} hasBgImage={hasBgImage} />;
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

/** Responsive header with mobile menu */
function CompareHeader() {
	return (
		<div className="w-full bg-white px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-gray-100 shrink-0">
			<div className="flex items-center gap-6 sm:gap-12 flex-1">
				<div className="select-none">
					<svg className="w-24 h-6 sm:w-32 sm:h-8" viewBox="0 0 128 32" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g clipPath="url(#clip0_compare)">
							<path d="M6.77799 2.59403C5.32643 4.22489 4.30713 6.51892 3.8335 9.12422C3.66336 10.0581 3.57752 10.9627 3.57752 11.8266C3.57752 12.8507 3.70015 13.8183 3.94999 14.6935C4.13699 15.3499 4.39756 15.9522 4.72251 16.4755C5.20994 17.265 5.84452 17.8763 6.58945 18.2823C7.3344 18.6883 8.18969 18.8958 9.1446 18.8958H18.4578C18.8011 18.8958 19.0894 18.9455 19.3162 19.0289C19.4863 19.0921 19.6227 19.1733 19.727 19.2613C19.8833 19.3966 19.9722 19.5342 20.0381 19.7079C20.1025 19.8838 20.1485 20.1184 20.1485 20.4635C20.1485 20.7365 20.1178 21.0771 20.0458 21.4741C19.868 22.4418 19.517 23.2042 19.0204 23.7478C18.5222 24.2892 17.8677 24.6185 17.0461 24.6208H1.31819L0 31.866H16.0973C18.3536 31.8683 20.268 30.8623 21.7226 29.1525C23.1788 27.4448 24.1705 25.0606 24.658 22.3741C24.874 21.1831 24.9875 20.0846 24.9875 19.0695C24.9875 18.0207 24.8649 17.0552 24.6028 16.2025C24.4066 15.5642 24.1322 14.9935 23.7904 14.513C23.2769 13.7913 22.6209 13.2815 21.8637 12.9543C21.1034 12.6273 20.2358 12.4762 19.2579 12.4762H9.97229C9.70865 12.4762 9.49099 12.4288 9.3224 12.3544C9.19519 12.298 9.09401 12.228 9.01587 12.1491C8.89782 12.0318 8.82424 11.9055 8.766 11.7363C8.70928 11.5671 8.671 11.3438 8.66942 11.0348C8.66942 10.7867 8.69551 10.4867 8.75835 10.1415C8.93155 9.20091 9.25191 8.49489 9.6765 8.00992C10.1041 7.52495 10.6467 7.24525 11.3227 7.24299H26.4084L27.7266 0H12.2715C10.1118 0 8.22955 0.960923 6.77951 2.59403H6.77799Z" fill="#194BFF" />
							<path d="M49.5055 0H29.1424L27.8242 7.24299H35.5204L31.037 31.866H36.0063L40.4897 7.24299H48.1873L49.5055 0Z" fill="#194BFF" />
							<path d="M76.297 0L70.5522 31.5502L65.9781 22.241C67.1841 21.4312 68.2603 20.2718 69.1539 18.8101C70.2531 17.0124 71.0775 14.7611 71.5513 12.1559C71.7982 10.7957 71.9238 9.51442 71.9256 8.31444C71.9256 7.0693 71.7891 5.91214 71.5052 4.87452C71.2923 4.09857 70.998 3.39254 70.6238 2.779C70.0644 1.85868 69.3334 1.15491 68.4732 0.692494C67.6118 0.230079 66.6188 0 65.5044 0H50.4188L44.6172 31.866H49.5589L54.0423 7.24299H64.5556C64.9924 7.24299 65.3648 7.31291 65.6669 7.43472C65.8938 7.5272 66.0795 7.64676 66.2311 7.78661C66.458 7.99865 66.6097 8.24452 66.7213 8.57158C66.8335 8.90092 66.9039 9.32946 66.9039 9.89797C66.9039 10.4009 66.8475 11.0077 66.7182 11.7093C66.5575 12.5957 66.3397 13.3649 66.0764 14.0168C65.6791 14.9936 65.1841 15.7085 64.5865 16.1957C63.9872 16.683 63.2726 16.9469 62.4172 16.9492H53.4384L52.2321 23.5764H60.339L63.9611 31.866H75.4629L81.2678 0H76.297Z" fill="#194BFF" />
							<path d="M104.132 11.3145C104.132 9.63401 103.936 8.07308 103.552 6.68133C103.266 5.63695 102.872 4.68956 102.385 3.85947C101.652 2.61434 100.706 1.64214 99.5977 0.990245C98.4882 0.338353 97.2173 0 95.8178 0H83.548L77.7461 31.866H90.3859C91.905 31.866 93.3949 31.4307 94.7986 30.6366C96.903 29.448 98.8145 27.4607 100.358 24.9253C101.9 22.3877 103.076 19.2974 103.697 15.889C103.988 14.2875 104.132 12.7558 104.132 11.3168V11.3145ZM95.9391 22.0786C94.6057 23.6869 92.9823 24.6253 91.3359 24.623H84.0078L87.1732 7.24073H94.8708C95.5496 7.24073 96.1472 7.39412 96.6579 7.66706C97.4241 8.07984 97.9974 8.74753 98.399 9.63401C98.7975 10.5228 99.0263 11.6528 99.0275 13.0153C99.0275 13.807 98.9492 14.6755 98.7793 15.607C98.3074 18.2033 97.2725 20.4703 95.9403 22.0763L95.9391 22.0786Z" fill="#194BFF" />
							<path d="M110.727 18.8985H123.394L124.563 12.4766H111.896L110.727 18.8985Z" fill="#194BFF" />
							<path d="M108.061 0L102.258 31.866H121.813L123.132 24.623H108.52L111.685 7.24299H126.269L127.587 0H108.061Z" fill="#194BFF" />
						</g>
						<defs><clipPath id="clip0_compare"><rect width="128" height="32" fill="white" /></clipPath></defs>
					</svg>
				</div>
				{/* Desktop navigation - hidden on mobile */}
				<div className="hidden md:flex items-center gap-6 lg:gap-8">
					{siteConfig.header.links.map((link) => (
						<span key={link.label} className="text-gray-600 text-[15px] font-medium whitespace-nowrap">{link.label}</span>
					))}
				</div>
			</div>
			{/* Desktop auth buttons - hidden on mobile */}
			<div className="hidden sm:flex items-center gap-4 lg:gap-6">
				<span className="text-gray-900 font-semibold text-[14px] lg:text-[15px] whitespace-nowrap">{siteConfig.header.auth.signIn}</span>
				<span className="bg-[#05051F] text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-[10px] text-[14px] lg:text-[15px] font-semibold whitespace-nowrap">{siteConfig.header.auth.cta}</span>
			</div>
			{/* Mobile menu button */}
			<button className="sm:hidden flex items-center justify-center w-10 h-10 text-gray-700">
				<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			</button>
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

	const changedSections = useMemo(
		() => getChangedSectionIds(leftVersion.outlines, rightVersion.outlines),
		[leftVersion, rightVersion]
	);

	const comparisonSummary = useMemo(
		() => compareVersions(leftVersion.outlines, rightVersion.outlines),
		[leftVersion, rightVersion]
	);

	/** Collect all sections for a version with their outline context */
	const collectSections = (version: Version) => {
		const result: { outline: any; section: any; sId: string }[] = [];
		for (const outline of version.outlines) {
			for (const section of outline.tree) {
				result.push({ outline, section, sId: section.id ?? section.name ?? "" });
			}
		}
		return result;
	};

	/** Render one side's website content with indicator strip on the inner edge */
	const renderSide = (version: Version, side: "left" | "right") => {
		const color = side === "left"
			? "var(--ax-colors-border-error, #DC2626)"
			: "var(--ax-colors-border-success, #16A34A)";
		const sections = collectSections(version);

		const websiteContent = (
			<Box flex="1" style={{ minWidth: 0 }}>
				{/* Header */}
				<Box bg="bg.default" style={{ borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
					<CompareHeader />
				</Box>
				{/* Sections */}
				<Box p="24" style={{ background: "var(--ax-colors-bg-secondary, #F3F4F6)" }}>
					{sections.map(({ outline, section, sId }, i) => (
						<Box key={sId || i} mb={i < sections.length - 1 ? "24" : "0"}>
							{renderSectionContent(outline, section)}
						</Box>
					))}
				</Box>
				{/* Bottom radius cap */}
				<Box style={{ background: "var(--ax-colors-bg-secondary, #F3F4F6)", borderRadius: "0 0 12px 12px", height: 4 }} />
			</Box>
		);

		const indicatorStrip = (
			<Box display="flex" flexDirection="column" style={{ width: 6, paddingTop: 80 }}>
				{/* Padding top accounts for the header height roughly */}
				{sections.map(({ sId }, i) => {
					const isChanged = changedSections.has(sId);
					return (
						<Box
							key={sId || i}
							flex="1"
							mb={i < sections.length - 1 ? "24" : "0"}
							style={{
								background: isChanged ? color : "transparent",
								borderRadius: 3,
								transition: "background 0.2s",
							}}
						/>
					);
				})}
			</Box>
		);

		return (
			<Box display="flex" flex="1" gap="8" style={{ minWidth: 0 }}>
				{side === "left" ? (
					<>{websiteContent}{indicatorStrip}</>
				) : (
					<>{indicatorStrip}{websiteContent}</>
				)}
			</Box>
		);
	};

	return (
		<Box flex="1" display="flex" flexDirection="column" overflow="hidden">
			{/* Version selectors — fixed header row */}
			<Box display="flex" style={{ borderBottom: "1px solid var(--ax-border-tertiary)" }}>
				<Box flex="1">{renderSelector(leftVersion, onChangeLeft)}</Box>
				<Box flex="1">{renderSelector(rightVersion, onChangeRight)}</Box>
			</Box>

			{/* Comparison Summary */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				py="8"
				px="16"
				style={{ borderBottom: "1px solid var(--ax-border-tertiary)", background: "var(--ax-bg-subtle)" }}
			>
				<Text fontSize="sm" fontWeight="600" color="fg.secondary">
					{formatComparisonSummary(comparisonSummary)}
				</Text>
			</Box>

			{/* Single scroll area for both sides */}
			<Box flex="1" overflow="auto" p="24" style={{ background: CANVAS_BG }}>
				<Box display="flex" alignItems="stretch" gap="0">
					{/* Left */}
					<Box flex="1" style={{ minWidth: 0 }}>
						<PreviewWrapper
							mode={previewMode === "fixed" ? "scale" : "responsive"}
							width={previewMode === "fixed" ? 768 : 1100}
							maxWidth={1100}
							height="auto"
						>
							{renderSide(leftVersion, "left")}
						</PreviewWrapper>
					</Box>

					{/* Center divider */}
					<Box style={{ width: 1, background: "var(--ax-colors-border-default, #9CA3AF)", flexShrink: 0, margin: "0 4px" }} />

					{/* Right */}
					<Box flex="1" style={{ minWidth: 0 }}>
						<PreviewWrapper
							mode={previewMode === "fixed" ? "scale" : "responsive"}
							width={previewMode === "fixed" ? 768 : 1100}
							maxWidth={1100}
							height="auto"
						>
							{renderSide(rightVersion, "right")}
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
	const toast = useToast();

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
			toast.error("Version history not available");
			return;
		}

		// Mark this version as current
		versionHistory.markAsCurrent(version.id);

		// Call the parent's onRestore if provided
		if (onRestore) {
			onRestore(version);
		}

		const versionName = version.customName || version.label;
		toast.success(`Restored version: ${versionName}`);

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
			toast.success(`Deleted version: ${versionName}`);
			// If we deleted the selected version, select another
			if (selectedVersion?.id === deleteDialogVersion.id) {
				const remaining = versions.filter(v => v.id !== deleteDialogVersion.id);
				setSelectedVersion(remaining[0] || null);
			}
		} else {
			toast.error("Cannot delete the current version");
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
			toast.success(`Version renamed to: ${renameInput}`);
		} else {
			toast.success("Version name cleared");
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
