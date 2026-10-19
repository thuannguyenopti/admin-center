"use client";

import { useMemo, useState } from "react";
import {
	Box,
	Popover,
	PopoverContent,
	PopoverTrigger,
	SearchInput,
	Text,
} from "@optiaxiom/react";
import { USERS } from "../data";

export type SearchableUser = {
	email: string;
	first: string;
	last: string;
};

function matchesQuery(query: string, firstName: string, lastName: string, email: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return false;
	const fullName = `${firstName} ${lastName}`.toLowerCase();
	return (
		firstName.toLowerCase().includes(q) ||
		lastName.toLowerCase().includes(q) ||
		fullName.includes(q) ||
		email.toLowerCase().includes(q)
	);
}

export function searchUsers(
	query: string,
	excludeEmails: Set<string>,
	limit = 8,
): SearchableUser[] {
	const q = query.trim();
	if (!q) return [];
	return USERS.filter(
		(u) => !excludeEmails.has(u.email) && matchesQuery(q, u.firstName, u.lastName, u.email),
	)
		.slice(0, limit)
		.map((u) => ({ email: u.email, first: u.firstName, last: u.lastName }));
}

export function lookupUserByEmail(email: string): SearchableUser | null {
	const normalized = email.trim().toLowerCase();
	const match = USERS.find((u) => u.email.toLowerCase() === normalized);
	return match ? { email: match.email, first: match.firstName, last: match.lastName } : null;
}

export function UserSearchInput({
	value,
	onChange,
	onSelectUser,
	excludeEmails = [],
	placeholder = "Search by name or email",
	onEnterManual,
	clearOnSelect = true,
}: {
	value: string;
	onChange: (value: string) => void;
	onSelectUser: (user: SearchableUser) => void;
	excludeEmails?: Iterable<string>;
	placeholder?: string;
	/** Called on Enter when the query is not matched from the dropdown. */
	onEnterManual?: (value: string) => void;
	/** Whether to clear the input after selecting a user from the dropdown. */
	clearOnSelect?: boolean;
}) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const excluded = useMemo(() => new Set(excludeEmails), [excludeEmails]);

	const suggestions = useMemo(
		() => searchUsers(value, excluded),
		[value, excluded],
	);

	const open = value.trim().length > 0 && suggestions.length > 0;

	const handleSelect = (user: SearchableUser) => {
		onSelectUser(user);
		if (clearOnSelect) onChange("");
		setHoveredIndex(null);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (hoveredIndex !== null && suggestions[hoveredIndex]) {
				handleSelect(suggestions[hoveredIndex]);
			} else if (suggestions.length > 0) {
				handleSelect(suggestions[0]);
			} else {
				onEnterManual?.(value.trim());
			}
		} else if (e.key === "ArrowDown" && suggestions.length > 0) {
			e.preventDefault();
			setHoveredIndex((i) =>
				i === null ? 0 : Math.min(i + 1, suggestions.length - 1),
			);
		} else if (e.key === "ArrowUp" && suggestions.length > 0) {
			e.preventDefault();
			setHoveredIndex((i) =>
				i === null ? suggestions.length - 1 : Math.max(i - 1, 0),
			);
		}
	};

	return (
		<Popover open={open} onOpenChange={() => {}}>
			<PopoverTrigger asChild>
				<Box>
					<SearchInput
						size="lg"
						placeholder={placeholder}
						value={value}
						onChange={(e) => {
							onChange(e.target.value);
							setHoveredIndex(null);
						}}
						onKeyDown={handleKeyDown}
					/>
				</Box>
			</PopoverTrigger>
			<PopoverContent
				side="bottom"
				sideOffset={4}
				align="start"
				style={{ width: "var(--radix-popover-trigger-width)" }}
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<Box
					display="flex"
					flexDirection="column"
					py="2"
					overflow="auto"
					style={{ maxHeight: 240 }}
				>
					{suggestions.map((user, index) => (
						<Box
							key={user.email}
							display="flex"
							flexDirection="column"
							gap="2"
							px="12"
							py="8"
							rounded="sm"
							cursor="pointer"
							bg={hoveredIndex === index ? "bg.secondary" : "transparent"}
							onClick={() => handleSelect(user)}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							<Text fontSize="md" fontWeight="500" color="fg.default">
								{user.first} {user.last}
							</Text>
							<Text fontSize="sm" color="fg.secondary">
								{user.email}
							</Text>
						</Box>
					))}
				</Box>
			</PopoverContent>
		</Popover>
	);
}
