"use client";

import {Box, Text, Badge} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconFile,
	IconFolder,
	IconFolderOpen,
	IconFileLines,
	IconGrid,
} from "@optiaxiom/icons";
import {DS_ROW_STYLES, type DSComponent} from "../../data/designSystem";

export function DSFileTree({
	selectedId,
	onSelect,
	componentsExpanded,
	onToggleComponents,
	componentList,
}: {
	selectedId: string;
	onSelect: (id: string) => void;
	componentsExpanded: boolean;
	onToggleComponents: () => void;
	componentList: DSComponent[];
}) {
	return (
		<>
			<style>{DS_ROW_STYLES}</style>
			<Box display="flex" flexDirection="column" gap="2">
				{/* Overview */}
				<Box
					display="flex"
					alignItems="center"
					gap="6"
					py="4"
					px="24"
					className={`ds-row${selectedId === "ds-overview" ? " ds-row-sel" : ""}`}
					onClick={() => onSelect("ds-overview")}
				>
					<IconGrid
						filled={selectedId === "ds-overview"}
						size={16}
						color={
							selectedId === "ds-overview"
								? "var(--ax-colors-fg-default)"
								: "var(--ax-colors-fg-tertiary)"
						}
						style={{flexShrink: 0}}
					/>
					<Text
						fontSize="md"
						fontWeight={selectedId === "ds-overview" ? "500" : "400"}
						color={selectedId === "ds-overview" ? "fg.default" : "fg.secondary"}
						style={{flex: 1}}
					>
						Overview
					</Text>
				</Box>

				{/* Design Tokens */}
				<Box
					display="flex"
					alignItems="center"
					gap="6"
					py="4"
					pr="6"
					pl="24"
					className={`ds-row${selectedId === "ds-tokens" ? " ds-row-sel" : ""}`}
					onClick={() => onSelect("ds-tokens")}
				>
					<IconFile
						size={16}
						color={
							selectedId === "ds-tokens"
								? "var(--ax-colors-fg-default)"
								: "var(--ax-colors-fg-tertiary)"
						}
						style={{flexShrink: 0}}
						filled={selectedId === "ds-tokens"}
					/>
					<Text
						fontSize="md"
						fontWeight={selectedId === "ds-tokens" ? "500" : "400"}
						color={selectedId === "ds-tokens" ? "fg.default" : "fg.secondary"}
						style={{flex: 1}}
					>
						Design Tokens
					</Text>
					<Badge intent="neutral">JSON</Badge>
				</Box>

				{/* Guidelines */}
				<Box
					display="flex"
					alignItems="center"
					gap="6"
					py="4"
					pl="24"
					pr="6"
					className={`ds-row${selectedId === "ds-guidelines" ? " ds-row-sel" : ""}`}
					onClick={() => onSelect("ds-guidelines")}
				>
					<IconFileLines
						filled={selectedId === "ds-guidelines"}
						size={16}
						color={
							selectedId === "ds-guidelines"
								? "var(--ax-colors-fg-default)"
								: "var(--ax-colors-fg-tertiary)"
						}
						style={{flexShrink: 0}}
					/>
					<Text
						fontSize="md"
						fontWeight={selectedId === "ds-guidelines" ? "500" : "400"}
						color={selectedId === "ds-guidelines" ? "fg.default" : "fg.secondary"}
						style={{
							flex: 1,
							minWidth: 0,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						Design System Guidelines
					</Text>
					<Badge intent="neutral">MD</Badge>
				</Box>

				{/* Components folder */}
				<Box>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						py="4"
						pl="4"
						pr="6"
						className="ds-row"
						onClick={onToggleComponents}
					>
						<IconAngleDown
							size={16}
							color="var(--ax-colors-fg-tertiary)"
							style={{
								transform: componentsExpanded ? "rotate(0deg)" : "rotate(-90deg)",
								transition: "transform 0.15s",
								flexShrink: 0,
							}}
						/>
						{componentsExpanded ? (
							<IconFolderOpen
								size={16}
								color="var(--ax-colors-fg-tertiary)"
								style={{flexShrink: 0}}
							/>
						) : (
							<IconFolder
								size={16}
								color="var(--ax-colors-fg-tertiary)"
								style={{flexShrink: 0}}
							/>
						)}
						<Text fontSize="md" color="fg.default" style={{flex: 1}}>
							Components
						</Text>
						<Badge intent="neutral">{componentList.length}</Badge>
					</Box>

					{componentsExpanded &&
						componentList.map((comp) => {
							const isSel = selectedId === comp.id;
							return (
								<Box
									key={comp.id}
									display="flex"
									alignItems="center"
									gap="6"
									py="4"
									pr="6"
									pl="24"
									mt="2"
									className={`ds-row${isSel ? " ds-row-sel" : ""}`}
									onClick={() => onSelect(comp.id)}
								>
									<IconFileLines
										size={16}
										color={
											isSel
												? "var(--ax-colors-fg-default)"
												: "var(--ax-colors-fg-tertiary)"
										}
										style={{flexShrink: 0}}
										filled={isSel}
									/>
									<Text
										fontSize="md"
										fontWeight={isSel ? "500" : "400"}
										color={isSel ? "fg.default" : "fg.secondary"}
										style={{
											flex: 1,
											minWidth: 0,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{comp.label}
									</Text>
									<Badge>MD</Badge>
								</Box>
							);
						})}
				</Box>
			</Box>
		</>
	);
}
