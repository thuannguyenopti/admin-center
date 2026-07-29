"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
	Badge, Box, Button, Heading, LabelMenuButton, Menu, MenuContent, MenuTrigger,
	SegmentedControl, SegmentedControlItem, Text,
} from "@optiaxiom/react";
import {
	IconArrowRight, IconChevronLeft, IconChevronRight, IconEllipsisSolid, IconFile, IconFileLines,
	IconGrid, IconImage, IconList, IconLock, IconSearch, IconThumbtack, IconThumbtackSolid,
} from "@optiaxiom/icons";
import Image from "next/image";
import { Input } from "@/app/components/Input";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const SECTION_HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 16,
	fontWeight: 700,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

type PinnedItem =
	| { type: "artifact"; title: string; image: string; visibility: string; age: string; tags: string[]; initials: string }
	| { type: "action"; priority: string; priorityBg: string; priorityColor: string; title: string; description: string; filename: string; fileType: string; age: string };

const PINNED_ITEMS: PinnedItem[] = [
	{ type: "artifact", title: "Opti sunset", image: "/Sunset.jpg", visibility: "Private", age: "5 days ago", tags: ["Image", "Campaign"], initials: "AS" },
	{ type: "artifact", title: "Mountain image", image: "/nature-bg.png", visibility: "Private", age: "5 days ago", tags: ["Image", "Brand"], initials: "AS" },
	{ type: "action", priority: "Urgent", priorityBg: "var(--ax-colors-bg-error-subtle)", priorityColor: "var(--ax-colors-fg-error)", title: "Team approval needed", description: "Review the updated Q&A article. Approve to proceed to publishing, or request further changes.", filename: "Discover-the-unknown-qa.md", fileType: "GEO Q&A ARTICLE", age: "5 days ago" },
];

type WorkItem = {
	type: "image" | "doc" | "article";
	name: string;
	source: string;
	createdBy: string;
	initials: string;
	visibility: string;
	created: string;
	size: string;
	image?: string;
	tags?: string[];
	priority?: string;
	priorityBg?: string;
	priorityColor?: string;
	description?: string;
	filename?: string;
	fileType?: string;
};

const ALL_WORK: WorkItem[] = [
	{ type: "image",   name: "Daily brief: 6-30-26",         source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/Daily_Brief.png", tags: ["Campaign", "Q3"] },
	{ type: "image",   name: "Mountain image",      source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/nature-bg.png", tags: ["Brand", "2026"] },
	{ type: "image",   name: "Valley image",        source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/nature1.png",   tags: ["Weekly", "Internal"] },
	{ type: "image",   name: "Sunset image",        source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/nature2.png",   tags: ["Weekly", "Brand"] },
	{ type: "article", name: "Q3_Campaign_Brief",  source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", priority: "Urgent",   priorityBg: "var(--ax-colors-bg-error-subtle)", priorityColor: "var(--ax-colors-fg-error)", description: "Review the updated Q3 campaign brief. Approve to proceed to publishing, or request further changes.", filename: "Q3-campaign-brief.md", fileType: "Campaign Brief" },
	{ type: "image",   name: "Weekly wrap: 6/1-6/8", source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/Weekly_Wrap_2.png" },
	{ type: "article", name: "Experiment_Launch",  source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", priority: "No Rush", priorityBg: "var(--ax-colors-bg-secondary)", priorityColor: "var(--ax-colors-fg-secondary)", description: "Experiment 123 has been successfully created and launched. No action needed.", filename: "Experiment-123-launch.md", fileType: "Experiment Summary" },
	{ type: "image",   name: "Mountain view",        source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/MT.png" },
	{ type: "article", name: "Onboarding_Recap",   source: "Yes", createdBy: "Randy", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", priority: "Complete", priorityBg: "var(--ax-colors-bg-success-subtle)", priorityColor: "var(--ax-colors-fg-success-strong)", description: "New hire onboarding recap has been drafted and shared with the People team for final sign-off.", filename: "Onboarding-recap-june.md", fileType: "HR Document" },
];

const TYPE_OPTIONS = ["All", "Image", "Article", "Doc"];
const SOURCE_OPTIONS = ["All", "Yes", "No"];
const VISIBILITY_OPTIONS = ["All", "Private", "Public"];
const CREATED_BY_OPTIONS = ["All", "Ana Shuleva"];

const GAP = 20;

function TypeIcon({ type }: { type: WorkItem["type"] }) {
	const icon = type === "image"
		? <IconImage style={{ width: 14, height: 14 }} />
		: type === "article"
		? <IconFileLines style={{ width: 14, height: 14 }} />
		: <IconFile style={{ width: 14, height: 14 }} />;
	return (
		<Box style={{ width: 28, height: 28, borderRadius: 6, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--ax-colors-fg-secondary)" }}>
			{icon}
		</Box>
	);
}

function Avatar({ initials, src, bg }: { initials?: string; src?: string; bg?: string }) {
	if (src) {
		return (
			<Box style={{ width: 24, height: 24, borderRadius: "50%", background: bg ?? "var(--ax-colors-bg-page)", overflow: "hidden", flexShrink: 0 }}>
				<Image src={src} alt="" width={24} height={24} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
			</Box>
		);
	}
	return (
		<Box style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--ax-colors-bg-avatar-purple)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
			<span style={{ fontFamily: "Roboto Mono, monospace", fontSize: 9, fontWeight: 700, color: "var(--ax-colors-fg-avatar-purple)" }}>{initials}</span>
		</Box>
	);
}

const BTN_STYLE: React.CSSProperties = {
	background: "var(--ax-colors-bg-default)",
	borderColor: "var(--ax-colors-border-secondary)",
	height: 28, width: 28, padding: 0,
};

function PinnedCard({ item, flexBasis, avatarSrc, avatarBg }: { item: PinnedItem; flexBasis: string; avatarSrc?: string; avatarBg?: string }) {
	const [hovered, setHovered] = useState(false);
	const [pinned, setPinned] = useState(true);

	return (
		<Box
			bg="bg.default"
			style={{
				flex: `0 0 ${flexBasis}`, width: flexBasis,
				border: `1px solid ${hovered ? "var(--ax-colors-border-secondary)" : "var(--ax-colors-border-default)"}`,
				borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column",
				cursor: "pointer", transition: "border-color 0.15s", height: 240,
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{item.type === "artifact" ? (
				<>
					{/* Thumbnail with overlay — flex:1 so footer growth compresses it, not card */}
					<Box style={{ flex: 1, position: "relative", overflow: "hidden" }}>
						<Image src={item.image} alt={item.title} fill unoptimized style={{ objectFit: "cover" }} />
						{/* Persistent pin when not hovered */}
						{pinned && !hovered && (
							<Box style={{ position: "absolute", top: 8, left: 8 }} onClick={(e) => e.stopPropagation()}>
								<Button appearance="default" size="sm" aria-label="Unpin" icon={<IconThumbtackSolid style={{ width: 10, height: 10 }} />} style={BTN_STYLE} onClick={() => setPinned(false)} />
							</Box>
						)}
						{/* Hover overlay */}
						<Box style={{
							position: "absolute", inset: 0,
							background: "rgba(0,0,0,0.45)",
							opacity: hovered ? 1 : 0,
							transition: "opacity 0.25s",
							pointerEvents: hovered ? "auto" : "none",
							display: "flex", alignItems: "flex-start", justifyContent: "space-between",
							padding: 8,
						}}>
							<Box onClick={(e) => e.stopPropagation()}>
								<Button appearance="default" size="sm" aria-label={pinned ? "Unpin" : "Pin"} icon={pinned ? <IconThumbtackSolid style={{ width: 10, height: 10 }} /> : <IconThumbtack style={{ width: 10, height: 10 }} />} style={BTN_STYLE} onClick={() => setPinned((p) => !p)} />
							</Box>
							<Box onClick={(e) => e.stopPropagation()}>
								<Button appearance="default" size="sm" aria-label="Options" icon={<IconEllipsisSolid style={{ width: 13, height: 13 }} />} style={BTN_STYLE} />
							</Box>
						</Box>
					</Box>
					{/* Footer — fixed, grows into thumbnail space */}
					<Box
						display="flex"
						flexDirection="column"
						gap="8"
						style={{
							flexShrink: 0,
							borderTop: "1px solid var(--ax-colors-border-tertiary)",
							padding: `10px 14px ${hovered ? 12 : 10}px`,
							transition: "padding 0.25s ease",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Row 1: title + type icon */}
						<Box display="flex" justifyContent="space-between" alignItems="start" gap="8">
							<Text
								fontSize={hovered ? "lg" : "md"}
								color="fg.default"
								style={{
									fontWeight: 600,
									overflow: "hidden",
									textOverflow: hovered ? "clip" : "ellipsis",
									whiteSpace: hovered ? "normal" : "nowrap",
									transition: "font-size 0.2s ease",
									lineHeight: 1.3,
								}}
							>
								{item.title}
							</Text>
							<Box style={{ color: "var(--ax-colors-fg-tertiary)", lineHeight: 0, flexShrink: 0 }}>
								<IconImage style={{ width: 14, height: 14 }} />
							</Box>
						</Box>
						{/* Row 2: lock + visibility + date — always visible */}
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Box display="flex" alignItems="center" gap="4" style={{ color: "var(--ax-colors-fg-tertiary)" }}>
								<IconLock style={{ width: 11, height: 11 }} />
								<Text fontSize="sm" color="fg.tertiary">{item.visibility}</Text>
							</Box>
							<Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>Created {item.age}</Text>
						</Box>
						{/* Row 3: avatar + tags + View → slides in on hover */}
						<Box style={{
							maxHeight: hovered ? 28 : 0,
							opacity: hovered ? 1 : 0,
							overflow: "hidden",
							transition: "max-height 0.25s ease, opacity 0.2s ease",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 6,
						}}>
							<Box display="flex" alignItems="center" gap="6" style={{ overflow: "hidden" }}>
								<Avatar src={avatarSrc} bg={avatarBg} initials={item.initials} />
								{(item.tags ?? []).slice(0, 1).map((tag) => (
									<Badge key={tag} intent="neutral">{tag}</Badge>
								))}
							</Box>
							<Button appearance="subtle" size="sm" addonAfter={<IconArrowRight style={{ width: 12, height: 12 }} />}>View</Button>
						</Box>
					</Box>
				</>
			) : (
				<Box display="flex" flexDirection="column" gap="8" style={{ padding: 16, flex: 1 }}>
					<span style={{ ...CAPTION, fontSize: 9, background: item.priorityBg, color: item.priorityColor, padding: "2px 8px", borderRadius: 32, alignSelf: "flex-start" }}>
						{item.priority}
					</span>
					<Text fontSize="md" color="fg.default" style={{ fontWeight: 600, lineHeight: "1.3" }}>{item.title}</Text>
					<Text fontSize="sm" color="fg.secondary" style={{ flex: 1, lineHeight: "1.5" }}>{item.description}</Text>
					<Box style={{ marginTop: "auto" }}>
						<Text fontSize="sm" color="fg.default" style={{ fontWeight: 500 }}>{item.filename}</Text>
						<Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 4 }}>
							<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)" }}>{item.fileType}</span>
							<Text fontSize="sm" color="fg.tertiary">Created {item.age}</Text>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
}

function GridImageCard({ item, avatarSrc, avatarBg }: { item: WorkItem; avatarSrc?: string; avatarBg?: string }) {
	const [hovered, setHovered] = useState(false);
	const [pinned, setPinned] = useState(false);
	return (
		<Box
			className="vat-work-card"
			bg="bg.default"
			style={{ border: `1px solid ${hovered ? "var(--ax-colors-border-secondary)" : "var(--ax-colors-border-default)"}`, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "border-color 0.15s", height: 240 }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Box style={{ flex: 1, position: "relative", overflow: "hidden" }}>
				<Image src={item.image!} alt={item.name} fill unoptimized style={{ objectFit: "cover" }} />
				{pinned && !hovered && (
					<Box style={{ position: "absolute", top: 8, left: 8 }} onClick={(e) => e.stopPropagation()}>
						<Button appearance="default" size="sm" aria-label="Unpin" icon={<IconThumbtackSolid style={{ width: 10, height: 10 }} />} style={BTN_STYLE} onClick={() => setPinned(false)} />
					</Box>
				)}
				<Box style={{
					position: "absolute", inset: 0,
					background: "rgba(0,0,0,0.45)",
					opacity: hovered ? 1 : 0,
					transition: "opacity 0.25s",
					pointerEvents: hovered ? "auto" : "none",
					display: "flex", alignItems: "flex-start", justifyContent: "space-between",
					padding: 8,
				}}>
					<Box onClick={(e) => e.stopPropagation()}>
						<Button appearance="default" size="sm" aria-label={pinned ? "Unpin" : "Pin"} icon={pinned ? <IconThumbtackSolid style={{ width: 10, height: 10 }} /> : <IconThumbtack style={{ width: 10, height: 10 }} />} style={BTN_STYLE} onClick={() => setPinned((p) => !p)} />
					</Box>
					<Box onClick={(e) => e.stopPropagation()}>
						<Button appearance="default" size="sm" aria-label="Options" icon={<IconEllipsisSolid style={{ width: 13, height: 13 }} />} style={BTN_STYLE} />
					</Box>
				</Box>
			</Box>
			<Box
				display="flex"
				flexDirection="column"
				gap="8"
				style={{
					flexShrink: 0,
					borderTop: "1px solid var(--ax-colors-border-tertiary)",
					padding: `10px 14px ${hovered ? 12 : 10}px`,
					transition: "padding 0.25s ease",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<Box display="flex" justifyContent="space-between" alignItems="start" gap="8">
					<Text
						fontSize={hovered ? "lg" : "md"}
						color="fg.default"
						style={{
							fontWeight: 600,
							overflow: "hidden",
							textOverflow: hovered ? "clip" : "ellipsis",
							whiteSpace: hovered ? "normal" : "nowrap",
							transition: "font-size 0.2s ease",
							lineHeight: 1.3,
						}}
					>
						{item.name}
					</Text>
					<Box style={{ color: "var(--ax-colors-fg-tertiary)", lineHeight: 0, flexShrink: 0 }}>
						<IconImage style={{ width: 14, height: 14 }} />
					</Box>
				</Box>
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Box display="flex" alignItems="center" gap="4" style={{ color: "var(--ax-colors-fg-tertiary)" }}>
						<IconLock style={{ width: 11, height: 11 }} />
						<Text fontSize="sm" color="fg.tertiary">{item.visibility}</Text>
					</Box>
					<Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>{item.created}</Text>
				</Box>
				<Box style={{
					maxHeight: hovered ? 28 : 0,
					opacity: hovered ? 1 : 0,
					overflow: "hidden",
					transition: "max-height 0.25s ease, opacity 0.2s ease",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 6,
				}}>
					<Box display="flex" alignItems="center" gap="6" style={{ overflow: "hidden" }}>
						<Avatar src={avatarSrc} bg={avatarBg} initials={item.initials} />
						{(item.tags ?? []).slice(0, 1).map((tag) => (
							<Badge key={tag} intent="neutral">{tag}</Badge>
						))}
					</Box>
					<Button appearance="subtle" size="sm" addonAfter={<IconArrowRight style={{ width: 12, height: 12 }} />}>View</Button>
				</Box>
			</Box>
		</Box>
	);
}

export default function VATWorkPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [view, setView] = useState<"list" | "grid">("list");
	const [query, setQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("All");
	const [sourceFilter, setSourceFilter] = useState("All");
	const [visibilityFilter, setVisibilityFilter] = useState("All");
	const [createdByFilter, setCreatedByFilter] = useState("All");
	const [carouselPage, setCarouselPage] = useState(0);
	const [cardWidth, setCardWidth] = useState(0);
	const carouselRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = carouselRef.current;
		if (!el) return;
		const measure = () => setCardWidth(Math.floor((el.offsetWidth - GAP * 2) / 3));
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const totalPinnedPages = Math.ceil(PINNED_ITEMS.length / 3);
	const canGoBack = carouselPage > 0;
	const canGoForward = carouselPage < totalPinnedPages - 1;
	const translateX = cardWidth > 0 ? -(carouselPage * 3 * (cardWidth + GAP)) : 0;
	const flexBasis = cardWidth > 0 ? `${cardWidth}px` : `calc((100% - ${GAP * 2}px) / 3)`;

	const filtered = ALL_WORK.filter((w) => {
		if (query && !w.name.toLowerCase().includes(query.toLowerCase())) return false;
		if (typeFilter !== "All" && w.type !== typeFilter.toLowerCase()) return false;
		if (sourceFilter !== "All" && w.source !== sourceFilter) return false;
		if (visibilityFilter !== "All" && w.visibility !== visibilityFilter) return false;
		if (createdByFilter !== "All" && w.createdBy !== createdByFilter) return false;
		return true;
	});

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">Work</Heading>
			<Text color="fg.secondary" fontSize="md" mb="32">
				A running record of everything {name} has produced.
			</Text>

			{/* Pinned section */}
			<Box mb="40">
				<Box display="flex" alignItems="center" justifyContent="space-between" mb="4">
					<Text style={SECTION_HEADING}>Pinned</Text>
					<Box display="flex" alignItems="center" gap="8">
						<Button appearance="subtle" size="sm">See all</Button>
						<Button appearance="subtle" size="sm" icon={<IconChevronLeft />} disabled={!canGoBack} aria-label="Previous" onClick={() => setCarouselPage((p) => p - 1)} />
						<Button appearance="subtle" size="sm" icon={<IconChevronRight />} disabled={!canGoForward} aria-label="Next" onClick={() => setCarouselPage((p) => p + 1)} />
					</Box>
				</Box>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					Work your chief of staff has completed that you have pinned
				</Text>
				<Box ref={carouselRef} style={{ overflow: "hidden" }}>
					<Box style={{ display: "flex", gap: GAP, transform: `translateX(${translateX}px)`, transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)" }}>
						{PINNED_ITEMS.map((item) => (
							<PinnedCard key={item.title} item={item} flexBasis={flexBasis} avatarSrc={vau?.avatar} avatarBg={vau?.avatarBg} />
						))}
					</Box>
				</Box>
			</Box>

			{/* All work section */}
			<Box>
				<Text style={SECTION_HEADING} mb="4">All work</Text>
				<Text color="fg.secondary" fontSize="sm" mb="16">
					Everything your chief of staff has done
				</Text>

				{/* Filters row */}
				<Box display="flex" alignItems="center" gap="8" mb="24">
					<Box style={{ width: 240 }}>
						<Input
							placeholder="Search name"
							addonBefore={<IconSearch />}
							value={query}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
						/>
					</Box>
					<Menu options={TYPE_OPTIONS.map((o) => ({ label: o, onClick: () => setTypeFilter(o) }))}>
						<MenuTrigger asChild><LabelMenuButton label="TYPE">{typeFilter}</LabelMenuButton></MenuTrigger>
						<MenuContent />
					</Menu>
					<Menu options={SOURCE_OPTIONS.map((o) => ({ label: o, onClick: () => setSourceFilter(o) }))}>
						<MenuTrigger asChild><LabelMenuButton label="SOURCE">{sourceFilter}</LabelMenuButton></MenuTrigger>
						<MenuContent />
					</Menu>
					<Menu options={VISIBILITY_OPTIONS.map((o) => ({ label: o, onClick: () => setVisibilityFilter(o) }))}>
						<MenuTrigger asChild><LabelMenuButton label="VISIBILITY">{visibilityFilter}</LabelMenuButton></MenuTrigger>
						<MenuContent />
					</Menu>
					<Menu options={CREATED_BY_OPTIONS.map((o) => ({ label: o, onClick: () => setCreatedByFilter(o) }))}>
						<MenuTrigger asChild><LabelMenuButton label="CREATED BY">{createdByFilter}</LabelMenuButton></MenuTrigger>
						<MenuContent />
					</Menu>
					<Box style={{ flex: 1 }} />
					<SegmentedControl
						value={view}
						onValueChange={(v: string) => { if (v) setView(v as "list" | "grid"); }}
					>
						<SegmentedControlItem value="list" icon={<IconList size={15} />} aria-label="List view" />
						<SegmentedControlItem value="grid" icon={<IconGrid size={15} />} aria-label="Grid view" />
					</SegmentedControl>
				</Box>

				{/* List view */}
				{view === "list" && (
					<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden" }}>
						<Box display="flex" alignItems="center" style={{ padding: "10px 16px", borderBottom: "1px solid var(--ax-colors-border-secondary)", background: "var(--ax-colors-bg-secondary)" }}>
							<Box style={{ width: 44 }} />
							<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)", flex: 1 }}>Name</span>
							<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)", width: 80 }}>Source</span>
							<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)", width: 160 }}>Created By</span>
							<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)", width: 90 }}>Visibility</span>
							<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)", width: 130 }}>Created ↓</span>
							<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)", width: 60 }}>Size</span>
							<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)", width: 40 }}>Actions</span>
						</Box>
						{filtered.map((item, i) => (
							<Box
								key={`${item.name}-${i}`}
								className="vat-work-row"
								display="flex"
								alignItems="center"
								style={{
									padding: "12px 16px",
									borderBottom: i < filtered.length - 1 ? "1px solid var(--ax-colors-border-secondary)" : "none",
									cursor: "pointer",
								}}
							>
								<Box style={{ width: 44 }}>
									<TypeIcon type={item.type} />
								</Box>
								<Text fontSize="md" color="fg.default" style={{ fontWeight: 500, flex: 1 }}>{item.name}</Text>
								<Text fontSize="sm" color="fg.secondary" style={{ width: 80 }}>{item.source}</Text>
								<Box display="flex" alignItems="center" gap="6" style={{ width: 160 }}>
									<Avatar src={vau?.avatar} bg={vau?.avatarBg} initials={item.initials} />
									<Text fontSize="sm" color="fg.secondary">{item.createdBy}</Text>
								</Box>
								<Text fontSize="sm" color="fg.secondary" style={{ width: 90 }}>{item.visibility}</Text>
								<Text fontSize="sm" color="fg.secondary" style={{ width: 130 }}>{item.created}</Text>
								<Text fontSize="sm" color="fg.secondary" style={{ width: 60 }}>{item.size}</Text>
								<Box style={{ width: 40 }}>
									<Text fontSize="sm" color="fg.tertiary" style={{ letterSpacing: 2 }}>···</Text>
								</Box>
							</Box>
						))}
					</Box>
				)}

				{/* Grid view */}
				{view === "grid" && (
					<Box style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: GAP }}>
						{filtered.map((item, i) => item.priority ? (
							<Box
								key={`${item.name}-${i}`}
								className="vat-work-card"
								bg="bg.default"
								style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }}
							>
								<Box display="flex" flexDirection="column" gap="8" style={{ padding: 16, flex: 1 }}>
									<span style={{ ...CAPTION, fontSize: 9, background: item.priorityBg, color: item.priorityColor, padding: "2px 8px", borderRadius: 32, alignSelf: "flex-start" }}>
										{item.priority}
									</span>
									<Text fontSize="md" color="fg.default" style={{ fontWeight: 600, lineHeight: "1.3" }}>{item.name.replace(/_/g, " ")}</Text>
									<Text fontSize="sm" color="fg.secondary" style={{ flex: 1, lineHeight: "1.5" }}>{item.description}</Text>
									<Box style={{ marginTop: "auto" }}>
										<Text fontSize="sm" color="fg.default" style={{ fontWeight: 500 }}>{item.filename}</Text>
										<Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 4 }}>
											<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-tertiary)" }}>{item.fileType}</span>
											<Text fontSize="sm" color="fg.tertiary">{item.created}</Text>
										</Box>
									</Box>
								</Box>
							</Box>
						) : (
							<GridImageCard key={`${item.name}-${i}`} item={item} avatarSrc={vau?.avatar} avatarBg={vau?.avatarBg} />
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
}
