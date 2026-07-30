"use client";

import { useMemo, useState } from "react";
import {
	Box,
	Button,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Text,
} from "@optiaxiom/react";
import { AssetFilterPanel } from "../assets/AssetFilterPanel";
import { peopleItems } from "./data";
import { BatchMatchPanel } from "./BatchMatchPanel";
import { PeopleBulkNamePanel } from "./PeopleBulkNamePanel";
import { PeopleGrid } from "./PeopleGrid";
import { PeopleToolbar } from "./PeopleToolbar";
import { RecognitionSnapshot } from "./RecognitionSnapshot";
import type { PersonItem } from "./types";

type Props = {
	onOpenProfile?: (person: PersonItem) => void;
	onOpenUnknownInbox?: () => void;
	hideToolbar?: boolean;
	externalSearch?: string;
};

export function PeopleTab({ onOpenProfile, onOpenUnknownInbox, hideToolbar, externalSearch }: Props) {
	const [internalSearch, setInternalSearch] = useState("");
	const search = externalSearch ?? internalSearch;
	const [showFilters, setShowFilters] = useState(false);
	const [peopleView, setPeopleView] = useState<"named" | "unnamed">("named");
	const [selectedUnnamedIds, setSelectedUnnamedIds] = useState<Set<string>>(() => new Set());
	const [bulkName, setBulkName] = useState("");
	const [batchMatchName, setBatchMatchName] = useState<string | null>(null);

	// ── Inline naming ───────────────────────────────────────────────────
	// confirmedNames: unnamed id → new name (card moves to Named section)
	const [confirmedNames, setConfirmedNames] = useState<Record<string, string>>({});

	const handleConfirmName = (id: string, name: string) => {
		const trimmed = name.trim();
		setConfirmedNames((prev) => ({ ...prev, [id]: trimmed }));
		setSelectedUnnamedIds((current) => {
			const next = new Set(current);
			next.delete(id);
			return next;
		});
		setBatchMatchName(trimmed);
	};

	// ── Drag-to-merge ────────────────────────────────────────────────────
	// mergedInto: unnamed id → named id (card disappears, named count += assets)
	const [draggedId, setDraggedId] = useState<string | null>(null);
	const [dragTargetId, setDragTargetId] = useState<string | null>(null);
	const [mergedInto, setMergedInto] = useState<Record<string, string>>({});
	const [mergeBoosts, setMergeBoosts] = useState<Record<string, number>>({});

	const handleDrop = (targetId: string) => {
		if (!draggedId || draggedId === targetId) return;

		const dragged = effectivePeople.find((p) => p.id === draggedId);
		if (!dragged || dragged.status === "named") return; // only unnamed → named

		const countToAdd = dragged.appearsInAssets;
		setMergedInto((prev) => ({ ...prev, [draggedId]: targetId }));
		setMergeBoosts((prev) => ({ ...prev, [targetId]: (prev[targetId] ?? 0) + countToAdd }));
		setSelectedUnnamedIds((current) => {
			const next = new Set(current);
			next.delete(draggedId);
			return next;
		});
		setDraggedId(null);
		setDragTargetId(null);
	};

	// ── Effective data (apply overrides) ─────────────────────────────────
	const effectivePeople: PersonItem[] = useMemo(
		() =>
			peopleItems
				.filter((p) => !mergedInto[p.id]) // hide merged-away cards
				.map((p) => ({
					...p,
					name: confirmedNames[p.id] ?? p.name,
					status: confirmedNames[p.id] ? ("named" as const) : p.status,
					appearsInAssets: p.appearsInAssets + (mergeBoosts[p.id] ?? 0),
				})),
		[mergedInto, confirmedNames, mergeBoosts],
	);

	// ── Search ────────────────────────────────────────────────────────────
	const filtered = useMemo(() => {
		const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
		if (terms.length === 0) return effectivePeople;
		return effectivePeople.filter((p) => {
			const haystack = [p.name, p.primaryAssetTitle, ...p.tags].join(" ").toLowerCase();
			return terms.every((t) => haystack.includes(t));
		});
	}, [search, effectivePeople]);

	const namedFiltered = filtered.filter((p) => p.status === "named");
	const unnamedFiltered = filtered.filter((p) => p.status !== "named");
	const namedAll = effectivePeople.filter((p) => p.status === "named");
	const unnamedAll = effectivePeople.filter((p) => p.status !== "named");
	const selectableUnnamedIds = useMemo(
		() => new Set(unnamedFiltered.map((person) => person.id)),
		[unnamedFiltered],
	);
	const selectedUnnamedCount = selectedUnnamedIds.size;

	const toggleUnnamedSelection = (id: string) => {
		setSelectedUnnamedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const selectVisibleUnnamed = () => {
		setSelectedUnnamedIds(new Set(unnamedFiltered.map((person) => person.id)));
	};

	const clearUnnamedSelection = () => {
		setSelectedUnnamedIds(new Set());
		setBulkName("");
	};

	const applyBulkName = () => {
		const name = bulkName.trim();
		if (!name || selectedUnnamedIds.size === 0) return;
		setConfirmedNames((prev) => {
			const next = { ...prev };
			selectedUnnamedIds.forEach((id) => {
				next[id] = name;
			});
			return next;
		});
		clearUnnamedSelection();
		setPeopleView("named");
	};

	const totalAssets = effectivePeople.reduce((sum, p) => sum + p.appearsInAssets, 0);
	return (
		<Box className="axiom-v3-recognition" display="flex" flexDirection="column" gap="20">
			{batchMatchName && (
				<BatchMatchPanel
					name={batchMatchName}
					open
					onApply={() => setBatchMatchName(null)}
					onOpenChange={(open) => {
						if (!open) setBatchMatchName(null);
					}}
				/>
			)}

			{!hideToolbar && (
				<PeopleToolbar
					search={internalSearch}
					showFilters={showFilters}
					onSearchChange={setInternalSearch}
					onToggleFilters={() => setShowFilters((current) => !current)}
				/>
			)}

			<Box alignItems="start" display="flex" gap="20">
				<AssetFilterPanel open={showFilters} />
				<Box display="flex" flex="1" flexDirection="column" gap="20" style={{ minWidth: 0 }}>
					<RecognitionSnapshot
				namedCount={namedAll.length}
				totalAssets={totalAssets}
				unnamedCount={unnamedAll.length}
				onOpenUnknownInbox={onOpenUnknownInbox}
			/>

			<Tabs value={peopleView} onValueChange={(value) => setPeopleView(value as "named" | "unnamed")}>
				<TabsList>
					<TabsTrigger value="named">Named People ({namedAll.length})</TabsTrigger>
					<TabsTrigger value="unnamed">Unnamed People ({unnamedAll.length})</TabsTrigger>
				</TabsList>

				<TabsContent value="named">
					<Box display="flex" flexDirection="column" gap="16" pt="16">
						<PeopleGrid
							items={namedFiltered}
							draggedId={draggedId}
							dragTargetId={dragTargetId}
							onOpenProfile={onOpenProfile}
							onConfirmName={handleConfirmName}
							onDragStart={setDraggedId}
							onDragEnd={() => { setDraggedId(null); setDragTargetId(null); }}
							onDragEnterTarget={setDragTargetId}
							onDragLeaveTarget={() => setDragTargetId(null)}
							onDrop={handleDrop}
						/>
					</Box>
				</TabsContent>

				<TabsContent value="unnamed">
					<Box display="flex" flexDirection="column" gap="16" pt="16">
						{selectedUnnamedCount > 0 ? (
							<PeopleBulkNamePanel
								count={selectedUnnamedCount}
								name={bulkName}
								onApply={applyBulkName}
								onClear={clearUnnamedSelection}
								onNameChange={setBulkName}
							/>
						) : (
							<Box
								alignItems="center"
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								gap="12"
								justifyContent="space-between"
								p="16"
								rounded="md"
							>
								<Text fontSize="sm" color="fg.secondary">
									Drag a face onto a named person, click a face to name it, or select a set for one clean bulk update.
								</Text>
								<Button appearance="default" size="sm" onClick={selectVisibleUnnamed}>
									Select visible
								</Button>
							</Box>
						)}
						<PeopleGrid
							items={unnamedFiltered}
							draggedId={draggedId}
							dragTargetId={dragTargetId}
							selectableIds={selectableUnnamedIds}
							selectedIds={selectedUnnamedIds}
							onOpenProfile={onOpenProfile}
							onConfirmName={handleConfirmName}
							onDragStart={setDraggedId}
							onDragEnd={() => { setDraggedId(null); setDragTargetId(null); }}
							onDragEnterTarget={setDragTargetId}
							onDragLeaveTarget={() => setDragTargetId(null)}
							onDrop={handleDrop}
							onSelect={toggleUnnamedSelection}
						/>
					</Box>
				</TabsContent>
			</Tabs>

			{/* Empty state */}
			{filtered.length === 0 && (
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					flexDirection="column"
					gap="8"
					justifyContent="center"
					py="48"
					rounded="md"
				>
					<Text fontSize="md" fontWeight="500" color="fg.secondary">
						No people match your search
					</Text>
					<Text fontSize="sm" color="fg.tertiary">
						Try a different name or tag
					</Text>
				</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
