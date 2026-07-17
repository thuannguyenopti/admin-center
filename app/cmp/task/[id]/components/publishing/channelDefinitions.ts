export type ChannelDefinition = {
	id: string;
	name: string;
	group: string;
	icon: "server" | "twitter" | "wordpress" | "youtube" | "facebook" | "webhook";
};

export const channelDefinitions: ChannelDefinition[] = [
	{ id: "cms-12", name: "CMS", group: "SaaS CMS Publishing Webhook", icon: "server" },
	{ id: "rl-webhook", name: "RL Webhook", group: "RL Webhook", icon: "webhook" },
	{ id: "twitter-moseybank", name: "@MoseyBank", group: "Twitter", icon: "twitter" },
	{ id: "twitter-opticmp", name: "@opticmpdemouser", group: "Twitter", icon: "twitter" },
	{ id: "wordpress-moseybank", name: "Mosey Bank", group: "WordPress", icon: "wordpress" },
	{ id: "wordpress-azure", name: "WordPress on Azure", group: "WordPress", icon: "wordpress" },
	{ id: "wordpress-v2-sa", name: "Optimizely SA Demo", group: "WordPress V2", icon: "wordpress" },
	{ id: "wordpress-v2-demo", name: "WordPress Demo", group: "WordPress V2", icon: "wordpress" },
	{ id: "youtube-opticmp", name: "Optimizely CMP", group: "YouTube", icon: "youtube" },
	{ id: "facebook-moseybank", name: "Mosey Bank Page", group: "Facebook", icon: "facebook" },
];

export function getChannelDef(channelTypeId: string): ChannelDefinition | undefined {
	return channelDefinitions.find((c) => c.id === channelTypeId);
}

/** Group channel definitions by their group field */
export function getGroupedChannels(): Map<string, ChannelDefinition[]> {
	const groups = new Map<string, ChannelDefinition[]>();
	for (const ch of channelDefinitions) {
		const list = groups.get(ch.group) || [];
		list.push(ch);
		groups.set(ch.group, list);
	}
	return groups;
}
