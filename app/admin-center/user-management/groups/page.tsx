"use client";

import { useMemo, useState } from "react";
import {
	Badge,
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
	DEFAULT_GROUP_FILTERS,
	GROUPS_DATA,
	GROUP_TYPES,
	INSTANCES,
	PRODUCTS,
	ROLES,
	filterGroups,
	type Group,
	type GroupFilters,
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

function GroupTypeBadge({ type }: { type: Group["groupType"] }) {
	if (type === "Custom") {
		return (
			<Badge intent="primary" variant="strong">
				Custom
			</Badge>
		);
	}
	return <Badge variant="strong">Product</Badge>;
}

export default function AdminCenterGroupsPage() {
	const [groups] = useState<Group[]>(GROUPS_DATA);
	const [filters, setFilters] = useState<GroupFilters>(DEFAULT_GROUP_FILTERS);
	const [currentPage, setCurrentPage] = useState(1);

	const filtered = useMemo(
		() => filterGroups(groups, filters),
		[groups, filters],
	);
	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const pageRows = useMemo(
		() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
		[filtered, safePage],
	);

	const updateFilter = (key: keyof GroupFilters) => (v: string) => {
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
					<Heading level="2">Group Access</Heading>
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
						Create new Group
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
					label="Instances"
					value={filters.instance}
					options={INSTANCES}
					onChange={updateFilter("instance")}
				/>
				<FilterDropdown
					label="Roles"
					value={filters.role}
					options={ROLES}
					onChange={updateFilter("role")}
				/>
				<FilterDropdown
					label="Group type"
					value={filters.groupType}
					options={GROUP_TYPES}
					onChange={updateFilter("groupType")}
				/>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th style={{ width: 480 }}>Group Name</Th>
						<Th style={{ width: 96 }}>Users</Th>
						<Th style={{ width: 140 }}>Group type</Th>
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
										No groups match the current filters.
									</Text>
								</Box>
							</td>
						</tr>
					) : (
						pageRows.map((g) => (
							<Tr key={g.id}>
								<Td>
									<Box display="flex" flexDirection="column" gap="2">
										<Text fontWeight="500" color="fg.default">
											{g.name}
										</Text>
										{g.description && (
											<Text fontSize="sm" color="fg.tertiary">
												{g.description}
											</Text>
										)}
									</Box>
								</Td>
								<Td>{g.users}</Td>
								<Td>
									<GroupTypeBadge type={g.groupType} />
								</Td>
								<Td>
									<Box display="flex" flexDirection="column" gap="2">
										<Text color="fg.default">{g.createdDate}</Text>
										<Text fontSize="sm" color="fg.tertiary">
											{g.createdTime}
										</Text>
									</Box>
								</Td>
								<Td>
									<Box display="flex" flexDirection="column" gap="2">
										<Text color="fg.default">{g.modifiedDate}</Text>
										<Text fontSize="sm" color="fg.tertiary">
											{g.modifiedTime}
										</Text>
									</Box>
								</Td>
								<Td type="raw" style={{ width: 60 }}>
									<Box display="flex" justifyContent="end">
										<Menu
											options={[
												{ label: "View details", execute: () => {} },
												{ label: "Edit group", execute: () => {} },
												{
													intent: "danger",
													label: "Delete group",
													execute: () => {},
												},
											]}
										>
											<MenuTrigger asChild>
												<EllipsisMenuButton
													appearance="subtle"
													size="sm"
													aria-label={`Actions for ${g.name}`}
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
