"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, SearchInput, Tooltip } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconGripVertical, IconPlus } from "@tabler/icons-react";
import {
	STANDARD_FIELDS,
	LAYOUT_COMPONENTS,
	CONTENT_COMPONENTS,
} from "../data";
import { CreateFieldModal } from "./CreateFieldModal";
import type { FormFieldDef } from "../types";

const TEXT_ITEM = { ...CONTENT_COMPONENTS.find((c) => c.id === "paragraph")!, name: "Paragraph" };
const SECTION_ITEM = LAYOUT_COMPONENTS[0];

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

function LayoutItem({
	item,
	onDragStart,
}: {
	item: { id: string; name: string; nodeType: string; typeLabel?: string; icon: React.ReactNode };
	onDragStart: (e: React.DragEvent, item: any) => void;
}) {
	return (
		<div draggable onDragStart={(e) => onDragStart(e, item)} style={{ cursor: "grab" }}>
			<Box
				px="12"
				py="8"
				display="flex"
				alignItems="center"
				gap="8"
				className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md"
				mx="8"
				color="fg.secondary"
			>
				<Box display="flex" alignItems="center" justifyContent="center" style={{ flexShrink: 0, width: 16, height: 16 }}>
					{item.icon}
				</Box>
				<Text fontSize="sm" color="fg.secondary">{item.name}</Text>
				<Box flex="1" />
				<Box color="fg.tertiary">
					<IconGripVertical size={14} />
				</Box>
			</Box>
		</div>
	);
}

export function FormBuilderSidebar({
	onDragStart,
	customFields = [],
	onCreateField,
	onOpenOpal,
}: {
	onDragStart: (e: React.DragEvent, item: any) => void;
	customFields?: FormFieldDef[];
	onCreateField?: (field: FormFieldDef) => void;
	onOpenOpal?: () => void;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false);

	const filteredStandard = searchQuery
		? STANDARD_FIELDS.filter(
				(f) =>
					f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					f.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()),
		  )
		: STANDARD_FIELDS;


	return (
		<Box
			style={{ width: "280px", height: "100%", flexShrink: 0 }}
			borderR="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			bg="bg.default"
		>
			{/* Opal banner */}
			{onOpenOpal && (
				<Box p="12" pb="0">
					<button
						onClick={onOpenOpal}
						style={{
							width: "100%",
							display: "flex",
							alignItems: "center",
							gap: 10,
							padding: "10px 12px",
							borderRadius: 8,
							border: "1px solid var(--opal-border-secondary, #e2e6f0)",
							background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(157,116,245,0.06))",
							cursor: "pointer",
							fontFamily: "inherit",
							textAlign: "left",
						}}
					>
						<Image src="/opal-orb.png" alt="" width={20} height={20} />
						<Box style={{ flex: 1, minWidth: 0 }}>
							<Text fontSize="sm" fontWeight="500" color="fg.default" style={{ display: "block" }}>
								Build with Opal
							</Text>
							<Text fontSize="xs" color="fg.tertiary">
								Describe your form and let Opal draft it
							</Text>
						</Box>
					</button>
				</Box>
			)}

			{/* Form Layout */}
			<Box>
				<Box px="16" pt="12" pb="8">
					<Text fontSize="xs" fontWeight="600" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
						Form Layout
					</Text>
				</Box>
				<Box display="flex" flexDirection="column" gap="2" pb="16">
					<LayoutItem item={TEXT_ITEM} onDragStart={onDragStart} />
					<LayoutItem item={SECTION_ITEM} onDragStart={onDragStart} />
				</Box>
			</Box>

			{/* Form fields */}
			<Box flex="1" overflowY="auto" display="flex" flexDirection="column">
				<Box px="16" pt="12" pb="8" display="flex" alignItems="center" justifyContent="space-between">
					<Text fontSize="xs" fontWeight="600" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
						Form Fields
					</Text>
					<Tooltip content="Create new field">
						<button
							onClick={() => setIsCreateFieldOpen(true)}
							aria-label="Create new field"
							style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--ax-colors-fg-tertiary)", display: "flex", alignItems: "center", borderRadius: 4 }}
						>
							<IconPlus size={14} />
						</button>
					</Tooltip>
				</Box>

				<Box px="12" pb="8">
					<SearchInput
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search fields"
						style={{ width: "100%" }}
					/>
				</Box>

				{/* Standard fields */}
				<Box display="flex" flexDirection="column" gap="4" pb="8">
					{filteredStandard.map((item: any) => (
						<SidebarItem key={item.id} item={{ ...item, typeLabel: "" }} onDragStart={onDragStart} />
					))}
				</Box>

			</Box>

			<CreateFieldModal
				open={isCreateFieldOpen}
				onSave={(field) => {
					onCreateField?.(field);
					setIsCreateFieldOpen(false);
				}}
				onCancel={() => setIsCreateFieldOpen(false)}
			/>
		</Box>
	);
}
