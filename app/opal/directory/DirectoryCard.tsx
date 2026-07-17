"use client";

import { useState } from "react";
import {
	Box,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Tooltip,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
	IconEllipsisSolid,
	IconPen,
	IconCopy as IconClone,
	IconTrashCan,
} from "@/app/lib/axiom-icons";
import Image from "next/image";
import { type VAU } from "@/app/opal/data/vaus";
import { TOOL_ICONS } from "@/app/opal/virtual-teammates/tool-icons";

const MAX_VISIBLE_TOOLS = 2;
const MAX_VISIBLE_TAGS = 3;

const TAG_STYLE: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	height: 24,
	padding: "0 10px",
	borderRadius: 999,
	background: "var(--ax-colors-bg-tertiary)",
	fontSize: 11,
	fontWeight: 400,
	letterSpacing: "0.3px",
	textTransform: "uppercase",
	color: "var(--ax-colors-fg-default)",
	whiteSpace: "nowrap",
	flexShrink: 0,
};

export function DirectoryCard({ vau, onSelect }: { vau: VAU; onSelect: (vau: VAU) => void }) {
	const [hovered, setHovered] = useState(false);
	const visibleTools = vau.tools.slice(0, MAX_VISIBLE_TOOLS);
	const overflowTools = vau.tools.length - visibleTools.length;

	const visibleTags = vau.tags.slice(0, MAX_VISIBLE_TAGS);
	const tagOverflow = vau.tags.length - visibleTags.length;

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor={hovered ? "border.accent" : "border.secondary"}
			rounded="xl"
			shadow={hovered ? "lg" : undefined}
			style={{
				padding: "20px",
				display: "flex",
				flexDirection: "column",
				gap: "16px",
				cursor: "pointer",
			}}
			onClick={() => onSelect(vau)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Header: avatar + name + templateName + tools */}
			<Box display="flex" gap="16" alignItems="center">
				<Box
				rounded="lg"
				style={{
					width: 64, height: 64, minWidth: 64,
					backgroundColor: vau.avatarBg,
					overflow: "hidden",
					flexShrink: 0,
				}}
			>
					<Image src={vau.avatar} alt={vau.name} width={64} height={64} unoptimized />
				</Box>
				<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
					<Text
						fontWeight="600"
						color="fg.default"
						style={{ fontSize: "20px", letterSpacing: "-0.35px", lineHeight: 1.1 }}
					>
						{vau.templateName}
					</Text>
					{/* Tool chips */}
					{visibleTools.length > 0 && (
						<Box display="flex" alignItems="center" gap="8" style={{ marginTop: 4 }}>
							<span style={{
								fontSize: 10,
								fontWeight: 500,
								letterSpacing: "0.5px",
								textTransform: "uppercase",
								color: "var(--ax-colors-fg-secondary)",
								whiteSpace: "nowrap",
								flexShrink: 0,
							}}>
								Tools used
							</span>
							<Box display="flex" alignItems="center" gap="4">
							{visibleTools.map((toolKey) => {
								const tool = TOOL_ICONS[toolKey];
								if (!tool) return null;
								return (
									<Tooltip key={toolKey} content={tool.name}>
										<Box
											rounded="md"
											border="1"
											borderColor="border.secondary"
											style={{
												width: 24, height: 24,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												color: tool.color,
												fontSize: "9px",
												fontWeight: 600,
												letterSpacing: "-0.2px",
												flexShrink: 0,
												overflow: "hidden",
											}}
										>
											{tool.textLabel
												? <span style={{ fontSize: 9, lineHeight: 1 }}>{tool.textLabel}</span>
												: tool.icon
											}
										</Box>
									</Tooltip>
								);
							})}
							{overflowTools > 0 && (
								<Box
									rounded="md"
									border="1"
									borderColor="border.secondary"
									style={{
										width: 24, height: 24,
										display: "flex", alignItems: "center", justifyContent: "center",
										color: "var(--ax-colors-fg-tertiary)",
										fontSize: "11px",
										fontWeight: 500,
										flexShrink: 0,
									}}
								>
									+{overflowTools}
								</Box>
							)}
							</Box>
						</Box>
					)}
				</Box>
			</Box>

			{/* Description */}
			<Text fontSize="md" color="fg.secondary" lineClamp="2">
				{vau.description}
			</Text>

			{/* Divider */}
			<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />

			{/* Examples + ellipsis menu */}
			<Box display="flex" alignItems="start" justifyContent="space-between" gap="12">
				<Box display="flex" gap="6" style={{ flex: 1, overflow: "hidden", alignItems: "center" }}>
					{visibleTags.map((tag) => (
						<span key={tag.label} style={TAG_STYLE}>{tag.label}</span>
					))}
					{tagOverflow > 0 && (
						<span style={TAG_STYLE}>+{tagOverflow}</span>
					)}
				</Box>
				<Box onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconEllipsisSolid size={16} />}
								aria-label="Teammate actions"
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
								<Box display="flex" alignItems="center" gap="8">
									<IconPen size={14} />
									Edit
								</Box>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
								<Box display="flex" alignItems="center" gap="8">
									<IconClone size={14} />
									Duplicate
								</Box>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={(e: React.MouseEvent) => e.stopPropagation()}>
								<Box display="flex" alignItems="center" gap="8" color="fg.error">
									<IconTrashCan size={14} />
									Delete
								</Box>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</Box>
			</Box>
		</Box>
	);
}
