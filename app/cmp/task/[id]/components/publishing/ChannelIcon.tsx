"use client";

<<<<<<< HEAD
import {
	IconBrandTwitter,
	IconBrandWordpress,
	IconBrandYoutube,
	IconBrandFacebook,
	IconServer,
	IconWebhook,
} from "@tabler/icons-react";
=======
import {IconBrandTwitter, IconBrandWordpress, IconBrandYoutube, IconBrandFacebook, IconServer, IconWebhook} from "@/app/lib/axiom-icons";
>>>>>>> origin/main
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
