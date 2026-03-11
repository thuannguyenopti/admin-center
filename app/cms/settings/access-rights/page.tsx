"use client";

import { useState } from "react";
import { Box, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	IconSearch,
	IconChevronDown,
	IconUsers,
	IconDots,
	IconFolder,
} from "@tabler/icons-react";
import { INITIAL_ROLES, Role } from "./mockData";

export default function AccessRightsPage() {
	const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
	const [entity, setEntity] = useState("/");
	const [inheritFromParent, setInheritFromParent] = useState(false);
	const [applyToAllChildren, setApplyToAllChildren] = useState(false);
	const [searchFilter, setSearchFilter] = useState("");

	// Filter roles based on search
	const filteredRoles = roles.filter((role) =>
		role.name.toLowerCase().includes(searchFilter.toLowerCase())
	);

	// Handle permission toggle
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

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="24"
		>
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
					{/* Checkbox: Inherit from parent item */}
					<Box display="flex" alignItems="center" gap="12">
						<input
							type="checkbox"
							checked={inheritFromParent}
							onChange={(e) => setInheritFromParent(e.target.checked)}
							style={{
								width: "16px",
								height: "16px",
								borderRadius: "2px",
								border: "1px solid var(--ax-colors-border-tertiary)",
								cursor: "pointer",
							}}
						/>
						<Text fontSize="md" fontWeight="400" color="fg.default">
							Inherit from parent item
						</Text>
					</Box>

					{/* Checkbox: Apply to all children */}
					<Box display="flex" alignItems="center" gap="12">
						<input
							type="checkbox"
							checked={applyToAllChildren}
							onChange={(e) => setApplyToAllChildren(e.target.checked)}
							style={{
								width: "16px",
								height: "16px",
								borderRadius: "2px",
								border: "1px solid var(--ax-colors-fg-secondary)",
								cursor: "pointer",
							}}
						/>
						<Text fontSize="md" fontWeight="400" color="fg.default">
							Apply to all children
						</Text>
					</Box>
				</Box>
			</Box>

			{/* Search and Add Button */}
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
						<Th style={{ width: "240px" }}>Name</Th>
						<Th style={{ width: "100px", textAlign: "center" }}>Read</Th>
						<Th style={{ width: "100px", textAlign: "center" }}>Create</Th>
						<Th style={{ width: "100px", textAlign: "center" }}>Change</Th>
						<Th style={{ width: "100px", textAlign: "center" }}>Delete</Th>
						<Th style={{ width: "100px", textAlign: "center" }}>Publish</Th>
						<Th style={{ width: "100px", textAlign: "center" }}>Administer</Th>
						<Th style={{ width: "56px" }} />
					</Tr>
				</thead>
				<tbody>
					{filteredRoles.map((role) => (
						<Tr key={role.id}>
							{/* Name Column with Icon */}
							<Td type="header">
								<Box display="flex" gap="8" alignItems="center">
									<IconUsers
										size={20}
										color="var(--ax-colors-fg-default)"
									/>
									<Text fontSize="md" color="fg.default">
										{role.name}
									</Text>
								</Box>
							</Td>

							{/* Permission Checkboxes */}
							<Td style={{ textAlign: "center", padding: "12px 4px" }}>
								<input
									type="checkbox"
									checked={role.permissions.read}
									onChange={() => handlePermissionToggle(role.id, "read")}
									style={{
										width: "16px",
										height: "16px",
										borderRadius: "2px",
										border: "1px solid var(--ax-colors-fg-secondary)",
										cursor: "pointer",
										accentColor: "#0037ff",
									}}
								/>
							</Td>
							<Td style={{ textAlign: "center", padding: "12px 4px" }}>
								<input
									type="checkbox"
									checked={role.permissions.create}
									onChange={() => handlePermissionToggle(role.id, "create")}
									style={{
										width: "16px",
										height: "16px",
										borderRadius: "2px",
										border: "1px solid var(--ax-colors-fg-secondary)",
										cursor: "pointer",
										accentColor: "#0037ff",
									}}
								/>
							</Td>
							<Td style={{ textAlign: "center", padding: "12px 4px" }}>
								<input
									type="checkbox"
									checked={role.permissions.change}
									onChange={() => handlePermissionToggle(role.id, "change")}
									style={{
										width: "16px",
										height: "16px",
										borderRadius: "2px",
										border: "1px solid var(--ax-colors-fg-secondary)",
										cursor: "pointer",
										accentColor: "#0037ff",
									}}
								/>
							</Td>
							<Td style={{ textAlign: "center", padding: "12px 4px" }}>
								<input
									type="checkbox"
									checked={role.permissions.delete}
									onChange={() => handlePermissionToggle(role.id, "delete")}
									style={{
										width: "16px",
										height: "16px",
										borderRadius: "2px",
										border: "1px solid var(--ax-colors-fg-secondary)",
										cursor: "pointer",
										accentColor: "#0037ff",
									}}
								/>
							</Td>
							<Td style={{ textAlign: "center", padding: "12px 4px" }}>
								<input
									type="checkbox"
									checked={role.permissions.publish}
									onChange={() => handlePermissionToggle(role.id, "publish")}
									style={{
										width: "16px",
										height: "16px",
										borderRadius: "2px",
										border: "1px solid var(--ax-colors-fg-secondary)",
										cursor: "pointer",
										accentColor: "#0037ff",
									}}
								/>
							</Td>
							<Td style={{ textAlign: "center", padding: "12px 4px" }}>
								<input
									type="checkbox"
									checked={role.permissions.administer}
									onChange={() => handlePermissionToggle(role.id, "administer")}
									style={{
										width: "16px",
										height: "16px",
										borderRadius: "2px",
										border: "1px solid var(--ax-colors-fg-secondary)",
										cursor: "pointer",
										accentColor: "#0037ff",
									}}
								/>
							</Td>

							{/* Actions Column */}
							<Td type="button">
								<Button
									aria-label="Actions"
									size="md"
									icon={<IconDots />}
									appearance="subtle"
									onClick={() => console.log(`Actions for ${role.name}`)}
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

			{/* Bottom Action Buttons */}
			<Box display="flex" gap="12" justifyContent="flex-end" style={{ marginTop: "16px" }}>
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
