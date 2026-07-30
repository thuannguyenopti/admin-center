import type {Version} from "@/app/opal/agents/setup/components/VersionHistory";

export type {Version};

export const VERSIONS: Version[] = [
	{
		id: "v3",
		version: "V3",
		mode: "agent",
		timestamp: "2h ago",
		author: "Opal",
		authorInitials: "O",
		isCurrent: true,
	},
	{
		id: "v2",
		version: "V2",
		mode: "agent",
		timestamp: "Yesterday",
		author: "Opal",
		authorInitials: "O",
		isCurrent: false,
	},
	{
		id: "v1",
		version: "V1",
		mode: "human",
		timestamp: "3 days ago",
		author: "Jamie S.",
		authorInitials: "JS",
		isCurrent: false,
	},
];
