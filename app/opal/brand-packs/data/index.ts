import type {BrandPack, CmpOrgChannel} from "../types";
import {cocaCola} from "./coca-cola";
import {fanta} from "./fanta";
import {sprite} from "./sprite";
import {minuteMaid} from "./minute-maid";

/**
 * The org's connected CMP publishing channels.
 * Mirrors what you'd see in CMP → Settings → Integrations → Website, CMS & Feed
 * plus the social accounts the team has connected.
 * In production this would be fetched from the CMP API.
 */
export const orgCmpChannels: CmpOrgChannel[] = [
	// Social
	{
		id: "cmp-linkedin",
		name: "LinkedIn",
		platform: "linkedin",
		type: "social",
		connected: true,
		channelCategory: "Social",
	},
	{
		id: "cmp-twitter",
		name: "Twitter / X",
		platform: "twitter",
		type: "social",
		connected: true,
		channelCategory: "Social",
	},
	{
		id: "cmp-instagram",
		name: "Instagram",
		platform: "instagram",
		type: "social",
		connected: true,
		channelCategory: "Social",
	},
	{
		id: "cmp-facebook",
		name: "Facebook",
		platform: "facebook",
		type: "social",
		connected: false,
		channelCategory: "Social",
	},
	// Web / Feed / CMS
	{
		id: "cmp-opti-cms",
		name: "Optimizely CMS 12",
		platform: "cms",
		type: "webhook",
		connected: true,
		channelCategory: "Web",
	},
	{
		id: "cmp-rss",
		name: "sample",
		platform: "rss",
		type: "feed",
		connected: true,
		channelCategory: "Web",
	},
	{
		id: "cmp-wordpress",
		name: "WordPress",
		platform: "wordpress",
		type: "feed",
		connected: false,
		channelCategory: "Web",
	},
	// Email
	{
		id: "cmp-marketo",
		name: "Marketo",
		platform: "marketo",
		type: "email",
		connected: true,
		channelCategory: "Email",
	},
	{
		id: "cmp-hubspot",
		name: "HubSpot",
		platform: "hubspot",
		type: "email",
		connected: false,
		channelCategory: "Email",
	},
	// Events (email can also route to events comms)
	{
		id: "cmp-events-marketo",
		name: "Marketo (Events)",
		platform: "marketo",
		type: "email",
		connected: true,
		channelCategory: "Events",
	},
];

export const brandPacks: BrandPack[] = [cocaCola, fanta, sprite, minuteMaid];

export const activePack = brandPacks.find((p) => p.status === "active")!;

export function getBrandPackById(id: string): BrandPack | undefined {
	return brandPacks.find((p) => p.id === id);
}
