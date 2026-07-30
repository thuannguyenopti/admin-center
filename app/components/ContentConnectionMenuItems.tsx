import React from "react";
<<<<<<< HEAD
import {Box, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator} from "@optiaxiom/react";
=======
import type {MenuOption} from "@optiaxiom/react";
>>>>>>> origin/main
import {IconLink, IconLinkSlash as IconUnlink} from "@optimizely/axiom-icons";

interface ContentConnectionMenuOptionsArgs {
	onConnectContent?: () => void;
	onDisconnectContent?: () => void;
	hasConnection?: boolean;
	compatibleInstancesCount?: number;
}

/** Returns the Axiom Menu `options` entries for the "Content" section of the page
 *  context menu (Connect / Change / Disconnect connected content). Returns an empty
 *  array when there's no relevant connection state — caller can spread unconditionally. */
export function contentConnectionMenuOptions({
	onConnectContent,
	onDisconnectContent,
	hasConnection,
	compatibleInstancesCount,
}: ContentConnectionMenuOptionsArgs): MenuOption[] {
	if (!onConnectContent && !hasConnection) return [];

	const items: MenuOption[] = [];

	if (onConnectContent) {
		const disabled = !hasConnection && compatibleInstancesCount === 0;
		items.push({
			label: hasConnection ? "Change connected content..." : "Connect content...",
			addon: <IconLink size={16} />,
			execute: onConnectContent,
			group: {label: "Content", separator: true},
			disabledReason: disabled ? "No compatible content available to connect" : undefined,
		});
	}

	if (hasConnection && onDisconnectContent) {
		items.push({
			label: "Disconnect content",
			addon: <IconUnlink size={16} />,
			intent: "danger",
			execute: onDisconnectContent,
			group: {label: "Content", separator: true},
		});
	}

<<<<<<< HEAD
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
=======
	return items;
>>>>>>> origin/main
}
