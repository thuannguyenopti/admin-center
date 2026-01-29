"use client";

import {Box, Sidebar, NavBody, NavItem, Nav, Separator} from "@optiaxiom/react";
import {extensions} from "@/app/extensions/registry";

export type RightToolbarTool = string;

interface RightToolbarProps {
	activeTool?: RightToolbarTool | null;
	onToggleTool?: (tool: RightToolbarTool) => void;
}

export default function RightToolbar({activeTool, onToggleTool}: RightToolbarProps) {
	return (
		<Sidebar className="h-full" expanded={false}>
			<Nav>
				<NavBody pt="0" className="!-mt-2">
					{extensions.map((item, index) =>
						item.type === "separator" ? (
							<Box key={`separator-${index}`} px="12" py="4">
								<Separator />
							</Box>
						) : (
							<NavItem
								key={item.id}
								onClick={() => item.id && onToggleTool?.(item.id)}
								aria-label={item.label || ""}
								icon={item.icon}
								active={activeTool === item.id}
							>
								{item.label}
							</NavItem>
						)
					)}
				</NavBody>
			</Nav>
		</Sidebar>
	);
}
