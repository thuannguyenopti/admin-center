"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Text, toaster } from "@optiaxiom/react";
import { IconPlus } from "@optiaxiom/icons";
import {
	applyDuplicateCheck,
	type StagingUser,
	type Upload,
} from "./data";
import { StagingIssuesPanel } from "./StagingIssuesPanel";
import { StagingAssignPanel } from "./StagingAssignPanel";
import { UploadJobsSection } from "./UploadJobsSection";
import { StagingUsersSection } from "./StagingUsersSection";

const PAGE_SIZE = 10;

export function UploadsTab({
	files,
	staging,
	setStaging,
	onViewDetails,
	onImportUsers,
	systemEmails,
	onOpenImport,
}: {
	files: Upload[];
	staging: StagingUser[];
	setStaging: React.Dispatch<React.SetStateAction<StagingUser[]>>;
	onViewDetails: (u: Upload) => void;
	onImportUsers: (users: StagingUser[]) => void;
	systemEmails: string[];
	onOpenImport: () => void;
}) {
	const [search, setSearch] = useState("");
	const [fileFilter, setFileFilter] = useState<string>("all");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);
	const [issuesOpen, setIssuesOpen] = useState(false);
	const [assignOpen, setAssignOpen] = useState(false);

	useEffect(() => {
		setStaging((prev) => applyDuplicateCheck(prev, systemEmails));
	}, [systemEmails, setStaging]);

	const issues = useMemo(
		() => staging.filter((u) => u.status === "Duplicate"),
		[staging],
	);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return staging.filter((u) => {
			if (fileFilter !== "all" && u.uploadId !== fileFilter) return false;
			if (!q) return true;
			const name = `${u.first} ${u.last}`.toLowerCase();
			return (
				u.email.toLowerCase().includes(q) ||
				name.includes(q) ||
				u.fileName.toLowerCase().includes(q)
			);
		});
	}, [staging, search, fileFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageRows = filtered.slice(
		(safePage - 1) * PAGE_SIZE,
		safePage * PAGE_SIZE,
	);

	const validSelected = useMemo(
		() =>
			staging.filter((u) => selectedIds.has(u.id) && u.status === "Valid"),
		[staging, selectedIds],
	);

	const toggleRow = (u: StagingUser) => {
		if (u.status !== "Valid") return;
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(u.id) ? next.delete(u.id) : next.add(u.id);
			return next;
		});
	};

	const validOnPage = pageRows.filter((u) => u.status === "Valid");
	const allValidOnPageSelected =
		validOnPage.length > 0 &&
		validOnPage.every((u) => selectedIds.has(u.id));

	const togglePageSelectAll = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (allValidOnPageSelected) {
				validOnPage.forEach((u) => next.delete(u.id));
			} else {
				validOnPage.forEach((u) => next.add(u.id));
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

	const handleAssignComplete = (ids: string[]) => {
		const idSet = new Set(ids);
		const imported = staging.filter((u) => idSet.has(u.id));
		onImportUsers(imported);
		setStaging((prev) => prev.filter((u) => !idSet.has(u.id)));
		setSelectedIds(new Set());
	};

	const completedFiles = files.filter((f) => f.status === "Completed");

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
				validOnPage={validOnPage}
				allValidOnPageSelected={allValidOnPageSelected}
				onTogglePageSelectAll={togglePageSelectAll}
				selectedIds={selectedIds}
				onToggleRow={toggleRow}
				safePage={safePage}
				totalPages={totalPages}
				onPageChange={setPage}
			/>

			{validSelected.length > 0 && (
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
						{`${validSelected.length} valid user${
							validSelected.length === 1 ? "" : "s"
						} selected`}
					</Text>
					<Button
						appearance="primary"
						size="sm"
						icon={<IconPlus size={16} />}
						iconPosition="start"
						onClick={() => setAssignOpen(true)}
					>
						Assign access
					</Button>
				</Box>
			)}

			<StagingIssuesPanel
				open={issuesOpen}
				issues={issues}
				onClose={() => setIssuesOpen(false)}
				onDelete={(ids) => {
					removeFromStaging(ids);
					if (ids.length >= issues.length) setIssuesOpen(false);
				}}
			/>

			<StagingAssignPanel
				open={assignOpen}
				users={validSelected}
				onClose={() => setAssignOpen(false)}
				onComplete={handleAssignComplete}
			/>
		</Box>
	);
}
