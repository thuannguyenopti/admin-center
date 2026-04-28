"use client";

import { useState } from "react";
import { Box, Button, SearchInput, Disclosure, DisclosureTrigger, DisclosureContent } from "@optiaxiom/react";
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
	onOpenOpal,
}: {
	onDragStart: (e: React.DragEvent, item: any) => void;
	onOpenOpal?: () => void;
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
			style={{ width: "280px", height: "100%", flexShrink: 0 }}
			borderR="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			bg="bg.default"
		>
			{/* Opal banner */}
			{onOpenOpal && (
				<Box
					style={{
						backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 221 104\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%25\\' width=\\'100%25\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(39.84 15.036 -31.951 36.057 9.7721 19.377)\\'><stop stop-color=\\'rgba(245,243,255,1)\\' offset=\\'0.052495\\'/><stop stop-color=\\'rgba(229,239,255,1)\\' offset=\\'0.61\\'/><stop stop-color=\\'rgba(221,214,254,1)\\' offset=\\'0.85\\'/></radialGradient></defs></svg>')",
						backgroundSize: "cover",
						borderRadius: "8px",
						margin: "8px",
						padding: "12px 16px",
						display: "flex",
						flexDirection: "column",
						gap: "12px",
					}}
				>
					<p style={{
						margin: 0,
						fontSize: "14px",
						fontWeight: 400,
						lineHeight: "20px",
						letterSpacing: "-0.1px",
						color: "#2e3442",
						fontFamily: "Inter, sans-serif",
					}}>
						Build form with Opal
					</p>
					<button
						onClick={onOpenOpal}
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "4px",
							padding: "4px 8px",
							background: "linear-gradient(162.99deg, #392ecf 16.23%, #7740ec 85.41%)",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
							alignSelf: "flex-start",
						}}
					>
						<img src="/opal.png" alt="" width={16} height={16} style={{ borderRadius: "53px", flexShrink: 0 }} />
						<span style={{
							fontSize: "12px",
							fontWeight: 400,
							lineHeight: "20px",
							color: "#fff",
							fontFamily: "Inter, sans-serif",
							whiteSpace: "nowrap",
						}}>
							Build form
						</span>
					</button>
				</Box>
			)}

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
								<DisclosureTrigger style={{ flex: 1, paddingLeft: "8px" }}>
									<Box
										py="12"
										pr="12"
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
