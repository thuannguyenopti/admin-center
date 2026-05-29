"use client";

import {
	Box,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Tooltip,
} from "@optiaxiom/react";
import { Pill } from "@optiaxiom/react/unstable";
import { Text } from "@/app/components/Text";
import {
	IconEllipsisSolid,
	IconPen,
	IconClone,
	IconTrashCan,
} from "@optiaxiom/icons";
import Image from "next/image";
import { DEFAULT_VAU_EXAMPLES, type VAU } from "@/app/opal/data/vaus";
import { TOOL_ICONS } from "./tool-icons";

const MAX_VISIBLE_TOOLS = 4;
const MAX_VISIBLE_EXAMPLES = 5;

export function VAUCard({ vau, onSelect }: { vau: VAU; onSelect: (vau: VAU) => void }) {
	const visibleTools = vau.tools.slice(0, MAX_VISIBLE_TOOLS);
	const overflowCount = vau.tools.length - visibleTools.length;

	const examples = vau.examples ?? DEFAULT_VAU_EXAMPLES;
	const visibleExamples = examples.slice(0, MAX_VISIBLE_EXAMPLES);
	const exampleOverflow = examples.length - visibleExamples.length;

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.secondary"
			rounded="lg"
			p="20"
			display="flex"
			flexDirection="column"
			gap="16"
			className="vau-card"
			style={{ position: "relative", cursor: "pointer" }}
			onClick={() => onSelect(vau)}
		>
			{/* Header: avatar + name + role */}
			<Box display="flex" gap="16" alignItems="start">
				<Box
					rounded="lg"
					style={{ width: "64px", height: "64px", minWidth: "64px", overflow: "hidden", backgroundColor: vau.avatarBg }}
				>
					<Image src={vau.avatar} alt={vau.name} width={64} height={64} unoptimized />
				</Box>
				<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
					<Text fontSize="xl" fontWeight="600" color="fg.default" style={{ letterSpacing: "0.4px", lineHeight: "22px" }}>
						{vau.name}
					</Text>
					<Text fontSize="sm" color="fg.secondary" style={{ fontFamily: "var(--ax-fonts-mono, 'Roboto Mono', monospace)", lineHeight: "15px", letterSpacing: "0.36px", textTransform: "uppercase" }}>
						{vau.templateName}
					</Text>
				</Box>
			</Box>

			{/* Description */}
			<Text fontSize="sm" color="fg.secondary" lineClamp="3">
				{vau.description}
			</Text>

			{/* Example pills */}
			<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
				{visibleExamples.map((ex) => (
					<Pill
						key={ex.title}
						readOnly
						size="sm"
						bg="bg.tertiary"
						color="fg.default"
						fontSize="xs"
						rounded="full"
						style={{ fontFamily: "var(--ax-fonts-mono, 'Roboto Mono', monospace)", letterSpacing: "0.3px", textTransform: "uppercase" }}
					>
						{ex.emoji} {ex.title}
					</Pill>
				))}
				{exampleOverflow > 0 && (
					<Pill
						readOnly
						size="sm"
						bg="bg.tertiary"
						color="fg.default"
						fontSize="xs"
						rounded="full"
						style={{ fontFamily: "var(--ax-fonts-mono, 'Roboto Mono', monospace)", letterSpacing: "0.3px" }}
					>
						+{exampleOverflow}
					</Pill>
				)}
			</Box>

			{/* Divider — mt:auto pushes divider + footer to the bottom of the card */}
			<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", width: "100%", marginTop: "auto" }} />

			{/* Footer: connector chips + ellipsis menu */}
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Box display="flex" alignItems="center" gap="4">
					{visibleTools.map((toolKey) => {
						const tool = TOOL_ICONS[toolKey];
						if (!tool) return null;
						return (
							<Tooltip key={toolKey} content={tool.name}>
								<Box
									border="1"
									borderColor="border.secondary"
									rounded="xl"
									px="8"
									py="6"
									display="flex"
									alignItems="center"
									justifyContent="center"
									style={{ width: "32px", height: "32px", color: tool.color, fontSize: "11px", fontWeight: 600, letterSpacing: "-0.2px", flexShrink: 0 }}
								>
									{tool.textLabel ? tool.textLabel : tool.icon}
								</Box>
							</Tooltip>
						);
					})}
					{overflowCount > 0 && (
						<Box
							border="1"
							borderColor="border.secondary"
							rounded="xl"
							px="8"
							py="6"
							display="flex"
							alignItems="center"
							justifyContent="center"
							color="fg.tertiary"
							fontSize="sm"
							style={{ width: "32px", height: "32px", fontWeight: 500, flexShrink: 0 }}
						>
							+{overflowCount}
						</Box>
					)}
				</Box>
				<Box onClick={(e) => e.stopPropagation()}>
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
