"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Box, SearchInput, Tooltip, Disclosure, DisclosureTrigger, DisclosureContent } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconGripVertical, IconPlus, IconChevronRight, IconX } from "@tabler/icons-react";
import {
	STANDARD_FIELDS,
	LAYOUT_COMPONENTS,
	CONTENT_COMPONENTS,
} from "../data";
import { CreateFieldModal } from "./CreateFieldModal";
import type { FormFieldDef } from "../types";
import usePersistentState from "@/app/usePersistentState";

const TEXT_ITEM = { ...CONTENT_COMPONENTS.find((c) => c.id === "paragraph")!, name: "Paragraph" };
const SECTION_ITEM = LAYOUT_COMPONENTS[0];

function SidebarItem({
	item,
	selected,
	onToggleSelect,
	onDragStart,
	onDragEnd,
}: {
	item: {
		id: string;
		name: string;
		nodeType: string;
		typeLabel?: string;
		icon: React.ReactNode;
	};
	selected: boolean;
	onToggleSelect: (id: string) => void;
	onDragStart: (e: React.DragEvent, item: any) => void;
	onDragEnd: () => void;
}) {
	return (
		<div
			draggable
			onDragStart={(e) => onDragStart(e, item)}
			onDragEnd={onDragEnd}
			onClick={(e) => {
				if (e.metaKey || e.ctrlKey) {
					e.preventDefault();
					onToggleSelect(item.id);
				}
			}}
			style={{ cursor: "grab" }}
		>
			<Box
				p="8"
				display="flex"
				alignItems="center"
				gap="8"
				className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md"
				mx="8"
				style={{ background: selected ? "var(--ax-colors-bg-accent-subtle)" : undefined }}
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
	onDragStart: onDragStartBase,
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
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [multiSelectHintDismissed, setMultiSelectHintDismissed] = usePersistentState(
		"formBuilder.multiSelectHintDismissed",
		false,
	);

	const [customFieldsHovered, setCustomFieldsHovered] = useState(false);

	const toggleSelect = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	}, []);

	const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

	// Clear selection on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => { if (e.key === "Escape") clearSelection(); };
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [clearSelection]);

	// Wrap onDragStart to inject multi-field payload when multiple items are selected
	const onDragStart = useCallback((e: React.DragEvent, item: any) => {
		if (selectedIds.size > 1 && selectedIds.has(item.id)) {
			e.dataTransfer.setData("application/formbuilder/multiFields", JSON.stringify(Array.from(selectedIds)));
		}
		onDragStartBase(e, item);
	}, [selectedIds, onDragStartBase]);

	const filteredStandard = searchQuery
		? STANDARD_FIELDS.filter(
				(f) =>
					f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					f.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()),
		  )
		: STANDARD_FIELDS;

	const filteredCustom = searchQuery
		? customFields.filter(
				(f) =>
					f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					f.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()),
		  )
		: customFields;


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
				<Box px="12" pt="8" pb="8">
					<SearchInput
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search fields"
						style={{ width: "100%" }}
					/>
				</Box>

				{/* Multi-select hint — shown once until dismissed */}
				{!multiSelectHintDismissed && (
					<Box
						mx="12"
						mb="8"
						px="10"
						py="8"
						rounded="md"
						bg="bg.accent.subtle"
						display="flex"
						alignItems="start"
						gap="8"
					>
						<Text fontSize="xs" color="fg.secondary" style={{ flex: 1, lineHeight: 1.4 }}>
							Hold <strong>⌘</strong> to select multiple fields, then drag any to drop them all.
						</Text>
						<button
							onClick={() => setMultiSelectHintDismissed(true)}
							aria-label="Dismiss hint"
							style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--ax-colors-fg-tertiary)", display: "flex", flexShrink: 0, marginTop: 1 }}
						>
							<IconX size={12} />
						</button>
					</Box>
				)}

				{/* Standard fields */}
				<Disclosure defaultOpen>
					<Box
						display="flex"
						alignItems="center"
						px="8"
						className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md"
						mx="8"
					>
						<DisclosureTrigger style={{ flex: 1 }}>
							<Box py="8" display="flex" alignItems="center" gap="6" cursor="pointer">
								<Text fontSize="xs" fontWeight="600" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
									Standard Fields
								</Text>
							</Box>
						</DisclosureTrigger>
					</Box>
					<DisclosureContent>
						<Box display="flex" flexDirection="column" gap="4" pb="8">
							{filteredStandard.length === 0 ? (
								<Box px="16" pb="4">
									<Text fontSize="xs" color="fg.tertiary">No fields found.</Text>
								</Box>
							) : filteredStandard.map((item: any) => (
								<SidebarItem key={item.id} item={{ ...item, typeLabel: "System Field" }} selected={selectedIds.has(item.id)} onToggleSelect={toggleSelect} onDragStart={onDragStart} onDragEnd={clearSelection} />
							))}
						</Box>
					</DisclosureContent>
				</Disclosure>

				{/* Custom fields */}
				<Disclosure defaultOpen>
					<Box
						display="flex"
						alignItems="center"
						px="8"
						className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md"
						mx="8"
						onMouseEnter={() => setCustomFieldsHovered(true)}
						onMouseLeave={() => setCustomFieldsHovered(false)}
					>
						<DisclosureTrigger style={{ flex: 1 }}>
							<Box py="8" display="flex" alignItems="center" gap="6" cursor="pointer">
								<Text fontSize="xs" fontWeight="600" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
									Custom Fields
								</Text>
							</Box>
						</DisclosureTrigger>
						{customFieldsHovered && (
							<Tooltip content="Create new field">
								<button
									onClick={(e) => { e.stopPropagation(); setIsCreateFieldOpen(true); }}
									aria-label="Create new field"
									style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--ax-colors-fg-tertiary)", display: "flex", alignItems: "center", borderRadius: 4, flexShrink: 0 }}
								>
									<IconPlus size={14} />
								</button>
							</Tooltip>
						)}
					</Box>
					<DisclosureContent>
						<Box display="flex" flexDirection="column" gap="4" pb="8">
							{filteredCustom.length === 0 ? (
								<Box px="16" pb="4">
									<Text fontSize="xs" color="fg.tertiary">No custom fields yet.</Text>
								</Box>
							) : filteredCustom.map((item: any) => (
								<SidebarItem key={item.id} item={{ ...item, typeLabel: "" }} selected={selectedIds.has(item.id)} onToggleSelect={toggleSelect} onDragStart={onDragStart} onDragEnd={clearSelection} />
							))}
						</Box>
					</DisclosureContent>
				</Disclosure>
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
