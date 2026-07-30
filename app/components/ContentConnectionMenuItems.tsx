import React from "react";
import type {MenuOption} from "@optiaxiom/react";
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

	return items;
}
