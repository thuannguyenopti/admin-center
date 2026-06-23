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
} from "@/app/lib/axiom-icons";
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
			borderColor="border.tertiary"
			rounded="lg"
			className="vau-card"
			style={{ position: "relative", padding: "20px", cursor: "pointer", transition: "box-shadow 0.15s ease, border-color 0.15s ease", display: "flex", flexDirection: "column", gap: "16px" }}
			onClick={() => onSelect(vau)}
			onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--ax-shadows-lg)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ax-colors-border-accent)"; }}
			onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ax-colors-border-tertiary)"; }}
		>
			{/* Header: avatar + name + role */}
			<Box display="flex" gap="16" alignItems="start">
				<Box style={{ width: "64px", height: "64px", minWidth: "64px", overflow: "hidden", borderRadius: "12px", backgroundColor: vau.avatarBg }}>
					<Image src={vau.avatar} alt={vau.name} width={64} height={64} unoptimized />
				</Box>
				<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
					<Text fontWeight="600" color="fg.default" style={{ fontSize: "20px", letterSpacing: "-0.35px", lineHeight: "28px" }}>
						{vau.name}
					</Text>
					<Text fontSize="sm" color="fg.secondary">
						{vau.templateName}
					</Text>
				</Box>
			</Box>

			{/* Description */}
			<Text fontSize="sm" color="fg.secondary" lineClamp="3">
				{vau.description}
			</Text>

			{/* Example pills */}
			<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
				{visibleExamples.map((ex) => (
					<Pill key={ex.title} readOnly size="sm" bg="bg.secondary">
						<span style={{ marginRight: 4 }}>{ex.emoji}</span>
						{ex.title}
					</Pill>
				))}
				{exampleOverflow > 0 && (
					<Pill readOnly size="sm" bg="bg.secondary">+{exampleOverflow}</Pill>
				)}
			</Box>

			{/* Footer: connector chips + ellipsis menu */}
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Box display="flex" alignItems="center" gap="4">
					{visibleTools.map((toolKey) => {
						const tool = TOOL_ICONS[toolKey];
						if (!tool) return null;
						return (
							<Tooltip key={toolKey} content={tool.name}>
								<Box
									rounded="md"
									border="1"
									borderColor="border.tertiary"
									style={{
										width: "32px",
										height: "32px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: tool.color,
										fontSize: "11px",
										fontFamily: "Inter, sans-serif",
										fontWeight: 600,
										letterSpacing: "-0.2px",
										flexShrink: 0,
									}}
								>
									{tool.textLabel ? tool.textLabel : tool.icon}
								</Box>
							</Tooltip>
						);
					})}
					{overflowCount > 0 && (
						<Box
							rounded="md"
							border="1"
							borderColor="border.tertiary"
							style={{
								width: "32px",
								height: "32px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "var(--ax-colors-fg-tertiary)",
								fontSize: "12px",
								fontFamily: "Inter, sans-serif",
								fontWeight: 500,
								flexShrink: 0,
							}}
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
