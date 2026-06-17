import {
	IconBrandFigma,
	IconBrandSlack,
	IconBrandNotion,
	IconBrandAirtable,
	IconBrandGithub,
	IconBrandAsana,
	IconBrandJira,
	IconBrandTeams,
} from "@tabler/icons-react";
import { IconGoogle } from "@optimizely/axiom-icons";

export type ToolMeta = {
	icon: React.ReactNode;
	iconLg: React.ReactNode;
	color: string;
	name: string;
	textLabel?: string;
};

export const TOOL_ICONS: Record<string, ToolMeta> = {
	figma:      { icon: <IconBrandFigma size={14} />,    iconLg: <IconBrandFigma size={20} />,    color: "#9b59b6", name: "Figma" },
	google:     { icon: <IconGoogle size={14} />,        iconLg: <IconGoogle size={20} />,        color: "#4285F4", name: "Google Suite" },
	slack:      { icon: <IconBrandSlack size={14} />,    iconLg: <IconBrandSlack size={20} />,    color: "#4A154B", name: "Slack" },
	notion:     { icon: <IconBrandNotion size={14} />,   iconLg: <IconBrandNotion size={20} />,   color: "#000000", name: "Notion" },
	airtable:   { icon: <IconBrandAirtable size={14} />, iconLg: <IconBrandAirtable size={20} />, color: "#18BFFF", name: "Airtable" },
	github:     { icon: <IconBrandGithub size={14} />,   iconLg: <IconBrandGithub size={20} />,   color: "#24292e", name: "GitHub" },
	asana:      { icon: <IconBrandAsana size={14} />,    iconLg: <IconBrandAsana size={20} />,    color: "#F06A6A", name: "Asana" },
	jira:       { icon: <IconBrandJira size={14} />,     iconLg: <IconBrandJira size={20} />,     color: "#0052CC", name: "Jira" },
	teams:      { icon: <IconBrandTeams size={14} />,    iconLg: <IconBrandTeams size={20} />,    color: "#6264A7", name: "Microsoft Teams" },
	salesforce: { icon: null, iconLg: null, color: "#00A1E0", name: "Salesforce",                 textLabel: "SF" },
	hubspot:    { icon: null, iconLg: null, color: "#FF7A59", name: "HubSpot",                    textLabel: "HS" },
	"opti-cms": { icon: null, iconLg: null, color: "#0037FF", name: "Optimizely CMS",             textLabel: "CMS" },
	"opti-cmp": { icon: null, iconLg: null, color: "#0d46a0", name: "Content Marketing Platform", textLabel: "CMP" },
	"opti-web-experimentation": { icon: null, iconLg: null, color: "#4c1d95", name: "Web Experimentation", textLabel: "WEX" },
	"opti-odp": { icon: null, iconLg: null, color: "#17492b", name: "Optimizely Data Platform",   textLabel: "ODP" },
};
