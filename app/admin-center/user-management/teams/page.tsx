"use client";

import { useMemo, useState } from "react";
import {
	Box,
	Button,
	EllipsisMenuButton,
	Heading,
	LabelMenuButton,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	Pagination,
	SearchInput,
	Text,
} from "@optiaxiom/react";
import { IconPlus } from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	DEFAULT_TEAM_FILTERS,
	INSTANCES,
	PRODUCTS,
	TEAMS_DATA,
	filterTeams,
	type Team,
	type TeamFilters,
} from "./data";

const PAGE_SIZE = 10;

function FilterDropdown({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: readonly string[];
	onChange: (v: string) => void;
}) {
	const items = ["All", ...options];
	return (
		<Menu
			options={items.map((opt) => ({
				label: opt,
				execute: () => onChange(opt),
			}))}
		>
			<MenuTrigger asChild>
				<LabelMenuButton label={label}>{value}</LabelMenuButton>
			</MenuTrigger>
			<MenuContent />
		</Menu>
	);
}

export default function AdminCenterTeamsPage() {
	const [teams] = useState<Team[]>(TEAMS_DATA);
	const [filters, setFilters] = useState<TeamFilters>(DEFAULT_TEAM_FILTERS);
	const [currentPage, setCurrentPage] = useState(1);

	const filtered = useMemo(
		() => filterTeams(teams, filters),
		[teams, filters],
	);
	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const pageRows = useMemo(
		() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
		[filtered, safePage],
	);

	const updateFilter = (key: keyof TeamFilters) => (v: string) => {
		setFilters((f) => ({ ...f, [key]: v }));
		setCurrentPage(1);
	};

	return (
		<Box>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				mb="16"
			>
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Teams Access</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button
						appearance="primary"
						icon={<IconPlus size={16} />}
						iconPosition="start"
					>
						Create new Team
					</Button>
				</Box>
			</Box>

			<Box display="flex" alignItems="center" gap="16" mb="16" flexWrap="wrap">
				<Box style={{ width: 280 }}>
					<SearchInput
						size="lg"
						placeholder="Search group by name"
						value={filters.search}
						onChange={(e) =>
							setFilters((f) => ({ ...f, search: e.target.value }))
						}
					/>
				</Box>
				<FilterDropdown
					label="Product"
					value={filters.product}
					options={PRODUCTS}
					onChange={updateFilter("product")}
				/>
				<FilterDropdown
					label="Instance"
					value={filters.instance}
					options={INSTANCES}
					onChange={updateFilter("instance")}
				/>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th style={{ width: 420 }}>Team Name</Th>
						<Th style={{ width: 200 }}>Product name</Th>
						<Th style={{ width: 200 }}>Instance name</Th>
						<Th style={{ width: 160 }}>Created</Th>
						<Th style={{ width: 160 }}>Modified</Th>
						<Th style={{ width: 60 }} />
					</Tr>
				</thead>
				<tbody>
					{pageRows.length === 0 ? (
						<tr>
							<td colSpan={6}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">
										No teams match the current filters.
									</Text>
								</Box>
							</td>
						</tr>
					) : (
						pageRows.map((t) => (
							<Tr key={t.id}>
								<Td>
									<Box display="flex" flexDirection="column" gap="2">
										<Text fontWeight="500" color="fg.default">
											{t.name}
										</Text>
										{t.description && (
											<Text fontSize="sm" color="fg.tertiary">
												{t.description}
											</Text>
										)}
									</Box>
								</Td>
								<Td>{t.productName}</Td>
								<Td>{t.instanceName}</Td>
								<Td>
									<Box display="flex" flexDirection="column" gap="2">
										<Text color="fg.default">{t.createdDate}</Text>
										<Text fontSize="sm" color="fg.tertiary">
											{t.createdTime}
										</Text>
									</Box>
								</Td>
								<Td>
									<Box display="flex" flexDirection="column" gap="2">
										<Text color="fg.default">{t.modifiedDate}</Text>
										<Text fontSize="sm" color="fg.tertiary">
											{t.modifiedTime}
										</Text>
									</Box>
								</Td>
								<Td type="raw" style={{ width: 60 }}>
									<Box display="flex" justifyContent="end">
										<Menu
											options={[
												{ label: "View details", execute: () => {} },
												{ label: "Edit team", execute: () => {} },
												{
													intent: "danger",
													label: "Delete team",
													execute: () => {},
												},
											]}
										>
											<MenuTrigger asChild>
												<EllipsisMenuButton
													appearance="subtle"
													size="sm"
													aria-label={`Actions for ${t.name}`}
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
				<Pagination
					page={safePage}
					total={totalPages}
					onPageChange={setCurrentPage}
				/>
			</Box>
		</Box>
	);
}
