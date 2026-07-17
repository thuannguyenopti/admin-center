"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Box, Checkbox, Menu, MenuContent, MenuTrigger, SearchInput, Separator, toaster } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { Table, Td, Th, Tr } from "@/app/components/Table";
import {
	IconArrowDown,
	IconChevronRight,
	IconEllipsisSolid as IconMore,
	IconFilter,
	IconGrid,
	IconGridDividers,
	IconLink,
	IconList,
} from "@optimizely/axiom-icons";
import type { DropZoneLink } from "@/app/dam/drop-zone/data";
import { getAllSubmissions, getSubmissionsForZone, setSubmissionStatus, subscribeSubmissions } from "@/app/dam/drop-zone/submissions";
import { DropZoneFilterPanel, type DropZoneFilterSection } from "./DropZoneFilterPanel";
import { DropZoneSubmissionCard, SUBMISSION_STATUS_BADGE } from "./DropZoneSubmissionCard";
import { DropZoneUploadTile } from "./DropZoneUploadTile";
import { ShareLinkSettingsDialog } from "./ShareLinkSettingsDialog";

type ViewMode = "cards" | "grid" | "table";
type SortKey = "newest" | "oldest" | "name-asc" | "name-desc";

const SORT_LABEL: Record<SortKey, string> = {
	newest: "Newest",
	oldest: "Oldest",
	"name-asc": "Submitter A–Z",
	"name-desc": "Submitter Z–A",
};

function fileExtension(name: string) {
	return (name.split(".").pop() ?? "").toUpperCase();
}

/**
 * A single Drop Zone's submissions, restructured to match Collections' own detail-page
 * anatomy element-for-element: breadcrumb + "•••" overflow menu, a large editorial header
 * (title, count/date line, inline Copy link, Add a description), a divider, then a
 * Filters sidebar beside the toolbar+grid. Master-detail sibling to DropZonesView's list,
 * same in-page swap pattern AssetFocusViewer already uses (no new route).
 */
export function DropZoneDetailView({ zone, onBack }: { zone: DropZoneLink; onBack: () => void }) {
	useSyncExternalStore(subscribeSubmissions, getAllSubmissions, getAllSubmissions);
	const [search, setSearch] = useState("");
	const [view, setView] = useState<ViewMode>("cards");
	const [sortKey, setSortKey] = useState<SortKey>("newest");
	const [showFilters, setShowFilters] = useState(true);
	const [filterSelected, setFilterSelected] = useState<Set<string>>(new Set());
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [shareOpen, setShareOpen] = useState(false);

	const submissions = getSubmissionsForZone(zone.id);

	const fileTypes = useMemo(
		() => Array.from(new Set(submissions.flatMap((submission) => submission.files.map((file) => fileExtension(file.name))))).sort(),
		[submissions],
	);
	const filterSections: DropZoneFilterSection[] = [
		{ id: "status", title: "Status", items: ["Pending", "Approved", "Rejected"] },
		{ id: "filetype", title: "File type", items: fileTypes },
	];

	function toggleFilterValue(value: string) {
		setFilterSelected((current) => {
			const next = new Set(current);
			if (next.has(value)) next.delete(value);
			else next.add(value);
			return next;
		});
	}

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		const statusFilters = Array.from(filterSelected).filter((v) => v.startsWith("status:")).map((v) => v.split(":")[1].toLowerCase());
		const typeFilters = Array.from(filterSelected).filter((v) => v.startsWith("filetype:")).map((v) => v.split(":")[1]);

		return submissions.filter((submission) => {
			if (query && !submission.submitterName.toLowerCase().includes(query) && !submission.files.some((file) => file.name.toLowerCase().includes(query))) return false;
			if (statusFilters.length > 0 && !statusFilters.includes(submission.status)) return false;
			if (typeFilters.length > 0 && !submission.files.some((file) => typeFilters.includes(fileExtension(file.name)))) return false;
			return true;
		});
	}, [submissions, search, filterSelected]);

	const sorted = useMemo(() => {
		const rows = [...filtered];
		rows.sort((a, b) => {
			if (sortKey === "name-asc") return a.submitterName.localeCompare(b.submitterName);
			if (sortKey === "name-desc") return b.submitterName.localeCompare(a.submitterName);
			// Mock timestamps are relative strings ("2 hours ago"), not real dates — the
			// array's own insertion order already reflects recency (newest submissions are
			// prepended by addSubmission), so "newest"/"oldest" just reads that order as-is
			// or reversed rather than parsing display strings.
			return 0;
		});
		return sortKey === "oldest" ? rows.reverse() : rows;
	}, [filtered, sortKey]);

	const allSelected = sorted.length > 0 && sorted.every((submission) => selected.has(submission.id));

	function toggleSelectAll() {
		setSelected(allSelected ? new Set() : new Set(sorted.map((submission) => submission.id)));
	}

	function toggleSelect(id: string) {
		setSelected((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function bulkSetStatus(status: "approved" | "rejected") {
		selected.forEach((id) => setSubmissionStatus(id, status));
		setSelected(new Set());
	}

	function copyLink() {
		navigator.clipboard?.writeText(`${window.location.origin}/dam/drop-zone/${zone.token}`);
		toaster.create("Link copied to clipboard", { intent: "success" });
	}

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<Box alignItems="center" display="flex" gap="6" justifyContent="space-between">
				<Box alignItems="center" display="flex" gap="6">
					<Button appearance="subtle" size="sm" onClick={onBack}>Drop Zones</Button>
					<IconChevronRight size={12} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
					<Text color="fg.secondary" fontSize="sm">{zone.name}</Text>
				</Box>
				<Menu
					options={[
						{ label: "Settings", disabledReason: "Coming soon" },
						{ label: "Public Link", execute: () => setShareOpen(true) },
						{ label: "Copy embed code", disabledReason: "Not applicable to Drop Zones" },
						{ label: "Add cover photo", disabledReason: "Not applicable to Drop Zones" },
					]}
				>
					<MenuTrigger asChild>
						<Button appearance="subtle" aria-label="More options" icon={<IconMore size={16} />} size="sm" />
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>

			<Box alignItems="center" display="flex" flexDirection="column" gap="8" style={{ textAlign: "center" }}>
				<Text color="fg.default" fontSize="2xl" fontWeight="700">{zone.name}</Text>
				<Box alignItems="center" display="flex" gap="16" justifyContent="center">
					<Text color="fg.secondary" fontSize="sm">
						{submissions.length} submission{submissions.length === 1 ? "" : "s"} · {zone.status === "active" ? "Active" : "Expired"}
					</Text>
					<Button appearance="subtle" icon={<IconLink size={13} />} iconPosition="start" size="sm" style={{ color: "var(--ax-colors-fg-success)" }} onClick={copyLink}>
						Copy Public Link
					</Button>
				</Box>
				<Button
					appearance="subtle"
					size="sm"
					style={{ alignSelf: "center", color: "var(--ax-colors-fg-success)" }}
					onClick={() => toaster.create("Description editing coming soon", { intent: "information" })}
				>
					Add a description
				</Button>
			</Box>

			<Separator />

			<Box display="flex" gap="20">
				{showFilters && <DropZoneFilterPanel sections={filterSections} selected={filterSelected} onToggleValue={toggleFilterValue} />}

				<Box display="flex" flexDirection="column" gap="16" style={{ flex: 1, minWidth: 0 }}>
					<Box alignItems="center" display="flex" gap="8" justifyContent="space-between" style={{ flexWrap: "wrap" }}>
						<Box alignItems="center" display="flex" gap="8">
							<Button
								appearance={showFilters ? "primary" : "default"}
								aria-label="Toggle filters"
								aria-pressed={showFilters}
								icon={<IconFilter size={14} />}
								size="md"
								onClick={() => setShowFilters((v) => !v)}
							/>
							<Box alignItems="center" display="flex" gap="8">
								<Checkbox checked={allSelected} aria-label="Select all submissions" onCheckedChange={toggleSelectAll} />
								<Text color="fg.secondary" fontSize="sm">Select All</Text>
							</Box>
							<Box style={{ width: 220 }}>
								<SearchInput placeholder="Search submissions" size="md" value={search} onChange={(event) => setSearch(event.target.value)} />
							</Box>
							<Menu
								options={(Object.keys(SORT_LABEL) as SortKey[]).map((key) => ({
									label: SORT_LABEL[key],
									execute: () => setSortKey(key),
									...(sortKey === key && { selected: true }),
								}))}
							>
								<MenuTrigger asChild>
									<Button appearance="default" size="md">{SORT_LABEL[sortKey]}</Button>
								</MenuTrigger>
								<MenuContent />
							</Menu>
							<Button
								appearance="subtle"
								aria-label="Reverse sort order"
								icon={<IconArrowDown size={14} />}
								size="md"
								onClick={() => setSortKey((key) => (key === "newest" ? "oldest" : key === "oldest" ? "newest" : key))}
							/>
						</Box>
						<Box alignItems="center" display="flex" gap="2">
							<Button appearance={view === "cards" ? "default" : "subtle"} aria-label="Card view" aria-pressed={view === "cards"} icon={<IconGridDividers size={16} />} size="md" onClick={() => setView("cards")} />
							<Button appearance={view === "table" ? "default" : "subtle"} aria-label="List view" aria-pressed={view === "table"} icon={<IconList size={16} />} size="md" onClick={() => setView("table")} />
							<Button appearance={view === "grid" ? "default" : "subtle"} aria-label="Grid view" aria-pressed={view === "grid"} icon={<IconGrid size={16} />} size="md" onClick={() => setView("grid")} />
						</Box>
					</Box>

					{selected.size > 0 && (
						<Box alignItems="center" bg="bg.accent.subtle" display="flex" gap="12" justifyContent="space-between" px="16" py="10" rounded="md">
							<Text color="fg.default" fontSize="sm" fontWeight="500">{selected.size} selected</Text>
							<Box display="flex" gap="8">
								<Button appearance="subtle" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
								<Button appearance="subtle" size="sm" style={{ color: "var(--ax-colors-fg-error)" }} onClick={() => bulkSetStatus("rejected")}>Reject</Button>
								<Button appearance="primary" size="sm" onClick={() => bulkSetStatus("approved")}>Approve</Button>
							</Box>
						</Box>
					)}

					{sorted.length === 0 ? (
						<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" p="48" rounded="lg">
							<Text color="fg.secondary" fontSize="md">No submissions match this search.</Text>
						</Box>
					) : view === "table" ? (
						<Table>
							<thead>
								<Tr>
									<Th />
									<Th>Submitted by</Th>
									<Th>Files</Th>
									<Th>Date</Th>
									<Th>Status</Th>
									<Th />
								</Tr>
							</thead>
							<tbody>
								{sorted.map((submission) => {
									const badge = SUBMISSION_STATUS_BADGE[submission.status];
									return (
										<Tr key={submission.id}>
											<Td style={{ verticalAlign: "middle", width: 40 }}>
												<Checkbox checked={selected.has(submission.id)} aria-label={`Select submission from ${submission.submitterName}`} onCheckedChange={() => toggleSelect(submission.id)} />
											</Td>
											<Td description={submission.submitterEmail} type="header">{submission.submitterName}</Td>
											<Td><Text color="fg.secondary" fontSize="sm">{submission.files.map((file) => file.name).join(", ")}</Text></Td>
											<Td><Text color="fg.secondary" fontSize="sm">{submission.submittedAt}</Text></Td>
											<Td data={badge.intent} type="badge">{badge.label}</Td>
											<Td type="button">
												{submission.status === "pending" && (
													<Box display="flex" gap="4" justifyContent="flex-end">
														<Button appearance="subtle" size="sm" style={{ color: "var(--ax-colors-fg-error)" }} onClick={() => setSubmissionStatus(submission.id, "rejected")}>Reject</Button>
														<Button appearance="primary" size="sm" onClick={() => setSubmissionStatus(submission.id, "approved")}>Approve</Button>
													</Box>
												)}
											</Td>
										</Tr>
									);
								})}
							</tbody>
						</Table>
					) : (
						<Box display="grid" gap="16" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
							<DropZoneUploadTile zone={zone} />
							{sorted.map((submission) => (
								<DropZoneSubmissionCard
									key={submission.id}
									selected={selected.has(submission.id)}
									submission={submission}
									onApprove={() => setSubmissionStatus(submission.id, "approved")}
									onReject={() => setSubmissionStatus(submission.id, "rejected")}
									onToggleSelect={() => toggleSelect(submission.id)}
								/>
							))}
						</Box>
					)}
				</Box>
			</Box>

			<ShareLinkSettingsDialog open={shareOpen} zone={zone} onClose={() => setShareOpen(false)} />
		</Box>
	);
}
