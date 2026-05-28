import React from "react";
import {Box, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator} from "@optiaxiom/react";
import {IconLink, IconRefresh, IconUnlink} from "@tabler/icons-react";

interface ContentConnectionMenuItemsProps {
	onConnectContent?: () => void;
	onSyncContent?: () => void;
	onDisconnectContent?: () => void;
	hasConnection?: boolean;
	compatibleInstancesCount?: number;
}

export default function ContentConnectionMenuItems({
	onConnectContent,
	onSyncContent,
	onDisconnectContent,
	hasConnection,
	compatibleInstancesCount,
}: ContentConnectionMenuItemsProps) {
	// Only render if there's any content connection functionality
	if (!onConnectContent && !hasConnection) {
		return null;
	}

	return (
		<>
			<DropdownMenuLabel>Content</DropdownMenuLabel>

			{/* Connect / Change connected content */}
			{onConnectContent && (
				<DropdownMenuItem
					onSelect={onConnectContent}
					disabled={!hasConnection && compatibleInstancesCount === 0}
				>
					<Box display="flex" alignItems="center" gap="8">
						<IconLink size={16} />
						{hasConnection ? "Change connected content..." : "Connect content..."}
					</Box>
				</DropdownMenuItem>
			)}

			{/* Sync content - only show if connected */}
			{hasConnection && onSyncContent && (
				<DropdownMenuItem onSelect={onSyncContent}>
					<Box display="flex" alignItems="center" gap="8">
						<IconRefresh size={16} />
						Sync content
					</Box>
				</DropdownMenuItem>
			)}

			{/* Disconnect - only show if connected */}
			{hasConnection && onDisconnectContent && (
				<DropdownMenuItem
					onSelect={onDisconnectContent}
					intent="danger"
				>
					<Box display="flex" alignItems="center" gap="8">
						<IconUnlink size={16} />
						Disconnect content
					</Box>
				</DropdownMenuItem>
			)}

			<DropdownMenuSeparator />
		</>
	);
}
