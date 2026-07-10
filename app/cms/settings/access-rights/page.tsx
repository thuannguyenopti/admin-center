"use client";

import { useState } from "react";
import { Box, Badge, Checkbox, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	IconSearch,
	IconChevronDown,
	IconUsers,
	IconUser,
	IconEllipsisSolid,
	IconFolder,
} from "@/app/lib/axiom-icons";
import { INITIAL_ROLES, type Role } from "./mockData";

export default function AccessRightsPage() {
	const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
	const [entity, setEntity] = useState("/");
	const [inheritFromParent, setInheritFromParent] = useState(false);
	const [applyToAllChildren, setApplyToAllChildren] = useState(false);
	const [searchFilter, setSearchFilter] = useState("");
	const filteredRoles = roles.filter((role) =>
		role.name.toLowerCase().includes(searchFilter.toLowerCase())
	);

	const handlePermissionToggle = (
		roleId: string,
		permission: keyof Role["permissions"]
	) => {
		setRoles(
			roles.map((role) =>
				role.id === roleId
					? {
						...role,
						permissions: {
							...role.permissions,
							[permission]: !role.permissions[permission],
						},
					}
					: role
			)
		);
	};

	const permissionKeys: Array<keyof Role["permissions"]> = [
		"read",
		"create",
		"change",
		"delete",
		"publish",
		"administer",
	];

	return (
		<Box display="flex" flexDirection="column" gap="24">
			{/* Entity Selector Section */}
			<Box display="flex" flexDirection="column" gap="12">
				<Text fontSize="md" fontWeight="400" color="fg.tertiary">
					Entity
				</Text>
				<Box
					display="flex"
					alignItems="center"
					gap="12"
					style={{
						border: "1px solid var(--ax-colors-border-tertiary)",
						borderRadius: "6px",
						padding: "10px 12px",
						background: "var(--ax-colors-bg-default)",
						cursor: "pointer",
					}}
				>
					<IconFolder size={16} color="var(--ax-colors-fg-tertiary)" />
					<Text fontSize="md" fontWeight="400" color="fg.default">
						{entity}
					</Text>
					<Box style={{ marginLeft: "auto" }}>
						<IconChevronDown size={16} color="var(--ax-colors-fg-tertiary)" />
					</Box>
				</Box>
			</Box>

			{/* Permissions Section */}
			<Box display="flex" flexDirection="column" gap="16">
				<Text fontSize="md" fontWeight="400" color="fg.default">
					Permissions
				</Text>
				<Box display="flex" flexDirection="column" gap="12">
					<Checkbox
						checked={inheritFromParent}
						onCheckedChange={(checked) => setInheritFromParent(!!checked)}
					>
						Inherit from parent item
					</Checkbox>
					<Checkbox
						checked={applyToAllChildren}
						onCheckedChange={(checked) => setApplyToAllChildren(!!checked)}
					>
						Apply to all children
					</Checkbox>
				</Box>
			</Box>

			{/* Search and Add Buttons */}
			<Box display="flex" gap="12" alignItems="center">
				<Box flex="1" style={{ position: "relative", maxWidth: "266px" }}>
					<Input
						placeholder="Filter by name"
						value={searchFilter}
						onChange={(e) => setSearchFilter(e.target.value)}
						style={{ paddingLeft: "40px" }}
					/>
					<Box
						style={{
							position: "absolute",
							left: "12px",
							top: "50%",
							transform: "translateY(-50%)",
						}}
					>
						<IconSearch size={16} color="var(--ax-colors-fg-tertiary)" />
					</Box>
				</Box>
				<Button appearance="default" size="lg">
					Add User/Group
				</Button>
			</Box>

			{/* Permissions Table */}
			<Table style={{ marginTop: "8px" }}>
				<thead>
					<Tr>
						<Th style={{ width: "280px" }}>Name</Th>
						{permissionKeys.map((key) => (
							<Th
								key={key}
								style={{ width: "100px", textAlign: "center" }}
							>
								{key.charAt(0).toUpperCase() + key.slice(1)}
							</Th>
						))}
						<Th style={{ width: "56px" }} />
					</Tr>
				</thead>
				<tbody>
					{filteredRoles.map((role) => (
						<Tr key={role.id}>
							<Td type="header">
								<Box display="flex" gap="10" alignItems="center">
									{role.type === "vt" ? (
										<Box
											style={{
												width: 28,
												height: 28,
												borderRadius: "50%",
												overflow: "hidden",
												background: role.avatarBg || "#eee",
												flexShrink: 0,
											}}
										>
											<img
												src={role.avatar}
												alt={role.name}
												width={28}
												height={28}
												style={{ display: "block" }}
											/>
										</Box>
									) : role.type === "user" ? (
										<IconUser
											size={20}
											color="var(--ax-colors-fg-default)"
										/>
									) : (
										<IconUsers
											size={20}
											color="var(--ax-colors-fg-default)"
										/>
									)}
									<Box display="flex" flexDirection="column" gap="0">
										<Box display="flex" alignItems="center" gap="6">
											<Text fontSize="md" color="fg.default">
												{role.name}
											</Text>
											{role.type === "vt" && (
												<Badge intent="information" variant="subtle">
													VT
												</Badge>
											)}
										</Box>
										{role.templateName && (
											<Text fontSize="sm" color="fg.tertiary">
												{role.templateName}
											</Text>
										)}
									</Box>
								</Box>
							</Td>

							{permissionKeys.map((key) => (
								<Td key={key} style={{ textAlign: "center", padding: "12px 4px" }}>
									<Checkbox
										checked={role.permissions[key]}
										onCheckedChange={() =>
											handlePermissionToggle(role.id, key)
										}
									/>
								</Td>
							))}

							<Td type="button">
								<Button
									aria-label="Actions"
									size="md"
									icon={<IconEllipsisSolid />}
									appearance="subtle"
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

			{/* Bottom Action Buttons */}
			<Box
				display="flex"
				gap="12"
				justifyContent="flex-end"
				style={{ marginTop: "16px" }}
			>
				<Button appearance="default" size="lg">
					Revert
				</Button>
				<Button appearance="primary" size="lg">
					Save Changes
				</Button>
			</Box>
		</Box>
	);
}
