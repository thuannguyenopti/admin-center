"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Text, toaster } from "@optiaxiom/react";
import { IconPlus } from "@optiaxiom/icons";
import {
	applyStagingReview,
	isStagingImportable,
	isStagingIssue,
	type ExistingUserAccess,
	type StagingUser,
	type Upload,
} from "./data";
import { StagingIssuesPanel } from "./StagingIssuesPanel";
import { StagingAssignPanel } from "./StagingAssignPanel";
import { UploadJobsSection } from "./UploadJobsSection";
import { StagingUsersSection } from "./StagingUsersSection";
import type { GroupAccessPatch } from "./StagingGroupCell";

const PAGE_SIZE = 10;

export function UploadsTab({
	files,
	staging,
	setStaging,
	onViewDetails,
	onImportUsers,
	existingUsers,
	onOpenImport,
}: {
	files: Upload[];
	staging: StagingUser[];
	setStaging: React.Dispatch<React.SetStateAction<StagingUser[]>>;
	onViewDetails: (u: Upload) => void;
	onImportUsers: (users: StagingUser[]) => void;
	existingUsers: ExistingUserAccess[];
	onOpenImport: () => void;
}) {
	const [search, setSearch] = useState("");
	const [fileFilter, setFileFilter] = useState<string>("all");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);
	const [issuesOpen, setIssuesOpen] = useState(false);
	const [assignOpen, setAssignOpen] = useState(false);

	useEffect(() => {
		setStaging((prev) => applyStagingReview(prev, existingUsers));
	}, [existingUsers, setStaging]);

	const issues = useMemo(
		() => staging.filter((u) => isStagingIssue(u) && u.resolution !== "override"),
		[staging],
	);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return staging.filter((u) => {
			if (fileFilter !== "all" && u.uploadId !== fileFilter) return false;
			if (!q) return true;
			const name = `${u.first} ${u.last}`.toLowerCase();
			const group = (u.groupName ?? "").toLowerCase();
			return (
				u.email.toLowerCase().includes(q) ||
				name.includes(q) ||
				u.fileName.toLowerCase().includes(q) ||
				group.includes(q)
			);
		});
	}, [staging, search, fileFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageRows = filtered.slice(
		(safePage - 1) * PAGE_SIZE,
		safePage * PAGE_SIZE,
	);

	const importableSelected = useMemo(
		() =>
			staging.filter(
				(u) => selectedIds.has(u.id) && isStagingImportable(u),
			),
		[staging, selectedIds],
	);

	const allSelectedHaveGroupAccess =
		importableSelected.length > 0 &&
		importableSelected.every((u) => u.groupMatch === "matched");

	const allSelectedAreOverrides =
		importableSelected.length > 0 &&
		importableSelected.every((u) => u.resolution === "override");

	const toggleRow = (u: StagingUser) => {
		if (!isStagingImportable(u)) return;
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(u.id) ? next.delete(u.id) : next.add(u.id);
			return next;
		});
	};

	const importableOnPage = pageRows.filter(isStagingImportable);
	const allImportableOnPageSelected =
		importableOnPage.length > 0 &&
		importableOnPage.every((u) => selectedIds.has(u.id));

	const togglePageSelectAll = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (allImportableOnPageSelected) {
				importableOnPage.forEach((u) => next.delete(u.id));
			} else {
				importableOnPage.forEach((u) => next.add(u.id));
			}
			return next;
		});
	};

	const removeFromStaging = (ids: string[]) => {
		const idSet = new Set(ids);
		setStaging((prev) => prev.filter((u) => !idSet.has(u.id)));
		setSelectedIds((prev) => {
			const next = new Set(prev);
			ids.forEach((id) => next.delete(id));
			return next;
		});
		toaster.create(
			`Removed ${ids.length} user${ids.length === 1 ? "" : "s"} from staging`,
			{ intent: "success" },
		);
	};

	const markOverride = (ids: string[]) => {
		const idSet = new Set(ids);
		setStaging((prev) =>
			prev.map((u) =>
				idSet.has(u.id) &&
				(u.status === "Duplicate" || u.status === "Conflict")
					? { ...u, resolution: "override" as const }
					: u,
			),
		);
		setSelectedIds((prev) => {
			const next = new Set(prev);
			ids.forEach((id) => next.add(id));
			return next;
		});
		toaster.create(
			`Marked ${ids.length} user${ids.length === 1 ? "" : "s"} to override existing access`,
			{ intent: "information" },
		);
	};

	const handleChangeGroup = (id: string, patch: GroupAccessPatch) => {
		setStaging((prev) => {
			const next = prev.map((u) => (u.id === id ? { ...u, ...patch } : u));
			return applyStagingReview(next, existingUsers);
		});
	};

	const handleAssignComplete = (ids: string[]) => {
		const idSet = new Set(ids);
		const imported = staging.filter((u) => idSet.has(u.id));
		onImportUsers(imported);
		setStaging((prev) => prev.filter((u) => !idSet.has(u.id)));
		setSelectedIds(new Set());
	};

	const handleImportSelected = () => {
		if (importableSelected.length === 0) return;
		const ids = importableSelected.map((u) => u.id);
		const overrideCount = importableSelected.filter(
			(u) => u.resolution === "override",
		).length;
		const newCount = importableSelected.length - overrideCount;
		const parts: string[] = [];
		if (newCount > 0) {
			parts.push(
				`${newCount} new user${newCount === 1 ? "" : "s"}`,
			);
		}
		if (overrideCount > 0) {
			parts.push(
				`${overrideCount} override${overrideCount === 1 ? "" : "s"}`,
			);
		}
		toaster.create(`Imported ${parts.join(" · ")}`, { intent: "success" });
		handleAssignComplete(ids);
	};

	const completedFiles = files.filter((f) => f.status === "Completed");
	const showGroupCol = staging.some(
		(u) => u.importMode === "groupAccess" || Boolean(u.groupName),
	);

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<UploadJobsSection
				files={files}
				onViewDetails={onViewDetails}
				onOpenImport={onOpenImport}
			/>

			<StagingUsersSection
				stagingCount={staging.length}
				issuesCount={issues.length}
				onViewIssues={() => setIssuesOpen(true)}
				search={search}
				onSearchChange={(v) => {
					setSearch(v);
					setPage(1);
				}}
				fileFilter={fileFilter}
				onFileFilterChange={(id) => {
					setFileFilter(id);
					setPage(1);
				}}
				completedFiles={completedFiles}
				pageRows={pageRows}
				importableOnPage={importableOnPage}
				allImportableOnPageSelected={allImportableOnPageSelected}
				onTogglePageSelectAll={togglePageSelectAll}
				selectedIds={selectedIds}
				onToggleRow={toggleRow}
				safePage={safePage}
				totalPages={totalPages}
				onPageChange={setPage}
				showGroupCol={showGroupCol}
				onChangeGroup={handleChangeGroup}
				onRemoveRow={(id) => removeFromStaging([id])}
				onOverrideRow={(id) => markOverride([id])}
			/>

			{importableSelected.length > 0 && (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					gap="12"
					px="16"
					py="12"
					rounded="md"
					border="1"
					borderColor="border.default"
					bg="bg.default"
					style={{
						position: "sticky",
						bottom: 16,
						zIndex: 5,
						boxShadow: "var(--ax-shadows-md)",
					}}
					flexWrap="wrap"
				>
					<Text fontSize="sm" fontWeight="500">
						{`${importableSelected.length} user${
							importableSelected.length === 1 ? "" : "s"
						} ready to import`}
						{allSelectedAreOverrides ? " (override)" : ""}
					</Text>
					<Box display="flex" alignItems="center" gap="8" flexWrap="wrap">
						<Button
							appearance="subtle"
							size="sm"
							onClick={() =>
								removeFromStaging(importableSelected.map((u) => u.id))
							}
						>
							Remove
						</Button>
						{(allSelectedHaveGroupAccess || allSelectedAreOverrides) && (
							<Button
								appearance="primary"
								size="sm"
								onClick={handleImportSelected}
							>
								{allSelectedAreOverrides
									? "Import & override"
									: "Import with group access"}
							</Button>
						)}
						{!allSelectedHaveGroupAccess && !allSelectedAreOverrides && (
							<Button
								appearance="primary"
								size="sm"
								icon={<IconPlus size={16} />}
								iconPosition="start"
								onClick={() => setAssignOpen(true)}
							>
								Assign access
							</Button>
						)}
						{allSelectedHaveGroupAccess && !allSelectedAreOverrides && (
							<Button
								appearance="default"
								size="sm"
								icon={<IconPlus size={16} />}
								iconPosition="start"
								onClick={() => setAssignOpen(true)}
							>
								Assign access
							</Button>
						)}
					</Box>
				</Box>
			)}

			<StagingIssuesPanel
				open={issuesOpen}
				issues={staging.filter(isStagingIssue)}
				onClose={() => setIssuesOpen(false)}
				onDelete={(ids) => {
					removeFromStaging(ids);
					if (ids.length >= issues.length) setIssuesOpen(false);
				}}
				onOverride={(ids) => {
					markOverride(ids);
					setIssuesOpen(false);
				}}
			/>

			<StagingAssignPanel
				open={assignOpen}
				users={importableSelected}
				onClose={() => setAssignOpen(false)}
				onComplete={handleAssignComplete}
			/>
		</Box>
	);
}
