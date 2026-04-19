"use client";

import { useState } from "react";
import { Box, SearchInput, Disclosure, DisclosureTrigger, DisclosureContent } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
	IconGripVertical,
	IconPlus,
	IconSearch,
	IconX,
} from "@tabler/icons-react";
import {
	WORK_REQUEST_FIELDS,
	LAYOUT_COMPONENTS,
	CONTENT_COMPONENTS,
} from "../data";

function SidebarItem({
	item,
	onDragStart,
}: {
	item: {
		id: string;
		name: string;
		nodeType: string;
		typeLabel?: string;
		icon: React.ReactNode;
	};
	onDragStart: (e: React.DragEvent, item: any) => void;
}) {
	return (
		<div draggable onDragStart={(e) => onDragStart(e, item)} style={{ cursor: "grab" }}>
			<Box
				p="8"
				display="flex"
				alignItems="center"
				gap="8"
				className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md"
				mx="8"
			>
				<Box
					p="6"
					rounded="sm"
					bg="bg.accent.subtle"
					color="fg.default"
					display="flex"
					alignItems="center"
					justifyContent="center"
					style={{ flexShrink: 0 }}
				>
					{item.icon}
				</Box>
				<Box flex="1" style={{ minWidth: 0 }}>
					<Text fontSize="sm">{item.name}</Text>
					{item.typeLabel && (
						<Text fontSize="xs" color="fg.tertiary" style={{ display: "block" }}>
							{item.typeLabel}
						</Text>
					)}
				</Box>
				<Box color="fg.tertiary">
					<IconGripVertical size={14} />
				</Box>
			</Box>
		</div>
	);
}

export function FormBuilderSidebar({
	onDragStart,
}: {
	onDragStart: (e: React.DragEvent, item: any) => void;
}) {
	const [isSearching, setIsSearching] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredFields = searchQuery
		? WORK_REQUEST_FIELDS.filter(
				(f) =>
					f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					f.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()),
		  )
		: WORK_REQUEST_FIELDS;

	const sections = [
		{ label: "Layout",  items: LAYOUT_COMPONENTS, showPlus: false },
		{ label: "Fields",  items: filteredFields,     showPlus: true  },
		{ label: "Content", items: CONTENT_COMPONENTS, showPlus: false },
	];

	return (
		<Box
			style={{ width: "280px", height: "100%" }}
			borderR="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			bg="bg.default"
		>
			{/* Header */}
			<Box p="16" borderB="1" borderColor="border.tertiary">
				{isSearching ? (
					<Box display="flex" alignItems="center" gap="8">
						<SearchInput
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search components..."
							autoFocus
							style={{ flex: 1 }}
						/>
						<button
							onClick={() => {
								setIsSearching(false);
								setSearchQuery("");
							}}
							style={{
								background: "none",
								border: "none",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								color: "var(--ax-colors-fg-tertiary)",
								padding: "2px",
							}}
							aria-label="Close search"
						>
							<IconX size={16} />
						</button>
					</Box>
				) : (
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						cursor="pointer"
						onClick={() => setIsSearching(true)}
					>
						<Text fontWeight="700">Components</Text>
						<IconSearch size={16} color="var(--ax-colors-fg-tertiary)" />
					</Box>
				)}
			</Box>

			{/* Component list */}
			<Box flex="1" overflowY="auto">
				{sections.map(({ label, items, showPlus }) => {
					if (searchQuery && label === "Layout") return null;
					return (
						<Disclosure key={label} defaultOpen>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
							>
								<DisclosureTrigger style={{ flex: 1 }}>
									<Box
										p="12"
										display="flex"
										alignItems="center"
										cursor="pointer"
									>
										<Text fontWeight="500">{label}</Text>
									</Box>
								</DisclosureTrigger>
								{showPlus && (
									<button
										onClick={(e) => e.stopPropagation()}
										style={{
											background: "none",
											border: "none",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											color: "var(--ax-colors-fg-tertiary)",
											padding: "2px 12px 2px 4px",
											borderRadius: "4px",
										}}
										aria-label="Add new field"
									>
										<IconPlus size={14} />
									</button>
								)}
							</Box>
							<DisclosureContent>
								<Box display="flex" flexDirection="column" gap="4" pb="8">
									{items.map((item: any) => (
										<SidebarItem
											key={item.id}
											item={item}
											onDragStart={onDragStart}
										/>
									))}
								</Box>
							</DisclosureContent>
						</Disclosure>
					);
				})}
			</Box>
		</Box>
	);
}
