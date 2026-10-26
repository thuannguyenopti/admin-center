"use client";

import {
	Badge,
	Banner,
	Box,
	Button,
	Checkbox,
	Pagination,
	SearchInput,
	Text,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	isStagingImportable,
	stagingStatusColor,
	type StagingUser,
	type Upload,
} from "./data";
import {
	StagingGroupCell,
	type GroupAccessPatch,
} from "./StagingGroupCell";

export function StagingUsersSection({
	stagingCount,
	issuesCount,
	onViewIssues,
	search,
	onSearchChange,
	fileFilter,
	onFileFilterChange,
	completedFiles,
	pageRows,
	importableOnPage,
	allImportableOnPageSelected,
	onTogglePageSelectAll,
	selectedIds,
	onToggleRow,
	safePage,
	totalPages,
	onPageChange,
	showGroupCol = false,
	onChangeGroup,
	onRemoveRow,
	onOverrideRow,
}: {
	stagingCount: number;
	issuesCount: number;
	onViewIssues: () => void;
	search: string;
	onSearchChange: (v: string) => void;
	fileFilter: string;
	onFileFilterChange: (id: string) => void;
	completedFiles: Upload[];
	pageRows: StagingUser[];
	importableOnPage: StagingUser[];
	allImportableOnPageSelected: boolean;
	onTogglePageSelectAll: () => void;
	selectedIds: Set<string>;
	onToggleRow: (u: StagingUser) => void;
	safePage: number;
	totalPages: number;
	onPageChange: (p: number) => void;
	showGroupCol?: boolean;
	onChangeGroup: (id: string, patch: GroupAccessPatch) => void;
	onRemoveRow: (id: string) => void;
	onOverrideRow: (id: string) => void;
}) {
	const colSpan = showGroupCol ? 8 : 7;

	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Box display="flex" flexDirection="column" gap="2">
				<Box display="flex" alignItems="center" gap="8">
					<Text fontWeight="600">Staging users</Text>
					<Badge variant="subtle">{stagingCount}</Badge>
				</Box>
				<Text fontSize="sm" color="fg.secondary">
					Review the mapping, fix groups, then resolve duplicates/conflicts
					(Remove or Override) before importing.
				</Text>
			</Box>

			{issuesCount > 0 && (
				<Banner intent="warning">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="12"
						flexWrap="wrap"
						w="full"
					>
						<Text fontSize="sm">
							{`${issuesCount} row${issuesCount === 1 ? "" : "s"} need action — duplicate, conflict, or unknown group.`}
						</Text>
						<Button appearance="default" size="sm" onClick={onViewIssues}>
							Review issues
						</Button>
					</Box>
				</Banner>
			)}

			<Box display="flex" alignItems="center" gap="12" flexWrap="wrap">
				<Box style={{ width: 280 }}>
					<SearchInput
						placeholder="Search by name, email, or group"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</Box>
				<Box display="flex" alignItems="center" gap="8" flexWrap="wrap">
					<Button
						appearance={fileFilter === "all" ? "default" : "subtle"}
						size="sm"
						onClick={() => onFileFilterChange("all")}
					>
						All files
					</Button>
					{completedFiles.map((f) => (
						<Button
							key={f.id}
							appearance={fileFilter === f.id ? "default" : "subtle"}
							size="sm"
							onClick={() => onFileFilterChange(f.id)}
						>
							{f.fileName}
						</Button>
					))}
				</Box>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th style={{ width: 40, paddingLeft: 16, paddingRight: 0 }}>
							<Checkbox
								checked={allImportableOnPageSelected}
								onCheckedChange={onTogglePageSelectAll}
								aria-label="Select all importable on this page"
								disabled={importableOnPage.length === 0}
							/>
						</Th>
						<Th style={{ paddingLeft: 8 }}>Email</Th>
						<Th>First name</Th>
						<Th>Last name</Th>
						{showGroupCol && <Th>Group access</Th>}
						<Th>Source file</Th>
						<Th>Status</Th>
						<Th style={{ width: 160 }}>Action</Th>
					</Tr>
				</thead>
				<tbody>
					{pageRows.length === 0 ? (
						<tr>
							<td colSpan={colSpan}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">
										No staged users. Import a CSV to populate staging.
									</Text>
								</Box>
							</td>
						</tr>
					) : (
						pageRows.map((u) => {
							const importable = isStagingImportable(u);
							const needsDecision =
								u.status === "Duplicate" || u.status === "Conflict";
							const isIssue =
								needsDecision || u.status === "Unknown group";

							return (
								<Tr
									key={u.id}
									onClick={() => onToggleRow(u)}
									style={isIssue && !u.resolution ? { opacity: 0.92 } : undefined}
								>
									<Td
										style={{
											width: 40,
											paddingLeft: 16,
											paddingRight: 0,
											verticalAlign: "middle",
										}}
									>
										<Box
											onClick={(e) => e.stopPropagation()}
											display="inline-flex"
										>
											<Checkbox
												checked={selectedIds.has(u.id)}
												disabled={!importable}
												onCheckedChange={() => onToggleRow(u)}
												aria-label={
													importable
														? `Select ${u.email}`
														: `${u.email} needs action before import`
												}
											/>
										</Box>
									</Td>
									<Td style={{ paddingLeft: 8 }}>
										<Text
											color={isIssue && !u.resolution ? "fg.error" : "fg.default"}
											fontWeight={isIssue ? "500" : "400"}
										>
											{u.email}
										</Text>
									</Td>
									<Td>{u.first}</Td>
									<Td>{u.last}</Td>
									{showGroupCol && (
										<Td>
											<StagingGroupCell
												user={u}
												editable={u.importMode === "groupAccess"}
												onChangeGroup={(patch) =>
													onChangeGroup(u.id, patch)
												}
											/>
										</Td>
									)}
									<Td>
										<Text fontSize="sm" color="fg.secondary">
											{u.fileName}
										</Text>
									</Td>
									<Td>
										<Box display="flex" flexDirection="column" gap="2">
											<Text
												asChild
												color={stagingStatusColor(u.status)}
												fontWeight="500"
											>
												<span>{u.status}</span>
											</Text>
											{u.resolution === "override" && (
												<Text fontSize="sm" color="fg.secondary">
													Will override
												</Text>
											)}
										</Box>
									</Td>
									<Td>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
											flexWrap="wrap"
											onClick={(e) => e.stopPropagation()}
										>
											{needsDecision && u.resolution !== "override" && (
												<Button
													appearance="subtle"
													size="sm"
													onClick={() => onOverrideRow(u.id)}
												>
													Override
												</Button>
											)}
											{u.resolution === "override" && (
												<Text fontSize="sm" color="fg.secondary">
													Override set
												</Text>
											)}
											<Button
												appearance="subtle"
												size="sm"
												onClick={() => onRemoveRow(u.id)}
											>
												Remove
											</Button>
										</Box>
									</Td>
								</Tr>
							);
						})
					)}
				</tbody>
			</Table>

			<Box display="flex" justifyContent="center">
				<Pagination
					page={safePage}
					total={totalPages}
					onPageChange={onPageChange}
				/>
			</Box>
		</Box>
	);
}
