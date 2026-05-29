import {IconStore, IconListTree} from "@optiaxiom/icons";

export const connectPlatformNav = [
	{
		label: "Marketplace",
		url: "/connect-platform/marketplace",
		highlight: "/connect-platform/marketplace",
		icon: <IconStore />,
	},
	{
		label: "Graph",
		url: "/connect-platform/graph/dashboard",
		highlight: "/connect-platform/graph",
		icon: <IconListTree />,
		children: [
			{label: "Dashboard", url: "/connect-platform/graph/dashboard"},
			{label: "Browse", url: "/connect-platform/graph/browse"},
			{label: "Sync Log", url: "/connect-platform/graph/sync-log"},
			{label: "Settings", url: "/connect-platform/graph/settings"},
		],
	},
];
