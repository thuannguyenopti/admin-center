"use client";

import { useMemo, useState } from "react";
import { Box, Heading, SearchInput, Menu, MenuTrigger, LabelMenuButton, MenuContent, Flex } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { Text } from "@/app/components/Text";
import { initialContentTypes, ContentType, Property } from "@/app/db/initialData";
import { useRouter } from "next/navigation";

export default function ContentTypesSettings() {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<string | null>(null);
	const [accessFilter, setAccessFilter] = useState<string | null>(null);

	const contentTypes: ContentType[] = initialContentTypes || [];

	const accessLevelOptions = [
		{ label: "Everyone", value: "Everyone" },
		{ label: "Admins", value: "Admins" },
	];
	const onAccessLevelChange = (value: string) => {
		setAccessFilter(value);
	};

	const currentAccessLevel = accessLevelOptions.find((opt) => opt.value === accessFilter) || accessLevelOptions[0];

	const typeOptions = [
		{ label: "All Types", value: null },
		{ label: "Page", value: "Page" },
		{ label: "Experience", value: "Experience" },
		{ label: "Block", value: "Block" },
		{ label: "Product", value: "Product" },
		{ label: "Media", value: "Media" },
	];
	const onTypesChange = (value: string | null) => {
		setTypeFilter(value);
	};
	const currentType = typeOptions.find((opt) => opt.value === typeFilter) || typeOptions[0];

	const filtered = useMemo(() => {
		return contentTypes.filter((ct) => {
			if (search && !ct.name.toLowerCase().includes(search.toLowerCase())) return false;
			// base type filter
			if (typeFilter) {
				if (ct.baseType !== typeFilter) return false;
			}
			if (accessFilter) {
				// our seed data does not include accessLevel; accept Everyone as default
				if (accessFilter !== "Everyone") return false;
			}
			return true;
		});
	}, [contentTypes, search, typeFilter, accessFilter]);

	const handleRowClick = (contentType: ContentType) => {
		router.push(`/cms/settings/content-types/${contentType.id}/properties`);
	};

	return (
		<>

			<Box display="flex" alignItems="center" gap="8" mb="16">
				<SearchInput size="lg" placeholder="Filter by name" value={search} onChange={(e: any) => setSearch(e.target.value)} />

				{/* Type Filter */}
				<Menu options={typeOptions.map((opt) => ({ label: opt.label, execute: () => onTypesChange(opt.value) }))}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Base Type" h="40">
							{currentType?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Acce Level Filter */}
				<Menu options={accessLevelOptions.map((opt) => ({ label: opt.label, execute: () => onAccessLevelChange(opt.value) }))}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Access Level" h="40">
							{currentAccessLevel?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<div style={{ flex: 1 }} />
	
				<Button appearance="primary" onClick={() => console.log('Create clicked')}>Create</Button>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th>Display Name</Th>
						<Th>Base Type</Th>
						<Th>Modified</Th>
						<Th>Access Level</Th>
						<Th />
					</Tr>
				</thead>
				<tbody>
					{filtered.map((ct) => {
						return (
							<Tr
								key={ct.id}
								onClick={() => handleRowClick(ct)}
								style={{ cursor: "pointer" }}
							>
								<Td type="header">{ct.displayName || ct.name}</Td>
								<Td>{ct.baseType}</Td>
								<Td>{ct.modifiedAt ? new Date(ct.modifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 13, 2024"}</Td>
								<Td>Everyone</Td>
								<Td type="button" data={() => console.log('actions for', ct.id)}>
									<></>
								</Td>
							</Tr>
						);
					})}
				</tbody>
			</Table>

			{filtered.length === 0 && (
				<Box mt="16">
					<Text color="fg.secondary">No content types found.</Text>
				</Box>
			)}
		</>
	);
}
