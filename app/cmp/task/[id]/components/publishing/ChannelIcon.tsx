"use client";

import {
	IconBrandTwitter,
	IconBrandWordpress,
	IconBrandYoutube,
	IconBrandFacebook,
	IconServer,
	IconWebhook,
} from "@tabler/icons-react";
import type { ChannelDefinition } from "./channelDefinitions";

const iconMap: Record<ChannelDefinition["icon"], typeof IconServer> = {
	server: IconServer,
	twitter: IconBrandTwitter,
	wordpress: IconBrandWordpress,
	youtube: IconBrandYoutube,
	facebook: IconBrandFacebook,
	webhook: IconWebhook,
};

export function ChannelIcon({ icon, size = 16 }: { icon: ChannelDefinition["icon"]; size?: number }) {
	const Icon = iconMap[icon];
	return <Icon size={size} />;
}
