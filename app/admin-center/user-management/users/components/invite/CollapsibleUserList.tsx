"use client";

import { useState } from "react";
import { Box, Button, Checkbox, Text } from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import type { InvitedUser } from "./types";

const DEFAULT_LIMIT = 6;

export function CollapsibleUserList({
	users,
	limit = DEFAULT_LIMIT,
	selectable,
	selectedEmails,
	onToggle,
	onToggleAll,
	emptyLabel = "No users",
	showHeader = true,
}: {
	users: InvitedUser[];
	limit?: number;
	selectable?: boolean;
	selectedEmails?: Set<string>;
	onToggle?: (email: string) => void;
	onToggleAll?: (checked: boolean) => void;
	emptyLabel?: string;
	showHeader?: boolean;
}) {
	const [expanded, setExpanded] = useState(false);
	const overflow = users.length > limit;
	const shown = expanded || !overflow ? users : users.slice(0, limit);
	const allSelected =
		selectable &&
		users.length > 0 &&
		users.every((u) => selectedEmails?.has(u.email));

	if (users.length === 0) {
		return (
			<Text fontSize="sm" color="fg.tertiary">
				{emptyLabel}
			</Text>
		);
	}

	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Table>
				{showHeader && (
					<thead>
						<Tr>
							{selectable && (
								<Th style={{ width: 40, paddingLeft: 16, paddingRight: 0 }}>
									<Checkbox
										checked={!!allSelected}
										aria-label="Select all visible users"
										onCheckedChange={(v) => onToggleAll?.(!!v)}
									/>
								</Th>
							)}
							<Th style={selectable ? { paddingLeft: 8 } : undefined}>Email</Th>
							<Th>First name</Th>
							<Th>Last name</Th>
						</Tr>
					</thead>
				)}
				<tbody>
					{shown.map((u) => (
						<Tr key={u.email}>
							{selectable && (
								<Td
									style={{
										width: 40,
										paddingLeft: 16,
										paddingRight: 0,
										verticalAlign: "middle",
									}}
								>
									<Checkbox
										checked={!!selectedEmails?.has(u.email)}
										aria-label={`Select ${u.email}`}
										onCheckedChange={() => onToggle?.(u.email)}
									/>
								</Td>
							)}
							<Td style={selectable ? { paddingLeft: 8 } : undefined}>
								{u.email}
							</Td>
							<Td>
								{u.first || (
									<Text asChild color="fg.tertiary">
										<span>—</span>
									</Text>
								)}
							</Td>
							<Td>
								{u.last || (
									<Text asChild color="fg.tertiary">
										<span>—</span>
									</Text>
								)}
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>
			{overflow && (
				<Box display="flex" justifyContent="center">
					<Button
						appearance="subtle"
						size="sm"
						onClick={() => setExpanded((e) => !e)}
					>
						{expanded
							? "View less"
							: `View ${users.length - limit} more`}
					</Button>
				</Box>
			)}
		</Box>
	);
}
