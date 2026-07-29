"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Box, SearchInput } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { Table, Td, Th, Tr } from "@/app/components/Table";
import { IconArrowUpRightFromSquare as IconExternalLink, IconCheck, IconCopy, IconPlus, IconShareNodes as IconShare } from "@optimizely/axiom-icons";
import type { DropZoneLink } from "@/app/dam/drop-zone/data";
import { getAllDropZones, subscribeDropZones } from "@/app/dam/drop-zone/dropZones";
import { getAllSubmissions, getSubmissionsForZone, subscribeSubmissions } from "@/app/dam/drop-zone/submissions";
import { DropZoneDetailView } from "./DropZoneDetailView";
import { ShareLinkSettingsDialog } from "./ShareLinkSettingsDialog";

type SortKey = "name" | "status" | "submissionCount" | "expiresAt";
type SortDirection = "asc" | "desc";

function compareRows(a: DropZoneLink, b: DropZoneLink, key: SortKey, counts: Record<string, number>) {
	if (key === "submissionCount") return counts[a.id] - counts[b.id];
	return String(a[key]).localeCompare(String(b[key]));
}

/** Drop Zones list — the "Collections, but for external upload links" view requested for Assets Review. Opening a zone swaps in DropZoneDetailView (master-detail, same in-page pattern AssetFocusViewer uses) to show who uploaded what into it. */
export function DropZonesView() {
	const router = useRouter();
	useSyncExternalStore(subscribeSubmissions, getAllSubmissions, getAllSubmissions);
	const dropZones = useSyncExternalStore(subscribeDropZones, getAllDropZones, getAllDropZones);
	const [search, setSearch] = useState("");
	const [sortKey, setSortKey] = useState<SortKey>("expiresAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [openZone, setOpenZone] = useState<DropZoneLink | null>(null);
	const [shareZone, setShareZone] = useState<DropZoneLink | null>(null);

	// Recomputed on every render rather than memoized — the useSyncExternalStore subscriptions
	// above already re-render this component whenever a zone or submission changes, and this
	// is a small mock list, so there's no meaningful cost to just reading it fresh.
	const counts: Record<string, number> = Object.fromEntries(
		dropZones.map((zone) => [zone.id, getSubmissionsForZone(zone.id).length]),
	);

	const handleSort = (key: SortKey) => {
		if (key === sortKey) {
			setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDirection("asc");
		}
	};

	const rows = useMemo(() => {
		const filtered = dropZones.filter(
			(link) => !search.trim() || link.name.toLowerCase().includes(search.trim().toLowerCase()),
		);
		const sorted = [...filtered].sort((a, b) => compareRows(a, b, sortKey, counts));
		return sortDirection === "asc" ? sorted : sorted.reverse();
	}, [dropZones, search, sortKey, sortDirection, counts]);

	function copyLink(link: DropZoneLink) {
		const url = `${window.location.origin}/dam/drop-zone/${link.token}`;
		navigator.clipboard?.writeText(url);
		setCopiedId(link.id);
		setTimeout(() => setCopiedId((current) => (current === link.id ? null : current)), 1500);
	}

	if (openZone) {
		return <DropZoneDetailView zone={openZone} onBack={() => setOpenZone(null)} />;
	}

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
				<Box style={{ width: 240 }}>
					<SearchInput placeholder="Search Drop Zones" size="md" value={search} onChange={(event) => setSearch(event.target.value)} />
				</Box>
				<Button appearance="primary" icon={<IconPlus size={16} />} size="md" onClick={() => router.push("/dam/drop-zone/new")}>
					New Drop Zone
				</Button>
			</Box>

			{rows.length === 0 ? (
				<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" p="48" rounded="lg">
					<Text color="fg.secondary" fontSize="md">No Drop Zones match this search.</Text>
				</Box>
			) : (
				<Table>
					<thead>
						<Tr>
							<Th sortDirection={sortKey === "name" ? sortDirection : null} onSort={() => handleSort("name")}>Name</Th>
							<Th sortDirection={sortKey === "status" ? sortDirection : null} onSort={() => handleSort("status")}>Status</Th>
							<Th sortDirection={sortKey === "submissionCount" ? sortDirection : null} onSort={() => handleSort("submissionCount")}>Submissions</Th>
							<Th sortDirection={sortKey === "expiresAt" ? sortDirection : null} onSort={() => handleSort("expiresAt")}>Expires</Th>
							<Th />
						</Tr>
					</thead>
					<tbody>
						{rows.map((link) => (
							<Tr key={link.id} onClick={() => setOpenZone(link)}>
								<Td description={link.campaign} type="header">{link.name}</Td>
								<Td data={link.status === "active" ? "success" : "neutral"} type="badge">
									{link.status === "active" ? "Active" : "Expired"}
								</Td>
								<Td type="numeric">{counts[link.id] ?? 0}</Td>
								<Td><Text color="fg.secondary" fontSize="sm">{link.expiresAt}</Text></Td>
								<Td type="button">
									<Box display="flex" gap="4" justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
										<Button
											appearance="subtle"
											icon={copiedId === link.id ? <IconCheck size={14} /> : <IconCopy size={14} />}
											size="sm"
											onClick={() => copyLink(link)}
										>
											{copiedId === link.id ? "Copied" : "Copy link"}
										</Button>
										<Button
											appearance="subtle"
											aria-label="Share settings"
											icon={<IconShare size={14} />}
											size="sm"
											onClick={() => setShareZone(link)}
										/>
										<Button
											appearance="subtle"
											aria-label="View live"
											icon={<IconExternalLink size={14} />}
											size="sm"
											onClick={() => window.open(`/dam/drop-zone/${link.token}`, "_blank", "noopener,noreferrer")}
										/>
									</Box>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			)}

			{shareZone && <ShareLinkSettingsDialog open={!!shareZone} zone={shareZone} onClose={() => setShareZone(null)} />}
		</Box>
	);
}
