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
import { stagingStatusColor, type StagingUser, type Upload } from "./data";

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
	validOnPage,
	allValidOnPageSelected,
	onTogglePageSelectAll,
	selectedIds,
	onToggleRow,
	safePage,
	totalPages,
	onPageChange,
	showGroupCol = false,
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
	validOnPage: StagingUser[];
	allValidOnPageSelected: boolean;
	onTogglePageSelectAll: () => void;
	selectedIds: Set<string>;
	onToggleRow: (u: StagingUser) => void;
	safePage: number;
	totalPages: number;
	onPageChange: (p: number) => void;
	showGroupCol?: boolean;
}) {
	const colSpan = showGroupCol ? 7 : 6;

	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Box display="flex" flexDirection="column" gap="2">
				<Box display="flex" alignItems="center" gap="8">
					<Text fontWeight="600">Staging users</Text>
					<Badge variant="subtle">{stagingCount}</Badge>
				</Box>
				<Text fontSize="sm" color="fg.secondary">
					Separate from All users. Fix duplicates, then select valid users to
					assign access and import. Group-access rows can import with the
					matched group&rsquo;s product, instance, and role.
				</Text>
			</Box>

			{issuesCount > 0 && (
				<Banner intent="danger">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="12"
						flexWrap="wrap"
						w="full"
					>
						<Text fontSize="sm">
							{`${issuesCount} email${issuesCount === 1 ? "" : "s"} already exist on the system and cannot be selected for access.`}
						</Text>
						<Button appearance="default" size="sm" onClick={onViewIssues}>
							View duplicates
						</Button>
					</Box>
				</Banner>
			)}

			<Box display="flex" alignItems="center" gap="12" flexWrap="wrap">
				<Box style={{ width: 280 }}>
					<SearchInput
						placeholder="Search staging by name or email"
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
								checked={allValidOnPageSelected}
								onCheckedChange={onTogglePageSelectAll}
								aria-label="Select all valid on this page"
								disabled={validOnPage.length === 0}
							/>
						</Th>
						<Th style={{ paddingLeft: 8 }}>Email</Th>
						<Th>First name</Th>
						<Th>Last name</Th>
						{showGroupCol && <Th>Group</Th>}
						<Th>Source file</Th>
						<Th>Status</Th>
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
							const isDup = u.status === "Duplicate";
							return (
								<Tr
									key={u.id}
									onClick={() => onToggleRow(u)}
									style={isDup ? { opacity: 0.85 } : undefined}
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
												disabled={isDup}
												onCheckedChange={() => onToggleRow(u)}
												aria-label={
													isDup
														? `${u.email} is a duplicate`
														: `Select ${u.email}`
												}
											/>
										</Box>
									</Td>
									<Td style={{ paddingLeft: 8 }}>
										<Text
											color={isDup ? "fg.error" : "fg.default"}
											fontWeight={isDup ? "500" : "400"}
										>
											{u.email}
										</Text>
									</Td>
									<Td>{u.first}</Td>
									<Td>{u.last}</Td>
									{showGroupCol && (
										<Td>
											{u.groupName ? (
												<Box
													display="flex"
													flexDirection="column"
													gap="2"
												>
													<Text fontSize="sm">{u.groupName}</Text>
													{u.groupMatch === "matched" && (
														<Text fontSize="sm" color="fg.secondary">
															{u.product} · {u.instance} · {u.role}
														</Text>
													)}
													{u.groupMatch === "unknown" && (
														<Text fontSize="sm" color="fg.error">
															Unknown group
														</Text>
													)}
												</Box>
											) : (
												<Text fontSize="sm" color="fg.tertiary">
													—
												</Text>
											)}
										</Td>
									)}
									<Td>
										<Text fontSize="sm" color="fg.secondary">
											{u.fileName}
										</Text>
									</Td>
									<Td>
										<Text
											asChild
											color={stagingStatusColor(u.status)}
											fontWeight="500"
										>
											<span>{u.status}</span>
										</Text>
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
