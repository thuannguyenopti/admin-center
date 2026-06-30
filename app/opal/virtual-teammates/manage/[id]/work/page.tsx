"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
	Box, Button, Heading, LabelMenuButton, Menu, MenuContent, MenuTrigger,
	SegmentedControl, SegmentedControlItem, Text,
} from "@optiaxiom/react";
import {
	IconChevronLeft, IconChevronRight, IconFile, IconFileLines,
	IconGrid, IconImage, IconList, IconLock, IconSearch,
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
	| { type: "artifact"; title: string; image: string; visibility: string; age: string }
	| { type: "action"; priority: string; priorityBg: string; priorityColor: string; title: string; description: string; filename: string; fileType: string; age: string };

const PINNED_ITEMS: PinnedItem[] = [
	{ type: "artifact", title: "Sunset", image: "/Sunset.jpg", visibility: "Private", age: "5 days ago" },
	{ type: "artifact", title: "Mountain", image: "/nature-bg.png", visibility: "Private", age: "5 days ago" },
	{ type: "action", priority: "Urgent", priorityBg: "#FAD9E7", priorityColor: "#8B1A3A", title: "Team approval needed", description: "Review the updated Q&A article. Approve to proceed to publishing, or request further changes.", filename: "Discover-the-unknown-qa.md", fileType: "GEO Q&A ARTICLE", age: "5 days ago" },
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
	priority?: string;
	priorityBg?: string;
	priorityColor?: string;
	description?: string;
};

const ALL_WORK: WorkItem[] = [
	{ type: "image",   name: "Daily_Brief",       source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/Sunset.jpg" },
	{ type: "image",   name: "Meeting_Prep",       source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/nature-bg.png" },
	{ type: "image",   name: "Weekly_Wrap",        source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/nature1.png" },
	{ type: "image",   name: "Weekly_Wrap",        source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/nature2.png" },
	{ type: "article", name: "Q3_Campaign_Brief",  source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", priority: "Urgent",   priorityBg: "#FAD9E7", priorityColor: "#8B1A3A", description: "Team approval needed — review before publishing." },
	{ type: "image",   name: "Weekly_Wrap",        source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/Sunset.jpg" },
	{ type: "article", name: "Experiment_Launch",  source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", priority: "No Rush", priorityBg: "var(--ax-colors-bg-secondary)", priorityColor: "var(--ax-colors-fg-secondary)", description: "Testing experiment 123 has been successfully created and launched." },
	{ type: "image",   name: "Weekly_Wrap",        source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", image: "/nature-bg.png" },
	{ type: "article", name: "Experiment_Launch",  source: "Yes", createdBy: "Ana Shuleva", initials: "AS", visibility: "Private", created: "June 24, 2026", size: "3 KB", priority: "No Rush", priorityBg: "var(--ax-colors-bg-secondary)", priorityColor: "var(--ax-colors-fg-secondary)", description: "Testing experiment 1 has been successfully created and launched." },
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

function Avatar({ initials }: { initials: string }) {
	return (
		<Box style={{ width: 24, height: 24, borderRadius: "50%", background: "#C4B5FD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
			<span style={{ fontFamily: "Roboto Mono, monospace", fontSize: 9, fontWeight: 700, color: "#4C1D95" }}>{initials}</span>
		</Box>
	);
}

function PinnedCard({ item, flexBasis }: { item: PinnedItem; flexBasis: string }) {
	return (
		<Box className="vat-work-card" bg="bg.default" style={{ flex: `0 0 ${flexBasis}`, width: flexBasis, border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }}>
			{item.type === "artifact" ? (
				<>
					<Box style={{ width: "100%", height: 150, position: "relative", flexShrink: 0 }}>
						<Image src={item.image} alt={item.title} fill unoptimized style={{ objectFit: "cover" }} />
					</Box>
					<Box display="flex" alignItems="center" justifyContent="space-between" style={{ padding: "10px 14px 12px" }}>
						<Box>
							<Text fontSize="md" color="fg.default" style={{ fontWeight: 600 }}>{item.title}</Text>
							<Box display="flex" alignItems="center" gap="4" style={{ marginTop: 4, color: "var(--ax-colors-fg-tertiary)" }}>
								<IconLock style={{ width: 12, height: 12 }} />
								<Text fontSize="sm" color="fg.tertiary">{item.visibility}</Text>
							</Box>
						</Box>
						<Box style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, color: "var(--ax-colors-fg-tertiary)" }}>
							<IconImage style={{ width: 14, height: 14 }} />
							<Text fontSize="sm" color="fg.tertiary">Created {item.age}</Text>
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
							<PinnedCard key={item.title} item={item} flexBasis={flexBasis} />
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
									<Avatar initials={item.initials} />
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
						{filtered.map((item, i) => (
							<Box
								key={`${item.name}-${i}`}
								className="vat-work-card"
								bg="bg.default"
								style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }}
							>
								{item.image ? (
									<Box style={{ width: "100%", height: 160, position: "relative", flexShrink: 0 }}>
										<Image src={item.image} alt={item.name} fill unoptimized style={{ objectFit: "cover" }} />
									</Box>
								) : (
									<Box style={{ width: "100%", height: 160, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "flex-start", justifyContent: "flex-start", padding: 16, flexShrink: 0 }}>
										{item.priority && (
											<span style={{ ...CAPTION, fontSize: 9, background: item.priorityBg, color: item.priorityColor, padding: "3px 10px", borderRadius: 32 }}>
												{item.priority}
											</span>
										)}
									</Box>
								)}
								<Box style={{ padding: "12px 14px" }}>
									<Text fontSize="md" color="fg.default" style={{ fontWeight: 600 }}>{item.name}</Text>
									{item.description && (
										<Text fontSize="sm" color="fg.secondary" style={{ marginTop: 4, lineHeight: "1.4" }}>{item.description}</Text>
									)}
									<Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 8 }}>
										<Box display="flex" alignItems="center" gap="4" style={{ color: "var(--ax-colors-fg-tertiary)" }}>
											<IconLock style={{ width: 11, height: 11 }} />
											<Text fontSize="sm" color="fg.tertiary">{item.visibility}</Text>
										</Box>
										<Text fontSize="sm" color="fg.tertiary">{item.created}</Text>
									</Box>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
}
