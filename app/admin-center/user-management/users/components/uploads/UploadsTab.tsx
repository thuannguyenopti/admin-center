"use client";

import { useMemo, useState } from "react";
import {
	Box,
	Button,
	Checkbox,
	EllipsisMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Pagination,
	SearchInput,
	Text,
} from "@optiaxiom/react";
import { IconFilter } from "@optimizely/axiom-icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { UPLOADS, statusColor, type Upload } from "./data";

const PAGE_SIZE = 12;

export function UploadsTab({
	onViewDetails,
}: {
	onViewDetails: (u: Upload) => void;
}) {
	const [search, setSearch] = useState("");
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return q
			? UPLOADS.filter(
					(u) =>
						u.fileName.toLowerCase().includes(q) ||
						u.uploadedBy.toLowerCase().includes(q),
				)
			: UPLOADS;
	}, [search]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

	const pageRowIds = pageRows.map((r) => r.id);
	const allOnPageSelected =
		pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds.has(id));

	const toggleRow = (id: string) =>
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	const togglePageSelectAll = () =>
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (allOnPageSelected) pageRowIds.forEach((id) => next.delete(id));
			else pageRowIds.forEach((id) => next.add(id));
			return next;
		});

	return (
		<>
			<Box display="flex" alignItems="center" gap="16" mb="16">
				<Box style={{ width: 280 }}>
					<SearchInput
						size="lg"
						placeholder="Search users by name or email"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</Box>
				<Box
					display="inline-flex"
					border="1"
					rounded="sm"
					style={{ borderColor: "var(--ax-colors-bg-accent-subtle-hovered)" }}
				>
					<Button
						appearance="subtle"
						size="lg"
						icon={<IconFilter />}
						onClick={() => setFiltersOpen((open) => !open)}
						aria-expanded={filtersOpen}
					>
						Filter
					</Button>
				</Box>
			</Box>

			<Box p="12" border="1" borderColor="border.secondary" rounded="md" mb="16">
				<Text fontSize="sm" color="fg.secondary">
					Select file uploads from the list to manage them in bulk.
				</Text>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th style={{ width: 48 }}>
							<Checkbox
								checked={allOnPageSelected}
								onCheckedChange={togglePageSelectAll}
								aria-label="Select all on this page"
							/>
						</Th>
						<Th>File name</Th>
						<Th>Uploaded by</Th>
						<Th>Upload date</Th>
						<Th tooltip="Status of the bulk upload: processing, completed, or failed.">
							Status
						</Th>
						<Th style={{ width: 60 }} />
					</Tr>
				</thead>
				<tbody>
					{pageRows.length === 0 ? (
						<tr>
							<td colSpan={6}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">No uploads found.</Text>
								</Box>
							</td>
						</tr>
					) : (
						pageRows.map((u) => (
							<Tr key={u.id} onClick={() => onViewDetails(u)}>
								<Td style={{ width: 48 }}>
									<Box onClick={(e) => e.stopPropagation()} display="inline-flex">
										<Checkbox
											checked={selectedIds.has(u.id)}
											onCheckedChange={() => toggleRow(u.id)}
											aria-label={`Select ${u.fileName}`}
										/>
									</Box>
								</Td>
								<Td>{u.fileName}</Td>
								<Td>{u.uploadedBy}</Td>
								<Td>{u.uploadedOn}</Td>
								<Td>
									<Text asChild color={statusColor(u.status)} fontWeight="500">
										<span>{u.status}</span>
									</Text>
								</Td>
								<Td type="raw" style={{ width: 60 }}>
									<Box
										onClick={(e) => e.stopPropagation()}
										display="flex"
										justifyContent="end"
									>
										<Menu
											options={[
												{
													label: "View details",
													execute: () => onViewDetails(u),
												},
												{
													intent: "danger",
													label: "Delete upload",
													execute: () => {},
												},
											]}
										>
											<MenuTrigger asChild>
												<EllipsisMenuButton
													appearance="subtle"
													size="sm"
													aria-label={`Actions for ${u.fileName}`}
												/>
											</MenuTrigger>
											<MenuContent />
										</Menu>
									</Box>
								</Td>
							</Tr>
						))
					)}
				</tbody>
			</Table>

			<Box display="flex" justifyContent="center" mt="16">
				<Pagination page={safePage} total={totalPages} onPageChange={setPage} />
			</Box>
		</>
	);
}
